import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { eq, desc, sql } from "@workspace/db";
import { db, documentsTable, usersTable, documentAccessLogsTable } from "@workspace/db";
import {
  ListDocumentsQueryParams,
  GetDocumentParams,
  DeleteDocumentParams,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin, logAuditEvent } from "../lib/auth";
import { ObjectStorageService } from "../lib/objectStorage";
import { randomUUID } from "crypto";

const router: IRouter = Router();
const objectStorage = new ObjectStorageService();

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
];
const MAX_FILE_SIZE = 25 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type. Allowed: PDF, DOCX, XLSX, PNG, JPEG"));
    }
  },
});

const ADMIN_ROLES = ["chairman", "ict_admin", "hr_admin"];

router.get("/documents", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const query = ListDocumentsQueryParams.safeParse(req.query);
  const actor = (req as any).staffUser;
  const all = await db.select().from(documentsTable).orderBy(desc(documentsTable.createdAt));
  const users = await db.select({ id: usersTable.id, fullName: usersTable.fullName }).from(usersTable);
  const userMap = new Map(users.map((u) => [u.id, u.fullName]));
  const isAdmin = ADMIN_ROLES.includes(actor.role);

  let filtered = all;
  if (!isAdmin) {
    // Non-admins:
    // - confidential: visible in list (so staff see the badge + restriction message), but 403 on download
    // - restricted: visible only if same department (cross-dept restricted docs are hidden entirely)
    // - public/internal: always visible
    filtered = filtered.filter((d) => {
      if (d.sensitivity === "restricted") {
        return d.departmentId !== null && d.departmentId === actor.departmentId;
      }
      return true;
    });
  }
  if (query.success) {
    if (query.data.department_id != null) filtered = filtered.filter((d) => d.departmentId === query.data.department_id);
    if (query.data.sensitivity) filtered = filtered.filter((d) => d.sensitivity === query.data.sensitivity);
  }

  res.json(filtered.map((d) => ({
    ...d,
    uploadedByName: d.uploadedBy ? (userMap.get(d.uploadedBy) ?? null) : null,
  })));
});

router.post(
  "/documents/upload",
  requireAdmin,
  (req: Request, res: Response, next: any) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      next();
    });
  },
  async (req: Request, res: Response): Promise<void> => {
    const actor = (req as any).staffUser;
    const file = (req as any).file as Express.Multer.File | undefined;

    if (!file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }

    const name = req.body?.name?.trim();
    const sensitivity = req.body?.sensitivity ?? "internal";
    const departmentId = req.body?.departmentId ? Number(req.body.departmentId) : null;

    if (!name) {
      res.status(400).json({ error: "Document name is required" });
      return;
    }

    const objectId = randomUUID();
    const ext = file.originalname.split(".").pop() ?? "bin";
    const subPath = `documents/${objectId}.${ext}`;

    let storageKey: string;
    try {
      storageKey = await objectStorage.uploadBuffer(subPath, file.buffer, file.mimetype);
    } catch (err) {
      req.log?.error({ err }, "Failed to upload document to object storage");
      res.status(500).json({ error: "Failed to store file. Please try again." });
      return;
    }

    const [doc] = await db.insert(documentsTable).values({
      name,
      storageKey,
      fileSize: file.size,
      mimeType: file.mimetype,
      downloadCount: 0,
      departmentId,
      sensitivity,
      uploadedBy: actor.id,
    }).returning();

    await logAuditEvent(actor.id, "document.uploaded", "document", doc.id, {
      name: doc.name,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      sensitivity: doc.sensitivity,
    });

    res.status(201).json({ ...doc, uploadedByName: actor.fullName });
  }
);

router.get("/documents/:id/download", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid document id" }); return; }

  const actor = (req as any).staffUser;
  const isAdmin = ADMIN_ROLES.includes(actor.role);

  const [doc] = await db.select().from(documentsTable).where(eq(documentsTable.id, id));
  if (!doc) { res.status(404).json({ error: "Document not found" }); return; }

  if (doc.sensitivity === "confidential" && !isAdmin) {
    res.status(403).json({ error: "This document is confidential and requires admin access." });
    return;
  }

  if (doc.sensitivity === "restricted" && !isAdmin && doc.departmentId !== actor.departmentId) {
    res.status(403).json({ error: "This document is restricted to its department." });
    return;
  }

  const ipAddress = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.socket.remoteAddress ?? null;

  await db.insert(documentAccessLogsTable).values({
    documentId: doc.id,
    userId: actor.id,
    userName: actor.fullName,
    userStaffId: actor.staffId,
    documentName: doc.name,
    action: "download",
    ipAddress,
  });

  await db.update(documentsTable)
    .set({ downloadCount: sql`${documentsTable.downloadCount} + 1` })
    .where(eq(documentsTable.id, doc.id));

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const watermark = `${actor.fullName} | ${actor.staffId} | ${new Date().toISOString()}`;

  let url = "";

  if (doc.storageKey && doc.storageKey !== "placeholder") {
    try {
      url = await objectStorage.getSignedReadUrl(doc.storageKey, expiresAt, {
        filename: doc.name,
      });
    } catch (err) {
      req.log?.error({ err, docId: doc.id }, "Failed to generate signed download URL");
      res.status(500).json({ error: "Failed to generate download link. Please try again." });
      return;
    }
  }

  res.setHeader("X-Watermark", watermark);
  res.json({ url, expiresAt: expiresAt.toISOString(), watermark });
});

router.get("/documents/:id/access-logs", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid document id" }); return; }

  const limit = Math.min(Number(req.query.limit ?? 20), 100);

  const rows = await db
    .select({
      id: documentAccessLogsTable.id,
      documentId: documentAccessLogsTable.documentId,
      userId: documentAccessLogsTable.userId,
      action: documentAccessLogsTable.action,
      ipAddress: documentAccessLogsTable.ipAddress,
      accessedAt: documentAccessLogsTable.accessedAt,
      userName: documentAccessLogsTable.userName,
      userStaffId: documentAccessLogsTable.userStaffId,
    })
    .from(documentAccessLogsTable)
    .where(eq(documentAccessLogsTable.documentId, id))
    .orderBy(desc(documentAccessLogsTable.accessedAt))
    .limit(limit);

  const logs = rows.map((r) => ({ ...r, staffId: r.userStaffId }));

  res.json(logs);
});

router.get("/documents/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const params = GetDocumentParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const actor = (req as any).staffUser;
  const isAdmin = ADMIN_ROLES.includes(actor.role);
  const [doc] = await db.select().from(documentsTable).where(eq(documentsTable.id, params.data.id));
  if (!doc) { res.status(404).json({ error: "Document not found" }); return; }
  if (!isAdmin) {
    if (doc.sensitivity === "restricted" && doc.departmentId !== actor.departmentId) {
      res.status(403).json({ error: "Access denied." }); return;
    }
  }
  const uploader = doc.uploadedBy ? await db.select({ fullName: usersTable.fullName }).from(usersTable).where(eq(usersTable.id, doc.uploadedBy)) : [];
  res.json({ ...doc, uploadedByName: uploader[0]?.fullName ?? null });
});

router.delete("/documents/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const params = DeleteDocumentParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const actor = (req as any).staffUser;
  const [doc] = await db.delete(documentsTable).where(eq(documentsTable.id, params.data.id)).returning();
  if (!doc) { res.status(404).json({ error: "Document not found" }); return; }
  await logAuditEvent(actor.id, "document.deleted", "document", doc.id, { storageKey: doc.storageKey });
  res.sendStatus(204);
});

export default router;
