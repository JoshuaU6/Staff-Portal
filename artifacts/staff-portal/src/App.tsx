import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider, SignIn, SignUp, useUser, ClerkLoading, ClerkLoaded, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { useSignIn } from "@clerk/react/legacy";
import { clerkAppearance } from "@/lib/clerk";
import { useEffect, useRef, useState } from "react";
import { Globe, ChevronDown, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n, { LANGUAGES } from "@/i18n";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import NotFound from "@/pages/not-found";
import SetupPage from "@/pages/setup";
import MessagesPage from "@/pages/messages";
import DashboardPage from "@/pages/dashboard";
import TasksPage from "@/pages/tasks";
import DocumentsPage from "@/pages/documents";
import AnnouncementsPage from "@/pages/announcements";
import AdminOverviewPage from "@/pages/admin/index";
import AdminUsersPage from "@/pages/admin/users";
import AdminUsersNewPage from "@/pages/admin/users-new";
import AdminDepartmentsPage from "@/pages/admin/departments";
import AdminAnnouncementsPage from "@/pages/admin/announcements";
import AdminTasksPage from "@/pages/admin/tasks";
import AdminAuditLogsPage from "@/pages/admin/audit-logs";
import AdminSessionsPage from "@/pages/admin/sessions";
import AdminAlertsPage from "@/pages/admin/alerts";
import AdminDocumentsPage from "@/pages/admin/documents";
import AdminPolicyPage from "@/pages/admin/policy";
import ChairmanEmergencyPage from "@/pages/chairman/emergency";
import ProfilePage from "@/pages/profile";
import DepartmentPage from "@/pages/department";
import { PolicyGate } from "@/components/PolicyGate";
import {
  getGetCurrentUserQueryKey,
  useGetCurrentPolicy,
  useAcknowledgePolicy,
  getGetCurrentPolicyQueryKey,
  type PolicyWithAck,
  ApiError,
} from "@workspace/api-client-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

// REQUIRED — resolves the publishable key from the current hostname so the same
// build serves multiple Clerk custom domains (dev FAPI vs prod proxy).
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

// Empty in dev (Clerk hits dev FAPI directly); auto-set by Replit in prod.
// Do NOT gate on import.meta.env.PROD — the empty dev value is intentional.
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL as string | undefined;

function PortalAuthLayout({ children, title, subtitle }: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  const { t } = useTranslation();
  const [lang, setLang] = useState(i18n.language ?? "en");
  const [langOpen, setLangOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? "bg-[#0d0d0d] text-white" : "bg-background text-foreground"}`}>
      {/* Top-right controls: theme toggle + language selector */}
      <div className="absolute top-4 right-5 z-10 flex items-center gap-2">
        <ThemeToggle />
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className={`flex items-center gap-1.5 text-sm transition-colors rounded px-3 py-1.5 border ${isDark ? "text-white/70 hover:text-white border-white/20" : "text-muted-foreground hover:text-foreground border-border"}`}
            data-testid="language-selector"
          >
            <Globe className="h-3.5 w-3.5" />
            {LANGUAGES.find((l) => l.code === lang)?.nativeLabel ?? "English"}
            <ChevronDown className="h-3 w-3" />
          </button>
          {langOpen && (
            <div className={`absolute right-0 mt-1 w-44 rounded shadow-xl z-50 overflow-hidden border ${isDark ? "bg-[#1e1e1e] border-white/10" : "bg-popover border-border"}`}>
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { i18n.changeLanguage(l.code); setLang(l.code); setLangOpen(false); }}
                  className={`flex items-center justify-between w-full text-left px-4 py-2 text-sm transition-colors ${l.code === lang ? "text-[#C0001A] font-medium" : isDark ? "text-white/70 hover:text-white hover:bg-white/5" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
                  data-testid={`lang-option-${l.code}`}
                >
                  <span>{l.nativeLabel}</span>
                  <span className="text-xs opacity-50">{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Centered auth block */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <img
          src={`${import.meta.env.BASE_URL}mtc-logo.png`}
          alt="MTC Group of Companies"
          className="h-24 w-auto object-contain mb-6"
          data-testid="portal-logo"
        />

        {/* Title + subtitle */}
        <h1 className={`text-2xl font-serif font-semibold tracking-tight mb-1 text-center ${isDark ? "text-white" : "text-foreground"}`}>{t(title)}</h1>
        <p className={`text-sm mb-5 text-center ${isDark ? "text-white/50" : "text-muted-foreground"}`}>{t(subtitle)}</p>

        {/* Card area — skeleton shown while Clerk JS loads to prevent layout jump */}
        <div className="w-full max-w-md">
          <ClerkLoading>
            <div className="bg-card border border-border rounded-xl shadow-xl p-8 space-y-4 animate-pulse">
              <div className="h-5 bg-muted rounded w-2/3 mx-auto" />
              <div className="h-4 bg-muted/70 rounded w-1/2 mx-auto" />
              <div className="mt-6 h-10 bg-muted rounded-lg" />
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-border" />
                <div className="h-3 w-6 bg-muted rounded" />
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="h-10 bg-muted/70 rounded-lg border border-border" />
              <div className="h-10 bg-primary/80 rounded-lg mt-2" />
            </div>
          </ClerkLoading>
          <ClerkLoaded>
            {children}
          </ClerkLoaded>
        </div>
      </div>

      {/* Footer */}
      <div className="pb-5 text-center">
        <p className={`text-xs ${isDark ? "text-white/25" : "text-muted-foreground/40"}`}>
          &copy; {new Date().getFullYear()} MTC Group of Companies. All rights reserved.
        </p>
      </div>
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function PolicyGateWrapper({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const { data: policy, isLoading, isError, error } = useGetCurrentPolicy({
    query: {
      queryKey: getGetCurrentPolicyQueryKey(),
      retry: false,
    },
  });
  const acknowledge = useAcknowledgePolicy();

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-6 h-6 border-2 border-[#C0001A] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // 404 means no policy has been published yet — let everyone through (admins need
  // access to /admin/policy to publish the first version; staff need no gate).
  const isNoPolicyError = error instanceof ApiError && (error as ApiError).status === 404;

  if (isError && !isNoPolicyError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3 max-w-sm">
          <p className="text-sm font-medium text-foreground">Unable to load policy</p>
          <p className="text-xs text-muted-foreground">Portal access requires policy status confirmation. Please refresh.</p>
          <button
            className="text-xs underline text-muted-foreground"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  if (!policy || policy.acknowledgedAt || isNoPolicyError) return <>{children}</>;

  const handleAcknowledge = async () => {
    await new Promise<void>((resolve, reject) => {
      acknowledge.mutate(undefined, {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getGetCurrentPolicyQueryKey() });
          resolve();
        },
        onError: reject,
      });
    });
  };

  return <PolicyGate policy={policy} onAcknowledge={handleAcknowledge} />;
}

function LoginForm() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) {
      setError("Authentication not ready — please refresh the page and try again.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json() as { ticket?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Invalid credentials");
        return;
      }

      const result = await signIn.create({ strategy: "ticket", ticket: data.ticket! });

      if (result.status === "complete") {
        // Hard redirect after setActive so the page reloads with the session cookie
        // already in place — avoids the race where Clerk's React state hasn't updated
        // yet and RequireAuth would incorrectly redirect back to /login.
        await setActive({ session: result.createdSessionId });
        window.location.replace(basePath + "/dashboard");
      } else {
        setError(`Sign-in returned status "${result.status}". Please reset accounts at /portal/setup and try again.`);
      }
    } catch (err: any) {
      const msg: string = err?.errors?.[0]?.longMessage ?? err?.message ?? "An unexpected error occurred";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const input = `w-full h-10 px-3 rounded-lg border text-sm outline-none transition-colors focus:ring-2 focus:ring-[#C0001A]/40 ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#C0001A]/60" : "bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-[#C0001A]"}`;
  const label = `block text-xs font-medium uppercase tracking-wider mb-1.5 ${isDark ? "text-white/50" : "text-muted-foreground"}`;

  return (
    <div className={`rounded-xl shadow-xl border p-8 ${isDark ? "bg-[#161616] border-white/10" : "bg-card border-border"}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={label} htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={input}
            placeholder="you@mtc-groups.com"
            data-testid="login-email"
          />
        </div>
        <div>
          <label className={label} htmlFor="login-password">Password</label>
          <div className="relative">
            <input
              id="login-password"
              type={showPwd ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${input} pr-10`}
              placeholder="Enter your password"
              data-testid="login-password"
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? "text-white/40 hover:text-white/70" : "text-muted-foreground hover:text-foreground"}`}
              data-testid="login-toggle-password"
            >
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}
        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full h-10 bg-[#C0001A] hover:bg-[#a0001a] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors mt-1"
          data-testid="login-submit"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect to="/login" />;
  return <PolicyGateWrapper>{children}</PolicyGateWrapper>;
}

function AppRouter() {
  const { isSignedIn, isLoaded } = useUser();
  const [location, navigate] = useLocation();

  const { data: bootstrapStatus } = useQuery({
    queryKey: ["bootstrap-status"],
    queryFn: () =>
      fetch("/api/bootstrap", { credentials: "include" })
        .then((r) => r.json() as Promise<{ needed: boolean; partial: boolean; nullCount: number }>),
    enabled: isLoaded,
    staleTime: Infinity,
    retry: false,
  });

  useEffect(() => {
    if ((bootstrapStatus?.needed || bootstrapStatus?.partial) && location !== "/setup") {
      navigate("/setup");
    }
  }, [bootstrapStatus, location]);

  return (
    <Switch>
      <Route path="/">
        {isLoaded && isSignedIn ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
      </Route>

      <Route path="/login/*?">
        {isLoaded && isSignedIn
          ? <Redirect to="/dashboard" />
          : (
            <PortalAuthLayout title="auth.login_title" subtitle="auth.login_subtitle">
              <ClerkLoaded>
                <LoginForm />
              </ClerkLoaded>
            </PortalAuthLayout>
          )
        }
      </Route>

      <Route path="/register/*?">
        <PortalAuthLayout title="auth.register_title" subtitle="auth.register_subtitle">
          <SignUp
            routing="path"
            path={`${basePath}/register`}
            signInUrl={`${basePath}/login`}
            fallbackRedirectUrl={`${basePath}/dashboard`}
            appearance={clerkAppearance}
          />
        </PortalAuthLayout>
      </Route>

      <Route path="/setup">
        <SetupPage />
      </Route>

      <Route path="/dashboard">
        <RequireAuth><DashboardPage /></RequireAuth>
      </Route>
      <Route path="/tasks">
        <RequireAuth><TasksPage /></RequireAuth>
      </Route>
      <Route path="/documents">
        <RequireAuth><DocumentsPage /></RequireAuth>
      </Route>
      <Route path="/announcements">
        <RequireAuth><AnnouncementsPage /></RequireAuth>
      </Route>

      <Route path="/profile">
        <RequireAuth><ProfilePage /></RequireAuth>
      </Route>

      <Route path="/department">
        <RequireAuth><DepartmentPage /></RequireAuth>
      </Route>

      <Route path="/messages">
        <RequireAuth><MessagesPage /></RequireAuth>
      </Route>

      <Route path="/admin">
        <RequireAuth><AdminOverviewPage /></RequireAuth>
      </Route>
      <Route path="/admin/users/new">
        <RequireAuth><AdminUsersNewPage /></RequireAuth>
      </Route>
      <Route path="/admin/users">
        <RequireAuth><AdminUsersPage /></RequireAuth>
      </Route>
      <Route path="/admin/departments">
        <RequireAuth><AdminDepartmentsPage /></RequireAuth>
      </Route>
      <Route path="/admin/announcements">
        <RequireAuth><AdminAnnouncementsPage /></RequireAuth>
      </Route>
      <Route path="/admin/tasks">
        <RequireAuth><AdminTasksPage /></RequireAuth>
      </Route>
      <Route path="/admin/audit-logs">
        <RequireAuth><AdminAuditLogsPage /></RequireAuth>
      </Route>
      <Route path="/admin/sessions">
        <RequireAuth><AdminSessionsPage /></RequireAuth>
      </Route>
      <Route path="/admin/alerts">
        <RequireAuth><AdminAlertsPage /></RequireAuth>
      </Route>
      <Route path="/admin/documents">
        <RequireAuth><AdminDocumentsPage /></RequireAuth>
      </Route>
      <Route path="/admin/policy">
        <RequireAuth><AdminPolicyPage /></RequireAuth>
      </Route>

      <Route path="/chairman/emergency">
        <RequireAuth><ChairmanEmergencyPage /></RequireAuth>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ClerkProvider
        publishableKey={clerkPubKey}
        proxyUrl={clerkProxyUrl}
        appearance={clerkAppearance}
      >
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={basePath}>
              <ClerkQueryClientCacheInvalidator />
              <AppRouter />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </ThemeProvider>
  );
}

export default App;
