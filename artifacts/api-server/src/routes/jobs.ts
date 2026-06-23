import { Router, type IRouter, type Request, type Response } from "express";
import { eq, desc, and, ilike } from "@workspace/db";
import { db } from "@workspace/db";
import { jobPostingsTable, jobApplicationsTable, jobApplicationNotesTable } from "@workspace/db";
import { requireAuth, requireAdmin, logAuditEvent } from "../lib/auth";
import { sendEmail, buildApplicantConfirmationEmail, buildHRNotificationEmail, buildStatusEmail } from "../lib/email";

const router: IRouter = Router();

async function generateJobId(): Promise<string> {
  const year = new Date().getFullYear();
  const jobs = await db.select({ jobId: jobPostingsTable.jobId }).from(jobPostingsTable);
  const nums = jobs
    .map((j) => j.jobId)
    .filter((id) => id && id.startsWith(`MTC-JOB-${year}-`))
    .map((id) => parseInt(id!.split("-").pop() ?? "0"))
    .filter((n) => !isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `MTC-JOB-${year}-${String(next).padStart(4, "0")}`;
}

async function generateApplicationId(): Promise<string> {
  const year = new Date().getFullYear();
  const apps = await db.select({ applicationId: jobApplicationsTable.applicationId }).from(jobApplicationsTable);
  const nums = apps
    .map((a) => a.applicationId)
    .filter((id) => id && id.startsWith(`MTC-APP-${year}-`))
    .map((id) => parseInt(id!.split("-").pop() ?? "0"))
    .filter((n) => !isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `MTC-APP-${year}-${String(next).padStart(6, "0")}`;
}

// ── PUBLIC: list published jobs ───────────────────────────────────────────────
router.get("/public/jobs", async (req: Request, res: Response): Promise<void> => {
  const { department, type, level, workMode, q } = req.query as Record<string, string>;
  let jobs = await db
    .select()
    .from(jobPostingsTable)
    .where(eq(jobPostingsTable.status, "published"))
    .orderBy(desc(jobPostingsTable.publishedAt));

  if (department) jobs = jobs.filter((j) => j.department === department);
  if (type) jobs = jobs.filter((j) => j.type === type);
  if (level) jobs = jobs.filter((j) => j.level === level);
  if (workMode) jobs = jobs.filter((j) => j.workMode === workMode);
  if (q) {
    const s = q.toLowerCase();
    jobs = jobs.filter((j) =>
      j.title.toLowerCase().includes(s) ||
      j.department.toLowerCase().includes(s) ||
      j.location.toLowerCase().includes(s)
    );
  }

  res.json(jobs.map((j) => ({
    ...j,
    publishedAt: j.publishedAt?.toISOString() ?? null,
    closedAt: j.closedAt?.toISOString() ?? null,
    deadline: j.deadline?.toISOString() ?? null,
    createdAt: j.createdAt.toISOString(),
  })));
});

// ── PUBLIC: get single job ────────────────────────────────────────────────────
router.get("/public/jobs/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [job] = await db.select().from(jobPostingsTable)
    .where(and(eq(jobPostingsTable.id, id), eq(jobPostingsTable.status, "published")));
  if (!job) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...job, publishedAt: job.publishedAt?.toISOString() ?? null, deadline: job.deadline?.toISOString() ?? null, createdAt: job.createdAt.toISOString() });
});

// ── PUBLIC: submit application ────────────────────────────────────────────────
router.post("/public/jobs/:id/apply", async (req: Request, res: Response): Promise<void> => {
  const jobIdParam = parseInt(req.params.id);

  let job: typeof jobPostingsTable.$inferSelect | null = null;
  if (!isNaN(jobIdParam) && jobIdParam > 0) {
    const [found] = await db.select().from(jobPostingsTable)
      .where(and(eq(jobPostingsTable.id, jobIdParam), eq(jobPostingsTable.status, "published")));
    if (!found) {
      res.status(404).json({ error: "Job not found or no longer accepting applications" });
      return;
    }
    job = found;
  }

  const { fullName, email } = req.body;
  if (!fullName?.trim() || !email?.trim()) {
    res.status(400).json({ error: "Full name and email are required" });
    return;
  }

  const applicationId = await generateApplicationId();
  const jobTitle = job?.title ?? req.body.jobTitle ?? "Speculative Application";
  const department = job?.department ?? "General";
  const location = job?.location ?? "Global";
  const jobRef = job?.jobId ?? null;

  const [application] = await db.insert(jobApplicationsTable).values({
    applicationId,
    jobId: job?.id ?? null,
    jobTitle,
    jobRef,
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    phone: req.body.phone?.trim() || null,
    dateOfBirth: req.body.dateOfBirth || null,
    gender: req.body.gender || null,
    nationality: req.body.nationality || null,
    countryOfResidence: req.body.countryOfResidence || null,
    cityOfResidence: req.body.cityOfResidence || null,
    address: req.body.address || null,
    division: req.body.division || null,
    employmentType: req.body.employmentType || null,
    expectedSalary: req.body.expectedSalary || null,
    noticePeriod: req.body.noticePeriod || null,
    currentEmployer: req.body.currentEmployer || null,
    currentJobTitle: req.body.currentJobTitle || null,
    yearsOfExperience: req.body.yearsOfExperience || null,
    industryExperience: req.body.industryExperience || null,
    keySkills: req.body.keySkills || null,
    linkedin: req.body.linkedin || null,
    portfolioUrl: req.body.portfolioUrl || null,
    highestEducation: req.body.highestEducation || null,
    fieldOfStudy: req.body.fieldOfStudy || null,
    university: req.body.university || null,
    graduationYear: req.body.graduationYear || null,
    certifications: req.body.certifications || null,
    willingToRelocate: req.body.willingToRelocate ?? null,
    relocationCountries: req.body.relocationCountries || null,
    hasValidPassport: req.body.hasValidPassport ?? null,
    passportExpiry: req.body.passportExpiry || null,
    requiresVisaSponsorship: req.body.requiresVisaSponsorship ?? null,
    currentVisaStatus: req.body.currentVisaStatus || null,
    heardAboutUs: req.body.heardAboutUs || null,
    whyMTC: req.body.whyMTC || null,
    availableStartDate: req.body.availableStartDate || null,
    hasDisability: req.body.hasDisability ?? null,
    disabilityDetails: req.body.disabilityDetails || null,
    addToTalentPool: req.body.addToTalentPool ?? false,
    reference1Name: req.body.reference1Name || null,
    reference1Title: req.body.reference1Title || null,
    reference1Company: req.body.reference1Company || null,
    reference1Email: req.body.reference1Email || null,
    reference1Phone: req.body.reference1Phone || null,
    reference2Name: req.body.reference2Name || null,
    reference2Title: req.body.reference2Title || null,
    reference2Company: req.body.reference2Company || null,
    reference2Email: req.body.reference2Email || null,
    reference2Phone: req.body.reference2Phone || null,
    cvUrl: req.body.cvUrl || null,
    cvFileName: req.body.cvFileName || null,
    coverLetter: req.body.coverLetter || req.body.coverLetterText || null,
    consentGiven: req.body.consentGiven ?? false,
    declarationAccepted: req.body.declarationAccepted ?? false,
    backgroundCheckConsent: req.body.backgroundCheckConsent ?? false,
    status: "new",
  }).returning();

  // Send emails async — don't block response
  const emailData = {
    applicantName: fullName.trim(),
    applicantEmail: email.trim().toLowerCase(),
    applicantPhone: req.body.phone?.trim(),
    applicantLinkedin: req.body.linkedin?.trim(),
    jobTitle,
    department,
    location,
    country: req.body.countryOfResidence,
    yearsOfExperience: req.body.yearsOfExperience,
    coverLetter: req.body.coverLetter?.trim() || req.body.coverLetterText?.trim(),
    applicationId: application.id,
    applicationRef: applicationId,
    jobRef,
  };

  const confirmEmail = buildApplicantConfirmationEmail(emailData);
  confirmEmail.to = emailData.applicantEmail;
  sendEmail(confirmEmail).catch(console.error);
  sendEmail(buildHRNotificationEmail(emailData)).catch(console.error);

  res.status(201).json({ success: true, applicationId, internalId: application.id });
});

// ── PROTECTED: list all jobs ──────────────────────────────────────────────────
router.get("/jobs", requireAuth, requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const jobs = await db.select().from(jobPostingsTable).orderBy(desc(jobPostingsTable.createdAt));
  const applications = await db.select({ jobId: jobApplicationsTable.jobId }).from(jobApplicationsTable);
  const countMap = new Map<number, number>();
  applications.forEach((a) => { if (a.jobId) countMap.set(a.jobId, (countMap.get(a.jobId) ?? 0) + 1); });
  res.json(jobs.map((j) => ({
    ...j,
    publishedAt: j.publishedAt?.toISOString() ?? null,
    closedAt: j.closedAt?.toISOString() ?? null,
    deadline: j.deadline?.toISOString() ?? null,
    createdAt: j.createdAt.toISOString(),
    applicationCount: countMap.get(j.id) ?? 0,
  })));
});

// ── PROTECTED: create job ─────────────────────────────────────────────────────
router.post("/jobs", requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { title, department, division, location, country, type, level, workMode, description, responsibilities, requirements, benefits, deadline } = req.body;
  if (!title?.trim() || !department?.trim() || !location?.trim() || !description?.trim()) {
    res.status(400).json({ error: "Title, department, location and description are required" }); return;
  }
  const actor = (req as any).staffUser;
  const jobId = await generateJobId();
  const [job] = await db.insert(jobPostingsTable).values({
    jobId, title: title.trim(), department: department.trim(),
    division: division || null, location: location.trim(), country: country || null,
    type: type || "Full-time", level: level || "Mid-level", workMode: workMode || "On-site",
    description: description.trim(), responsibilities: responsibilities || null,
    requirements: requirements || null, benefits: benefits || null,
    deadline: deadline ? new Date(deadline) : null,
    status: "draft", createdBy: actor.id,
  }).returning();
  await logAuditEvent(actor.id, "job.created", "job_posting", job.id, { title: job.title, jobId: job.jobId });
  res.status(201).json({ ...job, publishedAt: null, closedAt: null, createdAt: job.createdAt.toISOString() });
});

// ── PROTECTED: update job ─────────────────────────────────────────────────────
router.patch("/jobs/:id", requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const actor = (req as any).staffUser;
  const updates: any = { updatedAt: new Date() };
  ["title","department","division","location","country","type","level","workMode","description","responsibilities","requirements","benefits","status"].forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f] || null;
  });
  if (req.body.deadline !== undefined) updates.deadline = req.body.deadline ? new Date(req.body.deadline) : null;
  if (req.body.status === "published" && !updates.publishedAt) updates.publishedAt = new Date();
  if (req.body.status === "closed") updates.closedAt = new Date();
  const [job] = await db.update(jobPostingsTable).set(updates).where(eq(jobPostingsTable.id, id)).returning();
  if (!job) { res.status(404).json({ error: "Not found" }); return; }
  await logAuditEvent(actor.id, "job.updated", "job_posting", job.id, { status: job.status });
  res.json({ ...job, publishedAt: job.publishedAt?.toISOString() ?? null, closedAt: job.closedAt?.toISOString() ?? null, createdAt: job.createdAt.toISOString() });
});

// ── PROTECTED: delete job ─────────────────────────────────────────────────────
router.delete("/jobs/:id", requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const actor = (req as any).staffUser;
  const [job] = await db.delete(jobPostingsTable).where(eq(jobPostingsTable.id, id)).returning();
  if (!job) { res.status(404).json({ error: "Not found" }); return; }
  await logAuditEvent(actor.id, "job.deleted", "job_posting", job.id, { title: job.title });
  res.sendStatus(204);
});

// ── PROTECTED: list applications ──────────────────────────────────────────────
router.get("/job-applications", requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { status, q } = req.query as Record<string, string>;
  let apps = await db.select().from(jobApplicationsTable).orderBy(desc(jobApplicationsTable.appliedAt));
  if (status) apps = apps.filter((a) => a.status === status);
  if (q) {
    const s = q.toLowerCase();
    apps = apps.filter((a) =>
      a.fullName.toLowerCase().includes(s) ||
      a.email.toLowerCase().includes(s) ||
      (a.applicationId ?? "").toLowerCase().includes(s) ||
      a.jobTitle.toLowerCase().includes(s)
    );
  }
  res.json(apps.map((a) => ({ ...a, appliedAt: a.appliedAt.toISOString(), reviewedAt: a.reviewedAt?.toISOString() ?? null })));
});

// ── PROTECTED: get single application ────────────────────────────────────────
router.get("/job-applications/:id", requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [app] = await db.select().from(jobApplicationsTable).where(eq(jobApplicationsTable.id, id));
  if (!app) { res.status(404).json({ error: "Not found" }); return; }
  const notes = await db.select().from(jobApplicationNotesTable)
    .where(eq(jobApplicationNotesTable.applicationId, id))
    .orderBy(desc(jobApplicationNotesTable.createdAt));
  res.json({ ...app, appliedAt: app.appliedAt.toISOString(), reviewedAt: app.reviewedAt?.toISOString() ?? null, notes });
});

// ── PROTECTED: update application ────────────────────────────────────────────
router.patch("/job-applications/:id", requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const actor = (req as any).staffUser;
  const { status, assignedTo, assessmentDetails, interviewDate, interviewTime, interviewLink,
    offerLetterUrl, rejectionReason, rejectionNote } = req.body;

  const updates: any = { reviewedBy: actor.id, reviewedAt: new Date() };
  if (status) updates.status = status;
  if (assignedTo !== undefined) updates.assignedTo = assignedTo || null;

  const [app] = await db.update(jobApplicationsTable).set(updates).where(eq(jobApplicationsTable.id, id)).returning();
  if (!app) { res.status(404).json({ error: "Not found" }); return; }
  await logAuditEvent(actor.id, "job_application.updated", "job_application", app.id, { status: app.status });

  // Send automatic status email to candidate
  if (status && app.email) {
    const emailData = {
      applicantName: app.fullName,
      applicantEmail: app.email,
      jobTitle: app.jobTitle,
      department: app.division ?? "MTC Group",
      location: app.countryOfResidence ?? "International",
      applicationRef: app.applicationId ?? `MTC-APP-${String(app.id).padStart(6, "0")}`,
      assessmentDetails,
      interviewDate,
      interviewTime,
      interviewLink,
      offerLetterUrl,
      rejectionReason,
      rejectionNote,
    };
    const email = buildStatusEmail(status, emailData);
    if (email) {
      sendEmail(email).then((sent) => {
        console.log(`[jobs] Status email (${status}) ${sent ? "sent" : "failed"} to ${app.email}`);
      }).catch(console.error);
    }
  }

  res.json({ ...app, appliedAt: app.appliedAt.toISOString(), reviewedAt: app.reviewedAt?.toISOString() ?? null });
});

// ── PROTECTED: add note ───────────────────────────────────────────────────────
router.post("/job-applications/:id/notes", requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const actor = (req as any).staffUser;
  const { note } = req.body;
  if (!note?.trim()) { res.status(400).json({ error: "Note cannot be empty" }); return; }
  const [created] = await db.insert(jobApplicationNotesTable).values({
    applicationId: id,
    authorId: actor.id,
    authorName: actor.fullName,
    note: note.trim(),
  }).returning();
  res.status(201).json({ ...created, createdAt: created.createdAt.toISOString() });
});

export default router;