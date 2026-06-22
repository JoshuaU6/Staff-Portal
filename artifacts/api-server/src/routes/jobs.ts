import { Router, type IRouter, type Request, type Response } from "express";
import { eq, desc, and } from "@workspace/db";
import { db } from "@workspace/db";
import { jobPostingsTable, jobApplicationsTable, usersTable } from "@workspace/db";
import { requireAuth, requireAdmin, logAuditEvent } from "../lib/auth";
import { sendEmail, buildApplicantConfirmationEmail, buildHRNotificationEmail } from "../lib/email";

const router: IRouter = Router();

// ── PUBLIC: list published jobs (no auth required) ────────────────────────────
router.get("/public/jobs", async (req: Request, res: Response): Promise<void> => {
  const jobs = await db
    .select()
    .from(jobPostingsTable)
    .where(eq(jobPostingsTable.status, "published"))
    .orderBy(desc(jobPostingsTable.publishedAt));
  res.json(jobs.map((j) => ({
    ...j,
    publishedAt: j.publishedAt?.toISOString() ?? null,
    closedAt: j.closedAt?.toISOString() ?? null,
    createdAt: j.createdAt.toISOString(),
  })));
});

// ── PUBLIC: submit application (no auth required) ────────────────────────────
router.post("/public/jobs/:id/apply", async (req: Request, res: Response): Promise<void> => {
  const jobId = parseInt(req.params.id);
  if (isNaN(jobId)) { res.status(400).json({ error: "Invalid job ID" }); return; }

  const [job] = await db
    .select()
    .from(jobPostingsTable)
    .where(and(eq(jobPostingsTable.id, jobId), eq(jobPostingsTable.status, "published")));

  if (!job) { res.status(404).json({ error: "Job not found or no longer accepting applications" }); return; }

  const { fullName, email, phone, linkedin, coverLetter, cvUrl, cvFileName } = req.body;
  if (!fullName?.trim() || !email?.trim()) {
    res.status(400).json({ error: "Full name and email are required" });
    return;
  }

  const [application] = await db.insert(jobApplicationsTable).values({
    jobId,
    jobTitle: job.title,
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || null,
    linkedin: linkedin?.trim() || null,
    coverLetter: coverLetter?.trim() || null,
    cvUrl: cvUrl || null,
    cvFileName: cvFileName || null,
    status: "new",
  }).returning();

  // Send emails asynchronously — don't block the response
  const emailData = {
    applicantName: fullName.trim(),
    applicantEmail: email.trim().toLowerCase(),
    applicantPhone: phone?.trim(),
    applicantLinkedin: linkedin?.trim(),
    jobTitle: job.title,
    department: job.department,
    location: job.location,
    coverLetter: coverLetter?.trim(),
    applicationId: application.id,
  };

  // 1. Confirmation email to applicant
  const confirmEmail = buildApplicantConfirmationEmail(emailData);
  confirmEmail.to = emailData.applicantEmail;
  sendEmail(confirmEmail).then((sent) => {
    if (sent) console.log(`[jobs] Confirmation email sent to ${emailData.applicantEmail}`);
  });

  // 2. Notification email to HR
  const hrEmail = buildHRNotificationEmail(emailData);
  sendEmail(hrEmail).then((sent) => {
    if (sent) console.log(`[jobs] HR notification sent for application ${application.id}`);
  });

  res.status(201).json({ success: true, applicationId: application.id });
});

// ── PROTECTED: list all jobs (HR admin) ──────────────────────────────────────
router.get("/jobs", requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const jobs = await db
    .select()
    .from(jobPostingsTable)
    .orderBy(desc(jobPostingsTable.createdAt));

  const creators = await db.select({ id: usersTable.id, fullName: usersTable.fullName }).from(usersTable);
  const creatorMap = new Map(creators.map((u) => [u.id, u.fullName]));

  // Count applications per job
  const applications = await db.select({ jobId: jobApplicationsTable.jobId }).from(jobApplicationsTable);
  const countMap = new Map<number, number>();
  applications.forEach((a) => {
    if (a.jobId) countMap.set(a.jobId, (countMap.get(a.jobId) ?? 0) + 1);
  });

  res.json(jobs.map((j) => ({
    ...j,
    publishedAt: j.publishedAt?.toISOString() ?? null,
    closedAt: j.closedAt?.toISOString() ?? null,
    createdAt: j.createdAt.toISOString(),
    createdByName: j.createdBy ? (creatorMap.get(j.createdBy) ?? null) : null,
    applicationCount: countMap.get(j.id) ?? 0,
  })));
});

// ── PROTECTED: create job ─────────────────────────────────────────────────────
router.post("/jobs", requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { title, department, location, type, level, description, requirements } = req.body;
  if (!title?.trim() || !department?.trim() || !location?.trim() || !description?.trim()) {
    res.status(400).json({ error: "Title, department, location and description are required" });
    return;
  }
  const actor = (req as any).staffUser;
  const [job] = await db.insert(jobPostingsTable).values({
    title: title.trim(),
    department: department.trim(),
    location: location.trim(),
    type: type || "Full-time",
    level: level || "Mid-level",
    description: description.trim(),
    requirements: requirements?.trim() || null,
    status: "draft",
    createdBy: actor.id,
  }).returning();
  await logAuditEvent(actor.id, "job.created", "job_posting", job.id, { title: job.title });
  res.status(201).json({ ...job, publishedAt: null, closedAt: null, createdAt: job.createdAt.toISOString() });
});

// ── PROTECTED: update job ─────────────────────────────────────────────────────
router.patch("/jobs/:id", requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const actor = (req as any).staffUser;
  const { title, department, location, type, level, description, requirements, status } = req.body;

  const updates: Partial<typeof jobPostingsTable.$inferInsert> = { updatedAt: new Date() };
  if (title) updates.title = title.trim();
  if (department) updates.department = department.trim();
  if (location) updates.location = location.trim();
  if (type) updates.type = type;
  if (level) updates.level = level;
  if (description) updates.description = description.trim();
  if (requirements !== undefined) updates.requirements = requirements?.trim() || null;
  if (status) {
    updates.status = status;
    if (status === "published" && !updates.publishedAt) updates.publishedAt = new Date();
    if (status === "closed") updates.closedAt = new Date();
  }

  const [job] = await db.update(jobPostingsTable).set(updates).where(eq(jobPostingsTable.id, id)).returning();
  if (!job) { res.status(404).json({ error: "Job not found" }); return; }
  await logAuditEvent(actor.id, "job.updated", "job_posting", job.id, { status: job.status });
  res.json({ ...job, publishedAt: job.publishedAt?.toISOString() ?? null, closedAt: job.closedAt?.toISOString() ?? null, createdAt: job.createdAt.toISOString() });
});

// ── PROTECTED: delete job ─────────────────────────────────────────────────────
router.delete("/jobs/:id", requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const actor = (req as any).staffUser;
  const [job] = await db.delete(jobPostingsTable).where(eq(jobPostingsTable.id, id)).returning();
  if (!job) { res.status(404).json({ error: "Job not found" }); return; }
  await logAuditEvent(actor.id, "job.deleted", "job_posting", job.id, { title: job.title });
  res.sendStatus(204);
});

// ── PROTECTED: list applications for a job ────────────────────────────────────
router.get("/jobs/:id/applications", requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const applications = await db
    .select()
    .from(jobApplicationsTable)
    .where(eq(jobApplicationsTable.jobId, id))
    .orderBy(desc(jobApplicationsTable.appliedAt));
  res.json(applications.map((a) => ({ ...a, appliedAt: a.appliedAt.toISOString(), reviewedAt: a.reviewedAt?.toISOString() ?? null })));
});

// ── PROTECTED: list ALL applications (HR overview) ────────────────────────────
router.get("/job-applications", requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const applications = await db
    .select()
    .from(jobApplicationsTable)
    .orderBy(desc(jobApplicationsTable.appliedAt));
  res.json(applications.map((a) => ({ ...a, appliedAt: a.appliedAt.toISOString(), reviewedAt: a.reviewedAt?.toISOString() ?? null })));
});

// ── PROTECTED: update application status ─────────────────────────────────────
router.patch("/job-applications/:id", requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const actor = (req as any).staffUser;
  const { status, notes } = req.body;
  const updates: any = { reviewedBy: actor.id, reviewedAt: new Date() };
  if (status) updates.status = status;
  if (notes !== undefined) updates.notes = notes;
  const [app] = await db.update(jobApplicationsTable).set(updates).where(eq(jobApplicationsTable.id, id)).returning();
  if (!app) { res.status(404).json({ error: "Application not found" }); return; }
  await logAuditEvent(actor.id, "job_application.reviewed", "job_application", app.id, { status: app.status });
  res.json({ ...app, appliedAt: app.appliedAt.toISOString(), reviewedAt: app.reviewedAt?.toISOString() ?? null });
});

export default router;