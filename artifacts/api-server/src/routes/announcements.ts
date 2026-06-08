import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "@workspace/db";
import { db, announcementsTable, usersTable, departmentsTable } from "@workspace/db";
import {
  CreateAnnouncementBody,
  ListAnnouncementsQueryParams,
  GetAnnouncementParams,
  DeleteAnnouncementParams,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin, logAuditEvent } from "../lib/auth";

const router: IRouter = Router();

router.get("/announcements", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const query = ListAnnouncementsQueryParams.safeParse(req.query);
  const all = await db.select().from(announcementsTable).orderBy(announcementsTable.createdAt);
  const users = await db.select({ id: usersTable.id, fullName: usersTable.fullName }).from(usersTable);
  const userMap = new Map(users.map((u) => [u.id, u.fullName]));

  const isAdmin = ["chairman", "ict_admin", "hr_admin"].includes((req as any).staffUser?.role ?? "");

  let filtered = all;

  if (query.success) {
    if (query.data.scope) {
      filtered = filtered.filter((a) => a.scope === query.data.scope || a.scope === "all");
    }
    if (query.data.department_id != null) {
      const deptId = query.data.department_id;
      const actor = (req as any).staffUser;
      if (!isAdmin && actor.departmentId !== deptId) {
        res.status(403).json({ error: "Access denied: cannot view announcements for another department" });
        return;
      }
      const [dept] = await db
        .select()
        .from(departmentsTable)
        .where(eq(departmentsTable.id, deptId));
      if (dept) {
        filtered = filtered.filter((a) => a.scope === dept.name || a.scope === "all");
      } else {
        filtered = filtered.filter((a) => a.scope === "all");
      }
    }
  }

  res.json(filtered.map((a) => ({
    ...a,
    publishedAt: a.publishedAt?.toISOString() ?? null,
    createdByName: a.createdBy ? (userMap.get(a.createdBy) ?? null) : null,
  })));
});

router.post("/announcements", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateAnnouncementBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const actor = (req as any).staffUser;
  const [ann] = await db.insert(announcementsTable).values({
    title: parsed.data.title,
    body: parsed.data.body,
    scope: parsed.data.scope,
    createdBy: actor.id,
    publishedAt: new Date(),
  }).returning();
  await logAuditEvent(actor.id, "announcement.created", "announcement", ann.id, { title: ann.title });
  res.status(201).json({ ...ann, publishedAt: ann.publishedAt?.toISOString() ?? null, createdByName: actor.fullName });
});

router.get("/announcements/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const params = GetAnnouncementParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [ann] = await db.select().from(announcementsTable).where(eq(announcementsTable.id, params.data.id));
  if (!ann) { res.status(404).json({ error: "Announcement not found" }); return; }
  const creator = ann.createdBy ? await db.select({ fullName: usersTable.fullName }).from(usersTable).where(eq(usersTable.id, ann.createdBy)) : [];
  res.json({ ...ann, publishedAt: ann.publishedAt?.toISOString() ?? null, createdByName: creator[0]?.fullName ?? null });
});

router.delete("/announcements/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const params = DeleteAnnouncementParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const actor = (req as any).staffUser;
  const [ann] = await db.delete(announcementsTable).where(eq(announcementsTable.id, params.data.id)).returning();
  if (!ann) { res.status(404).json({ error: "Announcement not found" }); return; }
  await logAuditEvent(actor.id, "announcement.deleted", "announcement", ann.id);
  res.sendStatus(204);
});

export default router;
