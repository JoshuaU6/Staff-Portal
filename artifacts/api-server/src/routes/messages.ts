import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and, or, desc, isNull } from "@workspace/db";
import { db, messagesTable, usersTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";
import { logAuditEvent } from "../lib/auth";

const router: IRouter = Router();

router.get("/messages", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).staffUser;
  const box = (req.query.box as string) ?? "inbox";

  let rows;
  if (box === "sent") {
    rows = await db
      .select()
      .from(messagesTable)
      .where(and(eq(messagesTable.fromUserId, user.id), eq(messagesTable.deletedBySender, false)))
      .orderBy(desc(messagesTable.createdAt));
  } else {
    rows = await db
      .select()
      .from(messagesTable)
      .where(
        and(
          or(
            eq(messagesTable.toUserId, user.id),
            and(eq(messagesTable.scope, "all"), isNull(messagesTable.toUserId))
          ),
          eq(messagesTable.deletedByRecipient, false)
        )
      )
      .orderBy(desc(messagesTable.createdAt));
  }

  const userIds = [...new Set(rows.flatMap((m) => [m.fromUserId, m.toUserId].filter(Boolean) as number[]))];
  const senders = userIds.length
    ? await db.select({ id: usersTable.id, fullName: usersTable.fullName }).from(usersTable).where(eq(usersTable.id, userIds[0]))
    : [];
  const allSenders =
    userIds.length > 1
      ? await db.select({ id: usersTable.id, fullName: usersTable.fullName }).from(usersTable)
      : senders;
  const senderMap = new Map(allSenders.map((u) => [u.id, u.fullName]));

  res.json(
    rows.map((m) => ({
      ...m,
      fromName: senderMap.get(m.fromUserId) ?? "Unknown",
      toName: m.toUserId ? (senderMap.get(m.toUserId) ?? "Unknown") : "All Staff",
    }))
  );
});

router.post("/messages", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).staffUser;
  const { toUserId, subject, body, scope } = req.body;

  if (!subject || !body) {
    res.status(400).json({ error: "subject and body are required" });
    return;
  }

  const messageScope = scope ?? "personal";
  const recipientId = toUserId ?? null;

  const [msg] = await db
    .insert(messagesTable)
    .values({
      fromUserId: user.id,
      toUserId: recipientId,
      subject: String(subject),
      body: String(body),
      scope: messageScope,
    })
    .returning();

  res.status(201).json(msg);
});

router.patch("/messages/:id/read", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).staffUser;
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(400).json({ error: "invalid id" }); return; }

  const [msg] = await db
    .update(messagesTable)
    .set({ isRead: true })
    .where(and(eq(messagesTable.id, id), eq(messagesTable.toUserId, user.id)))
    .returning();

  if (!msg) { res.status(404).json({ error: "Message not found" }); return; }
  res.json(msg);
});

router.delete("/messages/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).staffUser;
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(400).json({ error: "invalid id" }); return; }

  const [fromMsg] = await db
    .select()
    .from(messagesTable)
    .where(and(eq(messagesTable.id, id), eq(messagesTable.fromUserId, user.id)));

  if (fromMsg) {
    await db.update(messagesTable).set({ deletedBySender: true }).where(eq(messagesTable.id, id));
    res.json({ message: "Deleted from sent" });
    return;
  }

  const [toMsg] = await db
    .update(messagesTable)
    .set({ deletedByRecipient: true })
    .where(and(eq(messagesTable.id, id), eq(messagesTable.toUserId, user.id)))
    .returning();

  if (!toMsg) { res.status(404).json({ error: "Message not found" }); return; }
  res.json({ message: "Deleted" });
});

export default router;
