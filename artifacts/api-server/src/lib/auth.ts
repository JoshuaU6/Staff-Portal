import { getAuth, clerkClient } from "@clerk/express";
import { type Request, type Response, type NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "@workspace/db";
import { logger } from "./logger";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const auth = getAuth(req);
  const clerkUserId = auth?.userId;

  if (!clerkUserId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  let [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, clerkUserId));

  // Auto-link: if no DB record found by clerkUserId, try matching by email
  // This links newly registered Clerk accounts to pre-created staff records
  if (!user) {
    try {
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      const primaryEmail = clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId,
      )?.emailAddress;

      if (primaryEmail) {
        const [unlinked] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, primaryEmail));

        if (unlinked && unlinked.clerkUserId == null) {
          [user] = await db
            .update(usersTable)
            .set({ clerkUserId })
            .where(eq(usersTable.id, unlinked.id))
            .returning();
          logger.info({ userId: unlinked.id, clerkUserId }, "Auto-linked Clerk account to staff record");
        }
      }
    } catch (err) {
      logger.warn({ err, clerkUserId }, "Clerk user lookup failed during auto-link");
    }
  }

  if (!user) {
    res.status(401).json({ error: "Staff account not found" });
    return;
  }

  if (user.status !== "active") {
    const messages: Record<string, string> = {
      pending:  "Your account is pending approval. Please contact your ICT Administrator.",
      suspended: "Your account has been suspended. Please contact your ICT Administrator.",
      archived: "Your account has been deactivated.",
    };
    res.status(403).json({ error: messages[user.status] ?? "Account is not active" });
    return;
  }

  (req as any).staffUser = user;
  next();
};

const ADMIN_ROLES = ["chairman", "ict_admin", "hr_admin"];
const COMPLIANCE_ROLES = [...ADMIN_ROLES, "compliance_admin"];
const AUDITOR_ROLES = [...COMPLIANCE_ROLES, "auditor"];
// Sessions and alerts are read-only for auditor but NOT accessible by compliance_admin
const SESSIONS_ALERTS_READ_ROLES = [...ADMIN_ROLES, "auditor"];

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  await requireAuth(req, res, async () => {
    const user = (req as any).staffUser;
    if (!ADMIN_ROLES.includes(user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  });
};

export const requireChairman = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  await requireAuth(req, res, async () => {
    const user = (req as any).staffUser;
    if (user.role !== "chairman") {
      res.status(403).json({ error: "Chairman access required" });
      return;
    }
    next();
  });
};

export const requireComplianceAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  await requireAuth(req, res, async () => {
    const user = (req as any).staffUser;
    if (!COMPLIANCE_ROLES.includes(user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  });
};

export const requireAuditor = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  await requireAuth(req, res, async () => {
    const user = (req as any).staffUser;
    if (!AUDITOR_ROLES.includes(user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  });
};

// Sessions and security-alerts reads: admin + auditor only (compliance_admin excluded)
export const requireSessionsAlertsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  await requireAuth(req, res, async () => {
    const user = (req as any).staffUser;
    if (!SESSIONS_ALERTS_READ_ROLES.includes(user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  });
};

export async function logAuditEvent(
  actorUserId: number | null,
  eventType: string,
  targetType: string | null,
  targetId: number | null,
  metadata?: Record<string, unknown>,
) {
  try {
    const { auditLogsTable } = await import("@workspace/db");
    await db.insert(auditLogsTable).values({
      actorUserId,
      eventType,
      targetType,
      targetId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });
  } catch (err) {
    logger.error({ err }, "Failed to write audit log");
  }
}
