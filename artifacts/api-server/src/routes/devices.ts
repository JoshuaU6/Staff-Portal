import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and, isNull } from "@workspace/db";
import { db, userDevicesTable } from "@workspace/db";
import { requireAuth, requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.post("/devices/register", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).staffUser;
  const { fingerprint, userAgent, label } = req.body;

  if (!fingerprint || typeof fingerprint !== "string") {
    res.status(400).json({ error: "fingerprint is required" });
    return;
  }

  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.socket.remoteAddress ?? null;

  const [existing] = await db
    .select()
    .from(userDevicesTable)
    .where(and(eq(userDevicesTable.userId, user.id), eq(userDevicesTable.fingerprint, fingerprint), isNull(userDevicesTable.revokedAt)));

  if (existing) {
    const [updated] = await db
      .update(userDevicesTable)
      .set({ lastSeenAt: new Date(), ipAddress: ip })
      .where(eq(userDevicesTable.id, existing.id))
      .returning();
    res.json(updated);
    return;
  }

  const [device] = await db
    .insert(userDevicesTable)
    .values({ userId: user.id, fingerprint, userAgent: userAgent ?? null, label: label ?? null, ipAddress: ip })
    .returning();

  res.status(201).json(device);
});

router.get("/devices/me", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).staffUser;
  const devices = await db
    .select()
    .from(userDevicesTable)
    .where(and(eq(userDevicesTable.userId, user.id), isNull(userDevicesTable.revokedAt)));
  res.json(devices);
});

router.get("/devices/user/:userId", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(String(req.params.userId), 10);
  if (isNaN(userId)) { res.status(400).json({ error: "invalid userId" }); return; }
  const devices = await db
    .select()
    .from(userDevicesTable)
    .where(eq(userDevicesTable.userId, userId));
  res.json(devices);
});

router.delete("/devices/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).staffUser;
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(400).json({ error: "invalid id" }); return; }

  const isAdmin = ["chairman", "ict_admin", "hr_admin"].includes(user.role);
  const condition = isAdmin
    ? eq(userDevicesTable.id, id)
    : and(eq(userDevicesTable.id, id), eq(userDevicesTable.userId, user.id));

  const [device] = await db
    .update(userDevicesTable)
    .set({ revokedAt: new Date() })
    .where(condition)
    .returning();

  if (!device) { res.status(404).json({ error: "Device not found" }); return; }
  res.json({ message: "Device revoked" });
});

export default router;
