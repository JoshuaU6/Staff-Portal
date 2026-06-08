import { Router, type IRouter, type Request, type Response } from "express";
import { clerkClient } from "@clerk/express";
import { db, usersTable, sql, isNull, eq } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const DEMO_ACCOUNTS = [
  { staffId: "MTC-CHAIR-001", email: "chairman@mtc-groups.com",   fullName: "A.S. Abba",          firstName: "A.S.",        lastName: "Abba",          role: "chairman"         },
  { staffId: "MTC-ICT-001",   email: "ict@mtc-groups.com",        fullName: "ICT Administrator",  firstName: "ICT",         lastName: "Administrator", role: "ict_admin"        },
  { staffId: "MTC-HR-001",    email: "hr@mtc-groups.com",         fullName: "HR Administrator",   firstName: "HR",          lastName: "Administrator", role: "hr_admin"         },
  { staffId: "MTC-COMP-001",  email: "compliance@mtc-groups.com", fullName: "Compliance Officer", firstName: "Compliance",  lastName: "Officer",       role: "compliance_admin" },
  { staffId: "MTC-AUD-001",   email: "auditor@mtc-groups.com",    fullName: "Internal Auditor",   firstName: "Internal",    lastName: "Auditor",       role: "auditor"          },
  { staffId: "MTC-DH-001",    email: "depthead@mtc-groups.com",   fullName: "Department Head",    firstName: "Department",  lastName: "Head",          role: "department_head"  },
  { staffId: "MTC-MGR-001",   email: "manager@mtc-groups.com",    fullName: "Team Manager",       firstName: "Team",        lastName: "Manager",       role: "manager"          },
  { staffId: "MTC-SUP-001",   email: "supervisor@mtc-groups.com", fullName: "Team Supervisor",    firstName: "Team",        lastName: "Supervisor",    role: "supervisor"       },
  { staffId: "MTC-STAFF-001", email: "staff@mtc-groups.com",      fullName: "Test Staff Member",  firstName: "Test",        lastName: "Staff",         role: "staff"            },
] as const;

router.get("/bootstrap", async (_req: Request, res: Response): Promise<void> => {
  try {
    const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);
    const total = row?.count ?? 0;
    if (total === 0) {
      res.json({ needed: true, partial: false, nullCount: 0 });
      return;
    }
    const [nullRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(usersTable)
      .where(isNull(usersTable.clerkUserId));
    const nullCount = nullRow?.count ?? 0;
    res.json({ needed: false, partial: nullCount > 0, nullCount });
  } catch (err) {
    logger.error({ err }, "Bootstrap status check failed");
    res.status(500).json({ error: "Failed to check bootstrap status" });
  }
});

/**
 * Get or create a Clerk account for an email address.
 * Always creates with a shared password — the Clerk instance requires one.
 * Users log in at /portal/login with: email address + shared password MTC@Portal2025!
 */
async function getOrCreateClerkUser(
  email: string,
  firstName: string,
  lastName: string,
): Promise<string | null> {
  let clerkId: string | null = null;
  let emailAddressId: string | null = null;

  try {
    const created = await clerkClient.users.createUser({
      emailAddress: [email],
      firstName,
      lastName,
      password: "MTC@Portal2025!",
      skipPasswordChecks: true,
    });
    clerkId = created.id;
    emailAddressId =
      created.emailAddresses.find((e) => e.emailAddress === email)?.id ?? null;
  } catch (_createErr: any) {
    // User already exists — look them up
    const found = await clerkClient.users.getUserList({ emailAddress: [email], limit: 1 });
    if (found.data.length > 0) {
      clerkId = found.data[0].id;
      emailAddressId =
        found.data[0].emailAddresses.find((e) => e.emailAddress === email)?.id ?? null;
    } else {
      logger.warn({ email }, "Bootstrap: Clerk createUser failed and no existing user found");
      return null;
    }
  }

  // Mark the email as verified so users can sign in without an OTP verification step
  if (emailAddressId) {
    try {
      await clerkClient.emailAddresses.updateEmailAddress(emailAddressId, {
        verified: true,
        primary: true,
      });
    } catch (verifyErr: any) {
      logger.warn({ verifyErr, email }, "Bootstrap: Could not mark email as verified");
    }
  }

  return clerkId;
}

/**
 * Resync — create Clerk accounts for existing DB users that have null clerk_user_id.
 * Safe to call multiple times (idempotent per account).
 */
router.post("/bootstrap/resync", async (_req: Request, res: Response): Promise<void> => {
  try {
    const unsynced = await db
      .select()
      .from(usersTable)
      .where(isNull(usersTable.clerkUserId));

    if (unsynced.length === 0) {
      res.json({ synced: 0, results: [] });
      return;
    }

    const results: { email: string; synced: boolean }[] = [];

    for (const user of unsynced) {
      const demo = DEMO_ACCOUNTS.find((a) => a.email === user.email);
      if (!demo) {
        results.push({ email: user.email, synced: false });
        continue;
      }
      const clerkUserId = await getOrCreateClerkUser(demo.email, demo.firstName, demo.lastName);
      if (clerkUserId) {
        await db.update(usersTable).set({ clerkUserId }).where(eq(usersTable.id, user.id));
        logger.info({ userId: user.id, email: user.email, clerkUserId }, "Bootstrap resync: Clerk account linked");
        results.push({ email: user.email, synced: true });
      } else {
        results.push({ email: user.email, synced: false });
      }
    }

    res.json({ synced: results.filter((r) => r.synced).length, results });
  } catch (err) {
    logger.error({ err }, "Bootstrap resync failed");
    res.status(500).json({ error: "Resync failed. Please try again." });
  }
});

router.post("/bootstrap", async (_req: Request, res: Response): Promise<void> => {
  try {
    const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);
    if ((row?.count ?? 0) > 0) {
      res.status(409).json({ error: "Portal is already configured." });
      return;
    }

    // Create Clerk accounts and collect their IDs
    const rows: {
      staffId: string; email: string; fullName: string;
      role: string; status: "active"; clerkUserId: string | null;
    }[] = [];

    for (const acct of DEMO_ACCOUNTS) {
      const clerkUserId = await getOrCreateClerkUser(acct.email, acct.firstName, acct.lastName);
      rows.push({
        staffId: acct.staffId,
        email: acct.email,
        fullName: acct.fullName,
        role: acct.role,
        status: "active",
        clerkUserId,
      });
    }

    const inserted = await db.insert(usersTable).values(rows).returning();
    logger.info({ count: inserted.length }, "Bootstrap: demo accounts seeded");

    res.status(201).json({
      seeded: inserted.length,
      accounts: inserted.map((u) => ({ id: u.id, email: u.email, role: u.role })),
    });
  } catch (err) {
    logger.error({ err }, "Bootstrap failed");
    res.status(500).json({ error: "Setup failed. Please try again." });
  }
});

/**
 * Reset Clerk — delete all password-protected Clerk accounts and null out
 * clerkUserId so users can sign in via email OTP and auto-link on next login.
 */
router.post("/bootstrap/reset-clerk", async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db
      .select({ id: usersTable.id, email: usersTable.email, clerkUserId: usersTable.clerkUserId })
      .from(usersTable);

    const withClerk = rows.filter((r) => r.clerkUserId != null);

    let deleted = 0;
    for (const user of withClerk) {
      try {
        await clerkClient.users.deleteUser(user.clerkUserId!);
        deleted++;
      } catch (err) {
        logger.warn({ err, email: user.email }, "Bootstrap reset: could not delete Clerk user (may not exist)");
      }
      await db.update(usersTable).set({ clerkUserId: null }).where(eq(usersTable.id, user.id));
    }

    logger.info({ deleted, total: withClerk.length }, "Bootstrap reset: Clerk accounts cleared");
    res.json({ reset: withClerk.length, deleted });
  } catch (err) {
    logger.error({ err }, "Bootstrap reset-clerk failed");
    res.status(500).json({ error: "Reset failed. Please try again." });
  }
});

export default router;
