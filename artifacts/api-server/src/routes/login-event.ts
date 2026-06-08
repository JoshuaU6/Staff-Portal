import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and, isNull, gte, sql } from "@workspace/db";
import { db, loginHistoryTable, userDevicesTable, securityAlertsTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

/**
 * Check whether an open auto-alert with the given prefix already exists for
 * this user within the dedup window. Prevents alert storms when the same risk
 * condition is detected on every subsequent login.
 */
async function openAutoAlertExists(
  userId: number,
  eventRefPrefix: string,
  windowMs: number,
): Promise<boolean> {
  const since = new Date(Date.now() - windowMs);
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(securityAlertsTable)
    .where(
      and(
        eq(securityAlertsTable.userId, userId),
        eq(securityAlertsTable.source, "auto"),
        eq(securityAlertsTable.status, "open"),
        gte(securityAlertsTable.createdAt, since),
        sql`${securityAlertsTable.eventRef} LIKE ${eventRefPrefix + "%"}`,
      ),
    );
  return (row?.count ?? 0) > 0;
}

async function createAutoAlert(
  userId: number,
  eventRef: string,
  severity: string,
  ipAddress: string | null,
  country: string | null,
): Promise<void> {
  await db.insert(securityAlertsTable).values({
    severity,
    userId,
    eventRef,
    status: "open",
    source: "auto",
    ipAddress,
    country,
  });
}

router.post("/auth/login-event", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).staffUser;

  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
    ?? req.socket.remoteAddress
    ?? null;

  const cfCountry = (req.headers["cf-ipcountry"] as string | undefined) ?? null;
  const bodyCountry = typeof req.body.country === "string" ? req.body.country : null;
  const country: string | null = cfCountry || bodyCountry;

  const fingerprint: string | null =
    typeof req.body.fingerprint === "string" ? req.body.fingerprint : null;

  const userAgent: string | null =
    typeof req.body.userAgent === "string"
      ? req.body.userAgent
      : (req.headers["user-agent"] ?? null);

  // ── Risk checks BEFORE recording current login ────────────────────────────

  // 1. New (unrecognised) device.
  //    Dedup key includes fingerprint prefix so each distinct unknown device
  //    generates its own alert within the 24 h window.
  if (fingerprint) {
    const [knownDevice] = await db
      .select({ id: userDevicesTable.id })
      .from(userDevicesTable)
      .where(
        and(
          eq(userDevicesTable.userId, user.id),
          eq(userDevicesTable.fingerprint, fingerprint),
          isNull(userDevicesTable.revokedAt),
        ),
      )
      .limit(1);

    if (!knownDevice) {
      // Use a fingerprint-anchored prefix so each unique device has its own dedup slot
      const fpPrefix = fingerprint.slice(0, 16);
      const dedupPrefix = `New device login [${fpPrefix}]`;
      const alreadyAlerted = await openAutoAlertExists(
        user.id,
        dedupPrefix,
        24 * 60 * 60 * 1000,
      );
      if (!alreadyAlerted) {
        await createAutoAlert(
          user.id,
          `${dedupPrefix} — ${userAgent ?? "unknown browser"} from ${ip ?? "unknown IP"}`,
          "high",
          ip,
          country,
        );
      }
    }
  }

  // 2. Geo-anomaly: compare current country against the user's TWO most recent
  //    successful login countries. Alert if it differs from both.
  //    Dedup per country per 24 h.
  if (country && country !== "XX") {
    const lastTwo = await db
      .select({ country: loginHistoryTable.country })
      .from(loginHistoryTable)
      .where(
        and(
          eq(loginHistoryTable.userId, user.id),
          eq(loginHistoryTable.success, true),
        ),
      )
      .orderBy(sql`${loginHistoryTable.createdAt} desc`)
      .limit(2);

    if (lastTwo.length >= 2) {
      const recentCountries = lastTwo.map((r) => r.country).filter(Boolean) as string[];
      // Alert only if the current country is not seen in either of the last two logins
      if (recentCountries.length > 0 && !recentCountries.includes(country)) {
        const dedupPrefix = `Login from unusual location — ${country}`;
        const alreadyAlerted = await openAutoAlertExists(
          user.id,
          dedupPrefix,
          24 * 60 * 60 * 1000,
        );
        if (!alreadyAlerted) {
          await createAutoAlert(
            user.id,
            `${dedupPrefix} (recent: ${[...new Set(recentCountries)].join(", ")})`,
            "medium",
            ip,
            country,
          );
        }
      }
    }
  }

  // 3. Repeated failed logins: checked at failure time in auth.ts.
  //    Also checked here to catch failures that occurred before the current
  //    session started (e.g., external brute-force before the user logged in).
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  const [failures] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(loginHistoryTable)
    .where(
      and(
        eq(loginHistoryTable.userId, user.id),
        eq(loginHistoryTable.success, false),
        gte(loginHistoryTable.createdAt, fifteenMinutesAgo),
      ),
    );

  const failureCount = failures?.count ?? 0;
  if (failureCount >= 3) {
    const alreadyAlerted = await openAutoAlertExists(
      user.id,
      "Repeated failed login attempts",
      60 * 60 * 1000,
    );
    if (!alreadyAlerted) {
      await createAutoAlert(
        user.id,
        `Repeated failed login attempts — ${failureCount} failures in the last 15 min`,
        "high",
        ip,
        country,
      );
    }
  }

  // ── Record the current (successful) login ─────────────────────────────────
  await db.insert(loginHistoryTable).values({
    userId: user.id,
    ipAddress: ip,
    country,
    deviceFingerprint: fingerprint,
    userAgent,
    success: true,
  });

  req.log.info({ userId: user.id, ip, country }, "Login event recorded");
  res.json({ message: "Login event recorded" });
});

export default router;
