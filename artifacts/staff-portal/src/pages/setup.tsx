import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Shield, AlertCircle, CheckCircle2, Users, RefreshCw, Trash2, Mail } from "lucide-react";

const DEMO_ACCOUNTS = [
  { email: "chairman@mtc-groups.com",   role: "Chairman",         staffId: "MTC-CHAIR-001" },
  { email: "ict@mtc-groups.com",        role: "ICT Admin",        staffId: "MTC-ICT-001"   },
  { email: "hr@mtc-groups.com",         role: "HR Admin",         staffId: "MTC-HR-001"    },
  { email: "compliance@mtc-groups.com", role: "Compliance Admin", staffId: "MTC-COMP-001"  },
  { email: "auditor@mtc-groups.com",    role: "Auditor",          staffId: "MTC-AUD-001"   },
  { email: "depthead@mtc-groups.com",   role: "Dept. Head",       staffId: "MTC-DH-001"    },
  { email: "manager@mtc-groups.com",    role: "Manager",          staffId: "MTC-MGR-001"   },
  { email: "supervisor@mtc-groups.com", role: "Supervisor",       staffId: "MTC-SUP-001"   },
  { email: "staff@mtc-groups.com",      role: "Staff",            staffId: "MTC-STAFF-001" },
];

type BootstrapStatus = { needed: boolean; partial: boolean; nullCount: number } | null;

export default function SetupPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [bootstrapStatus, setBootstrapStatus] = useState<BootstrapStatus>(null);
  const [loading, setLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [result, setResult] = useState<{ accounts: { email: string; role: string }[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/bootstrap", { credentials: "include" })
      .then((r) => r.json())
      .then(setBootstrapStatus)
      .catch(() => setBootstrapStatus({ needed: true, partial: false, nullCount: 0 }));
  }, []);

  async function handleInitialize() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Setup failed. Please try again.");
        return;
      }
      setResult({ accounts: data.accounts });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResync() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/bootstrap/resync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Resync failed. Please try again.");
        return;
      }
      setResult({
        accounts: (data.results as { email: string; synced: boolean }[])
          .filter((r) => r.synced)
          .map((r) => ({ email: r.email, role: DEMO_ACCOUNTS.find((a) => a.email === r.email)?.role ?? "" })),
      });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetClerk() {
    setError(null);
    setLoading(true);
    try {
      // Step 1: delete existing Clerk accounts and clear clerkUserId in DB
      const resetRes = await fetch("/api/bootstrap/reset-clerk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      const resetData = await resetRes.json();
      if (!resetRes.ok) {
        setError(resetData.error ?? "Reset failed. Please try again.");
        return;
      }

      // Step 2: immediately recreate accounts (now without passwords in dev)
      const resyncRes = await fetch("/api/bootstrap/resync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      const resyncData = await resyncRes.json();
      if (!resyncRes.ok) {
        setError(resyncData.error ?? "Accounts reset but resync failed. Go back to setup and click Sync Accounts.");
        return;
      }

      setResetDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isPartial = bootstrapStatus && !bootstrapStatus.needed && bootstrapStatus.partial;
  const isNeeded = bootstrapStatus?.needed;
  const isConfigured = bootstrapStatus && !bootstrapStatus.needed && !bootstrapStatus.partial;

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? "bg-[#0d0d0d] text-white" : "bg-background text-foreground"}`}>
      <div className="absolute top-4 right-5 z-10">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <img
          src={`${import.meta.env.BASE_URL}mtc-logo.png`}
          alt="MTC Group of Companies"
          className="h-20 w-auto object-contain mb-6"
        />

        <div className="w-full max-w-lg">
          {result ? (
            /* ── Success state ── */
            <div className={`rounded-xl shadow-xl border ${isDark ? "bg-[#161616] border-white/10" : "bg-card border-border"}`}>
              <div className="p-6 border-b border-inherit flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                <div>
                  <h2 className={`text-base font-semibold ${isDark ? "text-white" : "text-foreground"}`}>
                    {isPartial ? "Accounts Synced" : "Portal Initialized"}
                  </h2>
                  <p className={`text-xs ${isDark ? "text-white/50" : "text-muted-foreground"}`}>
                    {result.accounts.length === 0
                      ? "All accounts were already configured"
                      : `${result.accounts.length} account${result.accounts.length !== 1 ? "s" : ""} created and ready`}
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className={`rounded-lg border p-4 ${isDark ? "bg-white/3 border-white/10" : "bg-muted/40 border-border"}`}>
                  <p className={`text-xs font-medium mb-2 ${isDark ? "text-white/70" : "text-foreground"}`}>
                    Shared login password
                  </p>
                  <code className={`block text-sm font-mono px-3 py-2 rounded ${isDark ? "bg-black/40 text-white/90" : "bg-background text-foreground border border-border"}`}>
                    MTC@Portal2025!
                  </code>
                  <p className={`text-xs mt-2 ${isDark ? "text-white/40" : "text-muted-foreground"}`}>
                    Enter your email address then this password at the login screen.
                  </p>
                </div>

                <div>
                  <p className={`text-xs font-medium uppercase tracking-wider mb-2 ${isDark ? "text-white/40" : "text-muted-foreground"}`}>
                    All accounts — log in at <a href="/portal/login" className="text-[#C0001A] hover:underline">/portal/login</a>
                  </p>
                  <div className="space-y-1">
                    {DEMO_ACCOUNTS.map((a) => (
                      <div key={a.email} className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${isDark ? "bg-white/3 border border-white/5" : "bg-muted/30 border border-border"}`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`font-mono text-xs px-1 py-0.5 rounded flex-shrink-0 ${isDark ? "bg-white/10 text-white/50" : "bg-background text-muted-foreground"}`}>
                            {a.staffId}
                          </span>
                          <span className={`truncate ${isDark ? "text-white/70" : "text-foreground"}`}>{a.email}</span>
                        </div>
                        <span className={`text-xs ml-3 flex-shrink-0 ${isDark ? "text-white/40" : "text-muted-foreground"}`}>{a.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => { window.location.href = "/portal/login"; }}
                  className="w-full bg-[#C0001A] hover:bg-[#a0001a] text-white"
                  data-testid="setup-go-to-login"
                >
                  Go to Login
                </Button>
              </div>
            </div>

          ) : isPartial ? (
            /* ── Partial state: accounts exist but some Clerk accounts are missing ── */
            <div className={`rounded-xl shadow-xl border ${isDark ? "bg-[#161616] border-white/10" : "bg-card border-border"}`}>
              <div className="p-6 border-b border-inherit">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <RefreshCw className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h1 className={`text-base font-semibold ${isDark ? "text-white" : "text-foreground"}`}>
                      Sync Required
                    </h1>
                    <p className={`text-xs ${isDark ? "text-white/50" : "text-muted-foreground"}`}>
                      {bootstrapStatus.nullCount} account{bootstrapStatus.nullCount !== 1 ? "s" : ""} missing Clerk credentials
                    </p>
                  </div>
                </div>
                <p className={`text-sm leading-relaxed ${isDark ? "text-white/60" : "text-muted-foreground"}`}>
                  Staff records exist in the database but some login accounts were not created in Clerk.
                  Click <strong className={isDark ? "text-white/80" : "text-foreground"}>Sync Accounts</strong> to create them now.
                  Users sign in using their email address — they will receive a one-time code.
                </p>
              </div>

              <div className="px-6 pt-4 pb-2">
                <div className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wider mb-3 ${isDark ? "text-white/30" : "text-muted-foreground"}`}>
                  <Users className="w-3.5 h-3.5" />
                  All portal accounts
                </div>
                <div className="space-y-1.5">
                  {DEMO_ACCOUNTS.map((acct) => (
                    <div
                      key={acct.email}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${isDark ? "bg-white/3 border border-white/5" : "bg-muted/40 border border-border"}`}
                      data-testid={`demo-account-${acct.staffId}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${isDark ? "bg-white/10 text-white/50" : "bg-background text-muted-foreground"}`}>
                          {acct.staffId}
                        </span>
                        <span className={`truncate ${isDark ? "text-white/70" : "text-foreground"}`}>{acct.email}</span>
                      </div>
                      <span className={`text-xs flex-shrink-0 ml-3 ${isDark ? "text-white/40" : "text-muted-foreground"}`}>{acct.role}</span>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="px-6 pt-3">
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-500">{error}</p>
                  </div>
                </div>
              )}

              <div className="p-6 pt-4">
                <Button
                  onClick={handleResync}
                  disabled={loading}
                  className="w-full bg-[#C0001A] hover:bg-[#a0001a] text-white"
                  data-testid="setup-resync"
                >
                  {loading ? "Creating accounts..." : "Sync Accounts"}
                </Button>
                <p className={`text-center text-xs mt-3 ${isDark ? "text-white/25" : "text-muted-foreground/50"}`}>
                  Safe to run multiple times — existing accounts are not affected.
                </p>
              </div>
            </div>

          ) : isNeeded !== false ? (
            /* ── First-time init state ── */
            <div className={`rounded-xl shadow-xl border ${isDark ? "bg-[#161616] border-white/10" : "bg-card border-border"}`}>
              <div className="p-6 border-b border-inherit">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-[#C0001A]/10">
                    <Shield className="w-5 h-5 text-[#C0001A]" />
                  </div>
                  <div>
                    <h1 className={`text-base font-semibold ${isDark ? "text-white" : "text-foreground"}`}>
                      First-Time Portal Setup
                    </h1>
                    <p className={`text-xs ${isDark ? "text-white/50" : "text-muted-foreground"}`}>
                      Initialize staff accounts for all roles
                    </p>
                  </div>
                </div>
                <p className={`text-sm leading-relaxed ${isDark ? "text-white/60" : "text-muted-foreground"}`}>
                  This creates <strong className={isDark ? "text-white/80" : "text-foreground"}>9 staff accounts</strong> covering every role.
                  Each user signs in by entering their email address — a one-time verification code is sent to their inbox.
                </p>
              </div>

              <div className="px-6 pt-4 pb-2">
                <div className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wider mb-3 ${isDark ? "text-white/30" : "text-muted-foreground"}`}>
                  <Users className="w-3.5 h-3.5" />
                  Accounts that will be created
                </div>
                <div className="space-y-1.5">
                  {DEMO_ACCOUNTS.map((acct) => (
                    <div
                      key={acct.email}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${isDark ? "bg-white/3 border border-white/5" : "bg-muted/40 border border-border"}`}
                      data-testid={`demo-account-${acct.staffId}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${isDark ? "bg-white/10 text-white/50" : "bg-background text-muted-foreground"}`}>
                          {acct.staffId}
                        </span>
                        <span className={`truncate ${isDark ? "text-white/70" : "text-foreground"}`}>{acct.email}</span>
                      </div>
                      <span className={`text-xs flex-shrink-0 ml-3 ${isDark ? "text-white/40" : "text-muted-foreground"}`}>{acct.role}</span>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="px-6 pt-3">
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-500">{error}</p>
                  </div>
                </div>
              )}

              <div className="p-6 pt-4">
                <Button
                  onClick={handleInitialize}
                  disabled={loading}
                  className="w-full bg-[#C0001A] hover:bg-[#a0001a] text-white"
                  data-testid="setup-submit"
                >
                  {loading ? "Creating accounts..." : "Initialize Portal"}
                </Button>
                <p className={`text-center text-xs mt-3 ${isDark ? "text-white/25" : "text-muted-foreground/50"}`}>
                  One-time action. Cannot be undone.
                </p>
              </div>
            </div>

          ) : resetDone ? (
            /* ── Reset + resync complete ── */
            <div className={`rounded-xl shadow-xl border ${isDark ? "bg-[#161616] border-white/10" : "bg-card border-border"}`}>
              <div className="p-6 border-b border-inherit flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                <div>
                  <h2 className={`text-base font-semibold ${isDark ? "text-white" : "text-foreground"}`}>Accounts Recreated</h2>
                  <p className={`text-xs ${isDark ? "text-white/50" : "text-muted-foreground"}`}>
                    All 9 login accounts have been reset and are ready
                  </p>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className={`rounded-lg border p-4 ${isDark ? "bg-white/3 border-white/10" : "bg-muted/40 border-border"}`}>
                  <p className={`text-xs font-medium mb-2 ${isDark ? "text-white/70" : "text-foreground"}`}>Shared login password</p>
                  <code className={`block text-sm font-mono px-3 py-2 rounded ${isDark ? "bg-black/40 text-white/90" : "bg-background text-foreground border border-border"}`}>
                    MTC@Portal2025!
                  </code>
                  <p className={`text-xs mt-2 ${isDark ? "text-white/40" : "text-muted-foreground"}`}>
                    Enter your email address then this password at the login screen.
                  </p>
                </div>
                <Button
                  onClick={() => { window.location.href = "/portal/login"; }}
                  className="w-full bg-[#C0001A] hover:bg-[#a0001a] text-white"
                  data-testid="setup-go-to-login"
                >
                  Go to Login
                </Button>
              </div>
            </div>

          ) : isConfigured ? (
            /* ── All good: portal is fully configured ── */
            <div className={`rounded-xl shadow-xl border ${isDark ? "bg-[#161616] border-white/10" : "bg-card border-border"}`}>
              <div className="p-6 border-b border-inherit flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                <div>
                  <h2 className={`text-base font-semibold ${isDark ? "text-white" : "text-foreground"}`}>Portal is configured</h2>
                  <p className={`text-xs ${isDark ? "text-white/50" : "text-muted-foreground"}`}>
                    All accounts are active. Sign in using your email address.
                  </p>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <Button
                  onClick={() => { window.location.href = "/portal/login"; }}
                  className="w-full bg-[#C0001A] hover:bg-[#a0001a] text-white"
                  data-testid="setup-go-to-login"
                >
                  Go to Login
                </Button>

                <div className={`rounded-lg border p-4 space-y-2.5 ${isDark ? "bg-white/3 border-white/10" : "bg-muted/30 border-border"}`}>
                  <p className={`text-xs font-medium ${isDark ? "text-white/60" : "text-foreground"}`}>
                    Password: <code className="font-mono">MTC@Portal2025!</code>
                  </p>
                  <p className={`text-xs ${isDark ? "text-white/40" : "text-muted-foreground"}`}>
                    All accounts use this shared password. If login is broken, use the button below
                    to delete and recreate all Clerk accounts fresh.
                  </p>
                  {error && (
                    <div className="flex items-start gap-2 p-2 rounded bg-red-500/10 border border-red-500/20">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-500">{error}</p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
                    onClick={handleResetClerk}
                    disabled={loading}
                    data-testid="setup-reset-clerk"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {loading ? "Resetting..." : "Reset Login Accounts"}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="pb-5 text-center">
        <p className={`text-xs ${isDark ? "text-white/25" : "text-muted-foreground/40"}`}>
          &copy; {new Date().getFullYear()} MTC Group of Companies. All rights reserved.
        </p>
      </div>
    </div>
  );
}
