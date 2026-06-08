import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and } from "@workspace/db";
import { db, usersTable, departmentsTable } from "@workspace/db";
import {
  CreateUserBody,
  UpdateUserBody,
  UpdateUserParams,
  GetUserParams,
  ApproveUserParams,
  SuspendUserParams,
  ReactivateUserParams,
  ForceLogoutUserParams,
  OffboardUserParams,
  ListUsersQueryParams,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin, logAuditEvent } from "../lib/auth";

const router: IRouter = Router();

router.get("/users/me", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).staffUser;
  const dept = user.departmentId
    ? await db.select().from(departmentsTable).where(eq(departmentsTable.id, user.departmentId))
    : [];
  res.json({
    ...user,
    departmentName: dept[0]?.name ?? null,
  });
});

router.get("/users", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const query = ListUsersQueryParams.safeParse(req.query);
  const allUsers = await db.select().from(usersTable).orderBy(usersTable.createdAt);
  const depts = await db.select().from(departmentsTable);
  const deptMap = new Map(depts.map((d) => [d.id, d.name]));

  let filtered = allUsers;
  if (query.success) {
    if (query.data.status) filtered = filtered.filter((u) => u.status === query.data.status);
    if (query.data.department_id != null) filtered = filtered.filter((u) => u.departmentId === query.data.department_id);
    if (query.data.role) filtered = filtered.filter((u) => u.role === query.data.role);
  }

  res.json(filtered.map((u) => ({ ...u, departmentName: u.departmentId ? (deptMap.get(u.departmentId) ?? null) : null })));
});

router.post("/users", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const actor = (req as any).staffUser;
  const [user] = await db.insert(usersTable).values({
    staffId: parsed.data.staffId,
    email: parsed.data.email,
    fullName: parsed.data.fullName,
    role: parsed.data.role,
    departmentId: parsed.data.departmentId ?? null,
    status: "pending",
  }).returning();

  await logAuditEvent(actor.id, "user.created", "user", user.id, { staffId: user.staffId });

  const dept = user.departmentId
    ? await db.select().from(departmentsTable).where(eq(departmentsTable.id, user.departmentId))
    : [];
  res.status(201).json({ ...user, departmentName: dept[0]?.name ?? null });
});

router.get("/users/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const params = GetUserParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  const dept = user.departmentId ? await db.select().from(departmentsTable).where(eq(departmentsTable.id, user.departmentId)) : [];
  res.json({ ...user, departmentName: dept[0]?.name ?? null });
});

router.patch("/users/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const params = UpdateUserParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const actor = (req as any).staffUser;
  const updates: Record<string, unknown> = {};
  if (parsed.data.fullName !== undefined) updates.fullName = parsed.data.fullName;
  if (parsed.data.role !== undefined) updates.role = parsed.data.role;
  if (parsed.data.departmentId !== undefined) updates.departmentId = parsed.data.departmentId;
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, params.data.id)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  await logAuditEvent(actor.id, "user.updated", "user", user.id);
  const dept = user.departmentId ? await db.select().from(departmentsTable).where(eq(departmentsTable.id, user.departmentId)) : [];
  res.json({ ...user, departmentName: dept[0]?.name ?? null });
});

router.post("/users/:id/approve", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const params = ApproveUserParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const actor = (req as any).staffUser;
  const [user] = await db.update(usersTable).set({ status: "active" }).where(eq(usersTable.id, params.data.id)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  await logAuditEvent(actor.id, "user.approved", "user", user.id);
  const dept = user.departmentId ? await db.select().from(departmentsTable).where(eq(departmentsTable.id, user.departmentId)) : [];
  res.json({ ...user, departmentName: dept[0]?.name ?? null });
});

router.post("/users/:id/suspend", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const params = SuspendUserParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const actor = (req as any).staffUser;
  const [user] = await db.update(usersTable).set({ status: "suspended" }).where(eq(usersTable.id, params.data.id)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  await logAuditEvent(actor.id, "user.suspended", "user", user.id);
  const dept = user.departmentId ? await db.select().from(departmentsTable).where(eq(departmentsTable.id, user.departmentId)) : [];
  res.json({ ...user, departmentName: dept[0]?.name ?? null });
});

router.post("/users/:id/reactivate", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const params = ReactivateUserParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const actor = (req as any).staffUser;
  const [user] = await db.update(usersTable).set({ status: "active" }).where(eq(usersTable.id, params.data.id)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  await logAuditEvent(actor.id, "user.reactivated", "user", user.id);
  const dept = user.departmentId ? await db.select().from(departmentsTable).where(eq(departmentsTable.id, user.departmentId)) : [];
  res.json({ ...user, departmentName: dept[0]?.name ?? null });
});

router.post("/users/:id/force-logout", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const params = ForceLogoutUserParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const actor = (req as any).staffUser;
  const { sessionsTable } = await import("@workspace/db");
  await db.update(sessionsTable).set({ status: "force_terminated", endedAt: new Date() }).where(and(eq(sessionsTable.userId, params.data.id), eq(sessionsTable.status, "active")));
  await logAuditEvent(actor.id, "user.force_logout", "user", params.data.id);
  res.json({ message: "All sessions terminated" });
});

router.post("/users/:id/offboard", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const params = OffboardUserParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const actor = (req as any).staffUser;
  const { sessionsTable } = await import("@workspace/db");
  await db.update(sessionsTable).set({ status: "force_terminated", endedAt: new Date() }).where(and(eq(sessionsTable.userId, params.data.id), eq(sessionsTable.status, "active")));
  const [user] = await db.update(usersTable).set({ status: "archived" }).where(eq(usersTable.id, params.data.id)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  await logAuditEvent(actor.id, "user.offboarded", "user", user.id);
  res.json({ message: "User offboarded and account archived" });
});

router.post("/users/bulk-action", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const actor = (req as any).staffUser;
  const { userIds, action } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    res.status(400).json({ error: "userIds must be a non-empty array" });
    return;
  }
  const validActions = ["suspend", "reactivate", "force_logout"];
  if (!validActions.includes(action)) {
    res.status(400).json({ error: `action must be one of: ${validActions.join(", ")}` });
    return;
  }

  const { sessionsTable } = await import("@workspace/db");
  let applied = 0;
  for (const userId of userIds) {
    const uid = parseInt(String(userId), 10);
    if (isNaN(uid)) continue;
    if (action === "suspend") {
      await db.update(usersTable).set({ status: "suspended" }).where(eq(usersTable.id, uid));
      await logAuditEvent(actor.id, "user.suspended", "user", uid, { bulk: true });
    } else if (action === "reactivate") {
      await db.update(usersTable).set({ status: "active" }).where(eq(usersTable.id, uid));
      await logAuditEvent(actor.id, "user.reactivated", "user", uid, { bulk: true });
    } else if (action === "force_logout") {
      await db.update(sessionsTable).set({ status: "force_terminated", endedAt: new Date() }).where(and(eq(sessionsTable.userId, uid), eq(sessionsTable.status, "active")));
      await logAuditEvent(actor.id, "user.force_logout", "user", uid, { bulk: true });
    }
    applied++;
  }
  res.json({ message: `Bulk ${action} applied to ${applied} user(s)` });
});

export default router;
