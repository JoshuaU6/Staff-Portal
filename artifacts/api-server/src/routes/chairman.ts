import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable, sessionsTable, auditLogsTable } from "@workspace/db";
import { eq, and, ne, inArray, sql, or } from "@workspace/db";
import { requireChairman, logAuditEvent } from "../lib/auth";

const router: IRouter = Router();

router.get("/chairman/lock-status", requireChairman, async (req: Request, res: Response): Promise<void> => {
  const suspendedByLock = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(and(eq(usersTable.status, "suspended"), eq(usersTable.suspendedReason, "emergency_lock")));

  const [{ activeUsers }] = await db
    .select({ activeUsers: sql<number>`cast(count(*) as int)` })
    .from(usersTable)
    .where(and(eq(usersTable.status, "active"), ne(usersTable.role, "chairman")));

  const [{ activeSessions }] = await db
    .select({ activeSessions: sql<number>`cast(count(*) as int)` })
    .from(sessionsTable)
    .where(eq(sessionsTable.status, "active"));

  const lockActive = suspendedByLock.length > 0;

  const recentEvents = await db
    .select()
    .from(auditLogsTable)
    .where(
      or(
        eq(auditLogsTable.eventType, "EMERGENCY_LOCK_ACTIVATED"),
        eq(auditLogsTable.eventType, "EMERGENCY_LOCK_LIFTED"),
      )
    )
    .orderBy(sql`created_at desc`)
    .limit(5);

  res.json({
    active: lockActive,
    suspendedCount: suspendedByLock.length,
    activeUsers,
    activeSessions,
    lastActivatedAt: lockActive && recentEvents[0]?.eventType === "EMERGENCY_LOCK_ACTIVATED"
      ? recentEvents[0].createdAt?.toISOString() ?? null
      : null,
    recentEvents: recentEvents.map((e) => ({
      id: e.id,
      eventType: e.eventType,
      metadata: e.metadata,
      createdAt: e.createdAt?.toISOString() ?? null,
    })),
  });
});

router.post("/chairman/emergency-lock", requireChairman, async (req: Request, res: Response): Promise<void> => {
  const actor = (req as any).staffUser;

  // Suspend all active non-chairman users, marking them as emergency-locked
  const suspendTargets = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(and(eq(usersTable.status, "active"), ne(usersTable.role, "chairman")));

  let suspended = 0;
  if (suspendTargets.length > 0) {
    await db
      .update(usersTable)
      .set({ status: "suspended", suspendedReason: "emergency_lock" })
      .where(inArray(usersTable.id, suspendTargets.map((u) => u.id)));
    suspended = suspendTargets.length;
  }

  // Terminate ALL non-chairman active sessions (broader than just those being suspended)
  const allNonChairmanUsers = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(ne(usersTable.role, "chairman"));

  let sessionTerminated = 0;
  if (allNonChairmanUsers.length > 0) {
    const allIds = allNonChairmanUsers.map((u) => u.id);
    const result = await db
      .update(sessionsTable)
      .set({ status: "force_terminated", endedAt: new Date() })
      .where(and(inArray(sessionsTable.userId, allIds), eq(sessionsTable.status, "active")))
      .returning({ id: sessionsTable.id });
    sessionTerminated = result.length;
  }

  await logAuditEvent(actor.id, "EMERGENCY_LOCK_ACTIVATED", null, null, {
    suspended,
    sessionTerminated,
  });

  req.log.warn({ actorId: actor.id, suspended, sessionTerminated }, "EMERGENCY LOCK ACTIVATED");

  res.json({
    suspended,
    sessionTerminated,
    message: `Emergency lock activated. ${suspended} account(s) suspended, ${sessionTerminated} session(s) terminated.`,
  });
});

router.post("/chairman/emergency-unlock", requireChairman, async (req: Request, res: Response): Promise<void> => {
  const actor = (req as any).staffUser;

  const result = await db
    .update(usersTable)
    .set({ status: "active", suspendedReason: null })
    .where(and(eq(usersTable.status, "suspended"), eq(usersTable.suspendedReason, "emergency_lock")))
    .returning({ id: usersTable.id });

  const reactivated = result.length;

  await logAuditEvent(actor.id, "EMERGENCY_LOCK_LIFTED", null, null, { reactivated });

  req.log.info({ actorId: actor.id, reactivated }, "Emergency lock lifted");

  res.json({
    reactivated,
    message: `Emergency lock lifted. ${reactivated} account(s) reactivated.`,
  });
});

export default router;
