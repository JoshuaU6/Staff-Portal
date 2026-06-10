import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider, SignIn, SignUp, useUser, ClerkLoading, ClerkLoaded, useClerk, useAuth } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { useSignIn } from "@clerk/react/legacy";
import { clerkAppearance } from "@/lib/clerk";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";

const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined);
if (apiBase) setBaseUrl(apiBase);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

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

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <img
          src={`${import.meta.env.BASE_URL}mtc-logo.png`}
          alt="MTC Group of Companies"
          className="h-24 w-auto object-contain mb-6"
          data-testid="portal-logo"
        />
        <h1 className={`text-2xl font-serif font-semibold tracking-tight mb-1 text-center ${isDark ? "text-white" : "text-foreground"}`}>{t(title)}</h1>
        <p className={`text-sm mb-5 text-center ${isDark ? "text-white/50" : "text-muted-foreground"}`}>{t(subtitle)}</p>
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

function ClerkTokenSync() {
  const { getToken } = useAuth();

  useLayoutEffect(() => {
    setAuthTokenGetter(async () => {
      try {
        return await getToken();
      } catch {
        return null;
      }
    });
    return () => setAuthTokenGetter(null);
  });

  return null;
}

function PolicyGateWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const qc = useQueryClient();
  const [retryCount, setRetryCount] = useState(0);
  const { data: policy, isLoading, isError, error } = useGetCurrentPolicy({
    query: {
      queryKey: getGetCurrentPolicyQueryKey(),
      retry: 1,
    },
  });
  const acknowledge = useAcknowledgePolicy();

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-6 h-6 border-2 border-[#C0001A] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isNoPolicyError = !(error instanceof ApiError) ||
    (error as ApiError).status === 404 ||
    (error as ApiError).status === 401 ||
    (error as ApiError).status >= 500;

  if (isError && !isNoPolicyError) {
    const handleRetry = () => {
      setRetryCount(c => c + 1);
      qc.invalidateQueries({ queryKey: getGetCurrentPolicyQueryKey() });
    };

    return (
      <div className={`min-h-screen ${isDark ? "bg-[#0d0d0d]" : "bg-background"} flex items-center justify-center`}>
        <div className={`text-center space-y-3 max-w-sm p-4 border rounded-lg ${isDark ? "bg-[#1a1a1a] border-white/10" : "bg-card border-border"}`}>
          <p className={`text-sm font-medium ${isDark ? "text-white" : "text-foreground"}`}>Unable to load policy</p>
          <p className={`text-xs ${isDark ? "text-white/60" : "text-muted-foreground"}`}>
            {error instanceof ApiError ? `Server error: ${error.status} ${error.statusText}` : "Network error while fetching policy status."}
          </p>
          <div className="flex gap-2 justify-center pt-2">
            <button
              className={`text-xs px-3 py-1.5 rounded border transition-colors ${isDark ? "border-white/20 text-white/70 hover:bg-white/5" : "border-border text-muted-foreground hover:bg-muted/50"}`}
              onClick={handleRetry}
            >
              Retry
            </button>
            <button
              className="text-xs px-3 py-1.5 rounded bg-[#C0001A] hover:bg-[#a0001a] text-white transition-colors"
              onClick={() => window.location.href = "/login"}
            >
              Back to Login
            </button>
          </div>
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

  const [stage, setStage] = useState<"credentials" | "mfa">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) {
      setError("Authentication not ready — please refresh the page and try again.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const apiUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
      const res = await fetch(`${apiUrl}/api/auth/login-ticket`, {
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
        await setActive({ session: result.createdSessionId });
        window.location.replace(basePath + "/dashboard");
      } else if (result.status === "needs_second_factor") {
        setStage("mfa");
        setTotpCode("");
        setError(null);
      } else {
        setError(`Sign-in returned status "${result.status}". Please reset accounts at /setup and try again.`);
      }
    } catch (err: any) {
      const msg: string = err?.errors?.[0]?.longMessage ?? err?.message ?? "An unexpected error occurred";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    const code = totpCode.replace(/\s/g, "");
    if (code.length !== 6) {
      setError("Please enter the 6-digit code from your authenticator app.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await signIn.attemptSecondFactor({ strategy: "totp", code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        window.location.replace(basePath + "/dashboard");
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (err: any) {
      const clerkErr = err?.errors?.[0];
      if (clerkErr?.code === "form_code_incorrect") {
        setError("Incorrect code. Please check your authenticator app and try again.");
      } else {
        setError(clerkErr?.longMessage ?? err?.message ?? "Verification failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const input = `w-full h-10 px-3 rounded-lg border text-sm outline-none transition-colors focus:ring-2 focus:ring-[#C0001A]/40 ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#C0001A]/60" : "bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-[#C0001A]"}`;
  const label = `block text-xs font-medium uppercase tracking-wider mb-1.5 ${isDark ? "text-white/50" : "text-muted-foreground"}`;

  if (stage === "mfa") {
    return (
      <div className={`rounded-xl shadow-xl border p-8 ${isDark ? "bg-[#161616] border-white/10" : "bg-card border-border"}`}>
        <div className="flex items-center gap-2 mb-5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isDark ? "bg-[#C0001A]/20" : "bg-[#C0001A]/10"}`}>
            <AlertCircle className="w-4 h-4 text-[#C0001A]" />
          </div>
          <div>
            <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-foreground"}`}>Two-factor verification</p>
            <p className={`text-xs ${isDark ? "text-white/50" : "text-muted-foreground"}`}>Enter the code from your authenticator app</p>
          </div>
        </div>
        <form onSubmit={handleMfaSubmit} className="space-y-4">
          <div>
            <label className={label} htmlFor="mfa-code">Authenticator code</label>
            <input
              id="mfa-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9 ]*"
              maxLength={7}
              autoComplete="one-time-code"
              autoFocus
              required
              value={totpCode}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "").slice(0, 6);
                setTotpCode(raw.length > 3 ? raw.slice(0, 3) + " " + raw.slice(3) : raw);
              }}
              className={`${input} text-center text-xl tracking-[0.4em] font-mono`}
              placeholder="000 000"
              data-testid="mfa-code-input"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-500">{error}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={loading || totpCode.replace(/\s/g, "").length !== 6}
            className="w-full h-10 bg-[#C0001A] hover:bg-[#a0001a] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
            data-testid="mfa-submit"
          >
            {loading ? "Verifying…" : "Verify"}
          </button>
          <button
            type="button"
            onClick={() => { setStage("credentials"); setError(null); setTotpCode(""); }}
            className={`w-full text-xs underline ${isDark ? "text-white/40 hover:text-white/60" : "text-muted-foreground hover:text-foreground"}`}
            data-testid="mfa-back"
          >
            Back to sign in
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={`rounded-xl shadow-xl border p-8 ${isDark ? "bg-[#161616] border-white/10" : "bg-card border-border"}`}>
      <form onSubmit={handleCredentialsSubmit} className="space-y-4">
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
      fetch(`${(import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ""}/api/bootstrap`, { credentials: "include" })
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
              <ClerkTokenSync />
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