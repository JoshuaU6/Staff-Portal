import { Router, type Request, type Response } from "express";
import { clerkClient } from "@clerk/express";
import { db, usersTable, loginHistoryTable, securityAlertsTable, eq, and, gte, sql } from "@workspace/db";

const router = Router();

const SHARED_PASSWORD = (() => {
  if (process.env.SHARED_LOGIN_PASSWORD) return process.env.SHARED_LOGIN_PASSWORD;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SHARED_LOGIN_PASSWORD must be set in production");
  }
  return "changeme";
})();

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
 */
async function checkRepeatedFailures(
  userId: number,
  ipAddress: string | null,
): Promise<void> {
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
  if (failureCount < 3) return;

  const alreadyAlerted = await openAutoAlertExists(
    userId,
    "Repeated failed login attempts",
    60 * 60 * 1000,
  );
  if (alreadyAlerted) return;

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

/**
 * POST /api/auth/login-ticket
 *
 * Validates email + shared password and issues a Clerk sign-in token.
 * The client uses `signIn.create({ strategy: "ticket", ticket })` to complete
 * sign-in without any email verification code — works with the demo accounts
 * whose @mtc-groups.com addresses are not real inboxes.
 *
 * User lookup is done BEFORE password validation so that failed attempts
 * against known accounts are recorded with the correct userId, enabling
 * per-user repeated-failure detection immediately at failure time.
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
    ?? req.socket.remoteAddress
    ?? null;
  const userAgent = req.headers["user-agent"] ?? null;

  // Look up the user FIRST so we can attribute failures to the correct userId
  // and run repeated-failure checks at failure time. Returning the same generic
  // error in all failure branches preserves standard timing-safe behaviour.
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
      success: false,
      failureReason: "invalid_password",
      userAgent,
    }).catch(() => undefined);
    // Evaluate repeated-failure threshold immediately for known users
    if (foundUser?.id != null) {
      await checkRepeatedFailures(foundUser.id, ip).catch(() => undefined);
    }
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (!foundUser) {
    await delay();
    await db.insert(loginHistoryTable).values({
      userId: null,
      ipAddress: ip,
      success: false,
      failureReason: "user_not_found",
      userAgent,
    }).catch(() => undefined);
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (!foundUser.clerkUserId) {
    res.status(401).json({ error: "Account not yet activated. Please contact your administrator." });
    return;
  }

  try {
    const { token } = await clerkClient.signInTokens.createSignInToken({
      userId: foundUser.clerkUserId,
      expiresInSeconds: 300,
    });
    res.json({ ticket: token });
  } catch (err: any) {
    req.log.error({ err }, "Auth: Failed to create sign-in token");
    res.status(500).json({ error: "Authentication failed. Please try again." });
  }
});

export default router;
