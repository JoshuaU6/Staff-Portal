import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable, policyVersionsTable, policyAcknowledgmentsTable, eq, and, desc } from "@workspace/db";
import { requireAuth, requireAdmin, requireComplianceAdmin, logAuditEvent } from "../lib/auth";

const router: IRouter = Router();

router.get("/policy/current", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const [current] = await db
    .select()
    .from(policyVersionsTable)
    .orderBy(desc(policyVersionsTable.publishedAt))
    .limit(1);

  if (!current) {
    res.status(404).json({ error: "No policy published yet" });
    return;
  }

  const user = (req as any).staffUser;
  const [ack] = await db
    .select()
    .from(policyAcknowledgmentsTable)
    .where(
      and(
        eq(policyAcknowledgmentsTable.userId, user.id),
        eq(policyAcknowledgmentsTable.policyVersionId, current.id),
      ),
    );

  res.json({
    ...current,
    acknowledgedAt: ack?.acknowledgedAt ?? null,
  });
});

router.post("/policy/acknowledge", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).staffUser;

  const [current] = await db
    .select()
    .from(policyVersionsTable)
    .orderBy(desc(policyVersionsTable.publishedAt))
    .limit(1);

  if (!current) {
    res.status(404).json({ error: "No policy to acknowledge" });
    return;
  }

  const [existing] = await db
    .select()
    .from(policyAcknowledgmentsTable)
    .where(
      and(
        eq(policyAcknowledgmentsTable.userId, user.id),
        eq(policyAcknowledgmentsTable.policyVersionId, current.id),
      ),
    );

  if (existing) {
    res.json({ message: "Already acknowledged", acknowledgedAt: existing.acknowledgedAt });
    return;
  }

  const [ack] = await db
    .insert(policyAcknowledgmentsTable)
    .values({ userId: user.id, policyVersionId: current.id })
    .returning();

  await logAuditEvent(user.id, "policy.acknowledged", "policy_version", current.id, { version: current.version });

  res.json({ message: "Policy acknowledged", acknowledgedAt: ack.acknowledgedAt });
});

router.get("/policy/compliance", requireComplianceAdmin, async (_req: Request, res: Response): Promise<void> => {
  const [current] = await db
    .select()
    .from(policyVersionsTable)
    .orderBy(desc(policyVersionsTable.publishedAt))
    .limit(1);

  if (!current) {
    res.json({ policyVersion: null, compliance: [] });
    return;
  }

  const activeUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.status, "active"));

  const acks = await db
    .select()
    .from(policyAcknowledgmentsTable)
    .where(eq(policyAcknowledgmentsTable.policyVersionId, current.id));

  const ackMap = new Map(acks.map((a) => [a.userId, a.acknowledgedAt]));

  const rows = activeUsers.map((u) => ({
    userId: u.id,
    staffId: u.staffId,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    acknowledged: ackMap.has(u.id),
    acknowledgedAt: ackMap.get(u.id) ?? null,
  }));

  res.json({ policyVersion: current, compliance: rows });
});

router.post("/policy", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { version, body } = req.body as { version?: string; body?: string };
  if (!version || !body) {
    res.status(400).json({ error: "version and body are required" });
    return;
  }

  const actor = (req as any).staffUser;

  const [pv] = await db
    .insert(policyVersionsTable)
    .values({ version, body, publishedBy: actor.id })
    .returning();

  await logAuditEvent(actor.id, "policy.published", "policy_version", pv.id, { version: pv.version });

  res.status(201).json(pv);
});

export default router;
