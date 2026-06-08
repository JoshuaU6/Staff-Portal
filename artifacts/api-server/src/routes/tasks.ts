import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "@workspace/db";
import { db, tasksTable, usersTable } from "@workspace/db";
import {
  CreateTaskBody,
  UpdateTaskBody,
  GetTaskParams,
  UpdateTaskParams,
  ListTasksQueryParams,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin, logAuditEvent } from "../lib/auth";

const router: IRouter = Router();

router.get("/tasks", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const query = ListTasksQueryParams.safeParse(req.query);
  const actor = (req as any).staffUser;
  const all = await db.select().from(tasksTable).orderBy(tasksTable.createdAt);
  const users = await db.select({ id: usersTable.id, fullName: usersTable.fullName }).from(usersTable);
  const userMap = new Map(users.map((u) => [u.id, u.fullName]));

  let filtered = all;
  const isAdmin = ["chairman", "ict_admin", "hr_admin"].includes(actor.role);

  if (!isAdmin) {
    const requestedDeptId = query.success ? query.data.department_id : undefined;
    if (requestedDeptId != null) {
      if (actor.departmentId !== requestedDeptId) {
        res.status(403).json({ error: "Access denied: cannot view tasks for another department" });
        return;
      }
      filtered = filtered.filter((t) => t.departmentId === requestedDeptId);
    } else {
      filtered = filtered.filter((t) => t.assigneeId === actor.id);
    }
  }

  if (query.success) {
    if (query.data.status) filtered = filtered.filter((t) => t.status === query.data.status);
    if (query.data.assignee_id != null) filtered = filtered.filter((t) => t.assigneeId === query.data.assignee_id);
    if (!isAdmin && query.data.department_id != null) {
      // already handled above for non-admins
    } else if (isAdmin && query.data.department_id != null) {
      filtered = filtered.filter((t) => t.departmentId === query.data.department_id);
    }
  }

  res.json(filtered.map((t) => ({
    ...t,
    assigneeName: t.assigneeId ? (userMap.get(t.assigneeId) ?? null) : null,
    dueDate: t.dueDate?.toISOString() ?? null,
  })));
});

router.post("/tasks", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateTaskBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const actor = (req as any).staffUser;
  const [task] = await db.insert(tasksTable).values({
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    assigneeId: parsed.data.assigneeId ?? null,
    departmentId: parsed.data.departmentId ?? null,
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    status: "pending",
  }).returning();
  await logAuditEvent(actor.id, "task.created", "task", task.id, { title: task.title });
  const assignee = task.assigneeId ? await db.select({ fullName: usersTable.fullName }).from(usersTable).where(eq(usersTable.id, task.assigneeId)) : [];
  res.status(201).json({ ...task, assigneeName: assignee[0]?.fullName ?? null, dueDate: task.dueDate?.toISOString() ?? null });
});

router.get("/tasks/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const params = GetTaskParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, params.data.id));
  if (!task) { res.status(404).json({ error: "Task not found" }); return; }
  const assignee = task.assigneeId ? await db.select({ fullName: usersTable.fullName }).from(usersTable).where(eq(usersTable.id, task.assigneeId)) : [];
  res.json({ ...task, assigneeName: assignee[0]?.fullName ?? null, dueDate: task.dueDate?.toISOString() ?? null });
});

router.patch("/tasks/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const params = UpdateTaskParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateTaskBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const actor = (req as any).staffUser;
  const updates: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.dueDate !== undefined) updates.dueDate = parsed.data.dueDate ? new Date(parsed.data.dueDate) : null;
  const [task] = await db.update(tasksTable).set(updates).where(eq(tasksTable.id, params.data.id)).returning();
  if (!task) { res.status(404).json({ error: "Task not found" }); return; }
  await logAuditEvent(actor.id, "task.updated", "task", task.id);
  const assignee = task.assigneeId ? await db.select({ fullName: usersTable.fullName }).from(usersTable).where(eq(usersTable.id, task.assigneeId)) : [];
  res.json({ ...task, assigneeName: assignee[0]?.fullName ?? null, dueDate: task.dueDate?.toISOString() ?? null });
});

export default router;
