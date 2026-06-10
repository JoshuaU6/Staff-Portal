import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Sidebar from "./Sidebar";
import { Bell, Menu, Lock, X } from "lucide-react";
import {
  useListSecurityAlerts,
  getListSecurityAlertsQueryKey,
  useGetCurrentUser,
  useRecordLoginEvent,
  useGetLockStatus,
  getGetLockStatusQueryKey,
} from "@workspace/api-client-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

function getOrCreateDeviceFingerprint(): string {
  const STORAGE_KEY = "mtc_device_fp";
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;
  const raw = [
    navigator.userAgent,
    navigator.language,
    String(screen.width),
    String(screen.height),
    String(navigator.hardwareConcurrency ?? 0),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join("|");
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (Math.imul(31, hash) + raw.charCodeAt(i)) | 0;
  }
  const fp = Math.abs(hash).toString(36) + "-" + Date.now().toString(36);
  localStorage.setItem(STORAGE_KEY, fp);
  return fp;
}

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const ADMIN_ROLES = ["chairman", "ict_admin", "hr_admin"];

export default function AppLayout({ children, title }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lockBannerDismissed, setLockBannerDismissed] = useState(false);

  const { data: staffProfile } = useGetCurrentUser();
  const isAdmin = staffProfile ? ADMIN_ROLES.includes(staffProfile.role ?? "") : false;
  const isChairman = staffProfile?.role === "chairman";

  const recordLoginEvent = useRecordLoginEvent();
  useEffect(() => {
    if (!staffProfile) return;
    if (sessionStorage.getItem("login_event_fired")) return;
    sessionStorage.setItem("login_event_fired", "1");
    const fingerprint = getOrCreateDeviceFingerprint();
    recordLoginEvent.mutate({
      data: {
        fingerprint,
        userAgent: navigator.userAgent,
      },
    });
  }, [staffProfile?.id]);
  const { data: alerts } = useListSecurityAlerts(
    { status: "open" },
    { query: { enabled: isAdmin, queryKey: getListSecurityAlertsQueryKey({ status: "open" }) } }
  );
  const openAlertCount = alerts?.length ?? 0;

  const { data: lockStatus } = useGetLockStatus({
    query: { enabled: isChairman, queryKey: getGetLockStatusQueryKey(), refetchInterval: 30_000 },
  });
  const showLockBanner = isChairman && lockStatus?.active && !lockBannerDismissed;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: slide-in drawer on mobile, static on desktop */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col",
          "md:relative md:inset-auto md:z-auto",
          "transition-transform duration-200 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {showLockBanner && (
          <div
            className="flex items-center justify-between gap-3 px-4 py-2.5 bg-destructive text-destructive-foreground text-xs font-semibold shrink-0"
            data-testid="emergency-lock-banner"
          >
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 shrink-0" />
              <span>EMERGENCY LOCK ACTIVE — {lockStatus?.suspendedCount ?? 0} account(s) suspended. All sessions terminated.</span>
            </div>
            <button
              onClick={() => setLockBannerDismissed(true)}
              className="hover:opacity-70 transition-opacity shrink-0"
              data-testid="dismiss-lock-banner"
              aria-label="Dismiss banner"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0 bg-card gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              className="md:hidden p-1 -ml-1 rounded hover:bg-accent text-foreground shrink-0"
              onClick={() => setSidebarOpen(true)}
              data-testid="button-mobile-menu"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-semibold text-foreground tracking-tight truncate">
              {title ?? "MTC Group Staff Portal"}
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && openAlertCount > 0 && (
              <div
                className="relative cursor-pointer"
                data-testid="alert-badge"
                onClick={() => window.location.href = "/admin/alerts"}
                title="View security alerts"
              >
                <Bell className="h-4 w-4 text-primary" />
                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                  {openAlertCount > 9 ? "9+" : openAlertCount}
                </span>
              </div>
            )}
            <div className="hidden sm:block text-xs text-muted-foreground font-mono">
              {new Date().toLocaleDateString("en-GB", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
            </div>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6" data-testid="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}