import { Router, type Request, type Response } from "express";
import { clerkClient } from "@clerk/express";
import { db, usersTable, loginHistoryTable, securityAlertsTable, eq, and, gte, sql } from "@workspace/db";
import dns from "dns/promises";

const router = Router();

const SHARED_PASSWORD = "MTC@Portal2025!";

/**
 * Check whether an open auto-alert whose eventRef starts with the given prefix
 * already exists for this user within the dedup window.
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

/**
 * Evaluate repeated-failure risk for a known user immediately after a failed
 * login attempt is recorded. Creates a HIGH auto-alert if ≥ 3 failures exist
 * for this userId in the last 15 minutes, deduplicated per 1 hour.
 * Returns the current failure count so the caller can decide on lockout.
 */
async function checkRepeatedFailures(
  userId: number,
  ipAddress: string | null,
): Promise<number> {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(loginHistoryTable)
    .where(
      and(
        eq(loginHistoryTable.userId, userId),
        eq(loginHistoryTable.success, false),
        gte(loginHistoryTable.createdAt, fifteenMinutesAgo),
      ),
    );

  const failureCount = row?.count ?? 0;
  if (failureCount < 3) return failureCount;

  const alreadyAlerted = await openAutoAlertExists(
    userId,
    "Repeated failed login attempts",
    60 * 60 * 1000,
  );
  if (!alreadyAlerted) {
    await db.insert(securityAlertsTable).values({
      severity: "high",
      userId,
      eventRef: `Repeated failed login attempts — ${failureCount} failures in the last 15 min`,
      status: "open",
      source: "auto",
      ipAddress,
      country: null,
    });
  }

  return failureCount;
}

/**
 * Auto-lock an account after LOCKOUT_THRESHOLD failed logins within 15 min.
 * Sets status = "suspended" with suspendedReason = "auto_lockout".
 * Returns true if the account was just locked (caller should 403 immediately).
 */
const LOCKOUT_THRESHOLD = 5;

async function applyLockoutIfNeeded(
  user: typeof usersTable.$inferSelect,
  failureCount: number,
  ipAddress: string | null,
): Promise<boolean> {
  if (failureCount < LOCKOUT_THRESHOLD) return false;
  // Only lock active accounts — already-suspended accounts stay as-is
  if (user.status !== "active") return false;

  await db
    .update(usersTable)
    .set({ status: "suspended", suspendedReason: "auto_lockout" })
    .where(eq(usersTable.id, user.id));

  // Raise a critical alert so admins can see and manually review/unlock
  await db.insert(securityAlertsTable).values({
    severity: "critical",
    userId: user.id,
    eventRef: `Account auto-locked after ${failureCount} failed login attempts in 15 min`,
    status: "open",
    source: "auto",
    ipAddress,
    country: null,
  });

  return true;
}

/**
 * Lightweight geo lookup: tries the ip-api.com free tier (no key needed,
 * 45 req/min, LAN/private addresses return empty). Falls back to null so
 * a transient network error never breaks login.
 */
async function getCountryFromIp(ip: string | null): Promise<string | null> {
  if (!ip || ip === "::1" || ip.startsWith("127.") || ip.startsWith("10.") || ip.startsWith("192.168.")) {
    return null;
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) return null;
    const json = await res.json() as { countryCode?: string };
    return json.countryCode ?? null;
  } catch {
    return null;
  }
}

/**
 * POST /api/auth/login-ticket
 *
 * Validates email + shared password and issues a Clerk sign-in token.
 * The client uses `signIn.create({ strategy: "ticket", ticket })` to complete
 * sign-in without any email verification code — works with the demo accounts
 * whose @mtc-groups.com addresses are not real inboxes.
 *
 * Security measures applied here:
 *  - User lookup before password check to correctly attribute failures
 *  - 200ms constant-time delay on all failure branches
 *  - Repeated-failure alert after ≥ 3 failures in 15 min
 *  - Hard account lockout (status → suspended/auto_lockout) after ≥ 5 failures in 15 min
 *  - IP geolocation recorded on every attempt
 */
router.post("/auth/login-ticket", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const delay = () => new Promise((r) => setTimeout(r, 200));
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
    // Cloudflare sets cf-connecting-ip when behind their proxy
    ?? (req.headers["cf-connecting-ip"] as string)
    ?? req.socket.remoteAddress
    ?? null;
  const userAgent = req.headers["user-agent"] ?? null;

  // Resolve country from IP — Cloudflare sets cf-ipcountry in prod; fall back
  // to ip-api.com free geo lookup for local/dev environments.
  const cfCountry = (req.headers["cf-ipcountry"] as string | undefined) ?? null;
  const country = cfCountry ?? await getCountryFromIp(ip).catch(() => null);

  // Look up the user FIRST so we can attribute failures to the correct userId
  // and run repeated-failure + lockout checks at failure time.
  let foundUser: typeof usersTable.$inferSelect | null = null;
  try {
    const [row] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()))
      .limit(1);
    foundUser = row ?? null;
  } catch (dbErr) {
    req.log.error({ dbErr }, "Auth: DB lookup failed during login");
  }

  if (password !== SHARED_PASSWORD) {
    await delay();
    await db.insert(loginHistoryTable).values({
      userId: foundUser?.id ?? null,
      ipAddress: ip,
      country,
      success: false,
      failureReason: "invalid_password",
      userAgent,
    }).catch(() => undefined);

    if (foundUser?.id != null) {
      const failureCount = await checkRepeatedFailures(foundUser.id, ip).catch(() => 0);
      await applyLockoutIfNeeded(foundUser, failureCount, ip).catch(() => {});
    }
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (!foundUser) {
    await delay();
    await db.insert(loginHistoryTable).values({
      userId: null,
      ipAddress: ip,
      country,
      success: false,
      failureReason: "user_not_found",
      userAgent,
    }).catch(() => undefined);
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  // Re-fetch the user in case the lockout above just suspended them
  const [freshUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, foundUser.id))
    .limit(1);
  const effectiveUser = freshUser ?? foundUser;

  if (effectiveUser.status !== "active") {
    const messages: Record<string, string> = {
      pending: "Your account is pending approval. Please contact your ICT Administrator.",
      suspended: effectiveUser.suspendedReason === "auto_lockout"
        ? `Your account has been locked after too many failed login attempts. Please contact your ICT Administrator to unlock it.`
        : "Your account has been suspended. Please contact your ICT Administrator.",
      archived: "Your account has been deactivated.",
    };
    res.status(403).json({ error: messages[effectiveUser.status] ?? "Account is not active" });
    return;
  }

  if (!effectiveUser.clerkUserId) {
    res.status(401).json({ error: "Account not yet activated. Please contact your administrator." });
    return;
  }

  try {
    const { token } = await clerkClient.signInTokens.createSignInToken({
      userId: effectiveUser.clerkUserId,
      expiresInSeconds: 300,
    });
    res.json({ ticket: token });
  } catch (err: any) {
    req.log.error({ err }, "Auth: Failed to create sign-in token");
    res.status(500).json({ error: "Authentication failed. Please try again." });
  }
});

export default router;