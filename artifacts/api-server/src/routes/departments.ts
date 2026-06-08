import { Router, type IRouter, type Request, type Response } from "express";
import { eq, sql } from "@workspace/db";
import { db, departmentsTable, usersTable } from "@workspace/db";
import {
  CreateDepartmentBody,
  GetDepartmentParams,
  GetDepartmentMembersParams,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin, logAuditEvent } from "../lib/auth";

const router: IRouter = Router();

router.get("/departments", requireAuth, async (_req: Request, res: Response): Promise<void> => {
  const depts = await db.select().from(departmentsTable).orderBy(departmentsTable.name);
  const counts = await db
    .select({ departmentId: usersTable.departmentId, count: sql<number>`count(*)::int` })
    .from(usersTable)
    .where(eq(usersTable.status, "active"))
    .groupBy(usersTable.departmentId);
  const countMap = new Map(counts.map((c) => [c.departmentId, c.count]));
  const nameMap = new Map(depts.map((d) => [d.id, d.name]));
  res.json(depts.map((d) => ({
    ...d,
    memberCount: countMap.get(d.id) ?? 0,
    parentDepartmentName: d.parentDepartmentId ? (nameMap.get(d.parentDepartmentId) ?? null) : null,
  })));
});

router.post("/departments", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateDepartmentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const actor = (req as any).staffUser;
  const [dept] = await db.insert(departmentsTable).values({
    name: parsed.data.name,
    parentDepartmentId: parsed.data.parentDepartmentId ?? null,
  }).returning();
  await logAuditEvent(actor.id, "department.created", "department", dept.id, { name: dept.name });
  let parentDepartmentName: string | null = null;
  if (dept.parentDepartmentId) {
    const [parent] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, dept.parentDepartmentId));
    parentDepartmentName = parent?.name ?? null;
  }
  res.status(201).json({ ...dept, memberCount: 0, parentDepartmentName });
});

router.get("/departments/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const params = GetDepartmentParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const actor = (req as any).staffUser;
  const isAdmin = ["chairman", "ict_admin", "hr_admin"].includes(actor.role);
  if (!isAdmin && actor.departmentId !== params.data.id) {
    res.status(403).json({ error: "Access denied: you may only view your own department" });
    return;
  }
  const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, params.data.id));
  if (!dept) { res.status(404).json({ error: "Department not found" }); return; }
  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(usersTable)
    .where(eq(usersTable.departmentId, dept.id));
  let parentDepartmentName: string | null = null;
  if (dept.parentDepartmentId) {
    const [parent] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, dept.parentDepartmentId));
    parentDepartmentName = parent?.name ?? null;
  }
  res.json({ ...dept, memberCount: countResult?.count ?? 0, parentDepartmentName });
});

router.get("/departments/:id/members", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const params = GetDepartmentMembersParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const actor = (req as any).staffUser;
  const isAdmin = ["chairman", "ict_admin", "hr_admin"].includes(actor.role);
  if (!isAdmin && actor.departmentId !== params.data.id) {
    res.status(403).json({ error: "Access denied: you may only view members of your own department" });
    return;
  }
  const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, params.data.id));
  if (!dept) { res.status(404).json({ error: "Department not found" }); return; }
  const members = await db.select().from(usersTable).where(eq(usersTable.departmentId, params.data.id));
  res.json(members.map((m) => ({ ...m, departmentName: dept.name })));
});

export default router;
