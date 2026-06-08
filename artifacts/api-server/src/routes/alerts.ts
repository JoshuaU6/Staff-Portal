import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "@workspace/db";
import { db, securityAlertsTable, usersTable } from "@workspace/db";
import {
  ListSecurityAlertsQueryParams,
  ResolveSecurityAlertParams,
} from "@workspace/api-zod";
import { requireAdmin, requireSessionsAlertsRead, logAuditEvent } from "../lib/auth";

const router: IRouter = Router();

router.get("/security-alerts", requireSessionsAlertsRead, async (req: Request, res: Response): Promise<void> => {
  const query = ListSecurityAlertsQueryParams.safeParse(req.query);
  const all = await db.select().from(securityAlertsTable).orderBy(securityAlertsTable.createdAt);
  const users = await db.select({ id: usersTable.id, fullName: usersTable.fullName }).from(usersTable);
  const userMap = new Map(users.map((u) => [u.id, u.fullName]));

  let filtered = all;
  if (query.success) {
    if (query.data.severity) filtered = filtered.filter((a) => a.severity === query.data.severity);
    if (query.data.status) filtered = filtered.filter((a) => a.status === query.data.status);
  }

  res.json(filtered.map((a) => ({
    ...a,
    userName: a.userId ? (userMap.get(a.userId) ?? null) : null,
  })));
});

router.post("/security-alerts/:id/resolve", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const params = ResolveSecurityAlertParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const actor = (req as any).staffUser;
  const [alert] = await db.update(securityAlertsTable).set({ status: "resolved" }).where(eq(securityAlertsTable.id, params.data.id)).returning();
  if (!alert) { res.status(404).json({ error: "Alert not found" }); return; }
  await logAuditEvent(actor.id, "alert.resolved", "security_alert", alert.id);
  const users = await db.select({ id: usersTable.id, fullName: usersTable.fullName }).from(usersTable);
  const userMap = new Map(users.map((u) => [u.id, u.fullName]));
  res.json({ ...alert, userName: alert.userId ? (userMap.get(alert.userId) ?? null) : null });
});

export default router;
