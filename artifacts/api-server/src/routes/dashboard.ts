import { Router, type IRouter, type Request, type Response } from "express";
import { eq, sql, and, gte } from "@workspace/db";
import { db, usersTable, departmentsTable, tasksTable, securityAlertsTable, auditLogsTable, sessionsTable, loginHistoryTable } from "@workspace/db";
import { ListAuditLogsQueryParams, GetRecentActivityQueryParams } from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/dashboard/summary", requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalUsers] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);
  const [activeUsers] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.status, "active"));
  const [pendingApprovals] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.status, "pending"));
  const [suspendedUsers] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.status, "suspended"));
  const [totalDepts] = await db.select({ count: sql<number>`count(*)::int` }).from(departmentsTable);
  const [openTasks] = await db.select({ count: sql<number>`count(*)::int` }).from(tasksTable).where(eq(tasksTable.status, "pending"));
  const [pendingAlerts] = await db.select({ count: sql<number>`count(*)::int` }).from(securityAlertsTable).where(eq(securityAlertsTable.status, "open"));
  const [recentLogins] = await db.select({ count: sql<number>`count(*)::int` }).from(sessionsTable).where(gte(sessionsTable.startedAt, oneDayAgo));
  const [failedLogins] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(loginHistoryTable)
    .where(and(eq(loginHistoryTable.success, false), gte(loginHistoryTable.createdAt, sevenDaysAgo)));

  res.json({
    totalUsers: totalUsers?.count ?? 0,
    activeUsers: activeUsers?.count ?? 0,
    pendingApprovals: pendingApprovals?.count ?? 0,
    suspendedUsers: suspendedUsers?.count ?? 0,
    totalDepartments: totalDepts?.count ?? 0,
    openTasks: openTasks?.count ?? 0,
    pendingAlerts: pendingAlerts?.count ?? 0,
    recentLogins: recentLogins?.count ?? 0,
    failedLoginsLast7Days: failedLogins?.count ?? 0,
  });
});

router.get("/dashboard/activity", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const query = GetRecentActivityQueryParams.safeParse(req.query);
  const limit = (query.success && query.data.limit) ? Number(query.data.limit) : 20;
  const logs = await db.select().from(auditLogsTable).orderBy(sql`${auditLogsTable.createdAt} desc`).limit(limit);
  const users = await db.select({ id: usersTable.id, fullName: usersTable.fullName }).from(usersTable);
  const userMap = new Map(users.map((u) => [u.id, u.fullName]));
  res.json(logs.map((l) => ({
    ...l,
    actorName: l.actorUserId ? (userMap.get(l.actorUserId) ?? null) : null,
  })));
});

export default router;
