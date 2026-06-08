import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "@workspace/db";
import { db, auditLogsTable, usersTable } from "@workspace/db";
import { ListAuditLogsQueryParams } from "@workspace/api-zod";
import { requireAdmin, requireAuditor } from "../lib/auth";

const router: IRouter = Router();

router.get("/audit-logs", requireAuditor, async (req: Request, res: Response): Promise<void> => {
  const query = ListAuditLogsQueryParams.safeParse(req.query);
  const limit = (query.success && query.data.limit) ? Number(query.data.limit) : 100;
  const all = await db.select().from(auditLogsTable).orderBy(auditLogsTable.createdAt).limit(limit);
  const users = await db.select({ id: usersTable.id, fullName: usersTable.fullName }).from(usersTable);
  const userMap = new Map(users.map((u) => [u.id, u.fullName]));

  let filtered = all;
  if (query.success) {
    if (query.data.actor_user_id != null) filtered = filtered.filter((l) => l.actorUserId === query.data.actor_user_id);
    if (query.data.event_type) filtered = filtered.filter((l) => l.eventType === query.data.event_type);
  }

  res.json(filtered.map((l) => ({
    ...l,
    actorName: l.actorUserId ? (userMap.get(l.actorUserId) ?? null) : null,
  })));
});

export default router;
