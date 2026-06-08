import { Router, type IRouter, type Request, type Response } from "express";
import { db, sessionsTable, usersTable } from "@workspace/db";
import { ListSessionsQueryParams } from "@workspace/api-zod";
import { requireAdmin, requireSessionsAlertsRead, requireAuth } from "../lib/auth";
import { eq, desc } from "@workspace/db";

const router: IRouter = Router();

router.get("/sessions/me", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const staffUser = (req as any).staffUser;
  const limitParam = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
  const limit = isNaN(limitParam) ? 20 : Math.max(1, Math.min(limitParam, 100));

  const sessions = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.userId, staffUser.id))
    .orderBy(desc(sessionsTable.startedAt))
    .limit(limit);

  res.json(sessions.map((s) => ({
    ...s,
    userName: staffUser.fullName,
    startedAt: s.startedAt.toISOString(),
    endedAt: s.endedAt?.toISOString() ?? null,
  })));
});

router.get("/sessions", requireSessionsAlertsRead, async (req: Request, res: Response): Promise<void> => {
  const query = ListSessionsQueryParams.safeParse(req.query);
  const all = await db.select().from(sessionsTable).orderBy(sessionsTable.startedAt);
  const users = await db.select({ id: usersTable.id, fullName: usersTable.fullName }).from(usersTable);
  const userMap = new Map(users.map((u) => [u.id, u.fullName]));

  let filtered = all;
  if (query.success) {
    if (query.data.user_id != null) filtered = filtered.filter((s) => s.userId === query.data.user_id);
    if (query.data.status) filtered = filtered.filter((s) => s.status === query.data.status);
  }

  res.json(filtered.map((s) => ({
    ...s,
    userName: userMap.get(s.userId) ?? null,
    startedAt: s.startedAt.toISOString(),
    endedAt: s.endedAt?.toISOString() ?? null,
  })));
});

export default router;
