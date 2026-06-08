import AppLayout from "@/components/layout/AppLayout";
import {
  useGetDashboardSummary,
  getGetDashboardSummaryQueryKey,
  useGetOnlineUsers,
  getGetOnlineUsersQueryKey,
} from "@workspace/api-client-react";
import { Users, UserCheck, UserX, Building2, CheckSquare, Shield, Activity, Clock, AlertTriangle, Wifi, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

const STAT_CONFIG = [
  { key: "totalUsers", label: "Total Staff", icon: Users, color: "text-blue-400", href: "/admin/users" },
  { key: "activeUsers", label: "Active", icon: UserCheck, color: "text-green-400", href: "/admin/users" },
  { key: "pendingApprovals", label: "Pending Approval", icon: Clock, color: "text-yellow-400", href: "/admin/users" },
  { key: "suspendedUsers", label: "Suspended", icon: UserX, color: "text-red-400", href: "/admin/users" },
  { key: "totalDepartments", label: "Departments", icon: Building2, color: "text-purple-400", href: "/admin/departments" },
  { key: "openTasks", label: "Open Tasks", icon: CheckSquare, color: "text-cyan-400", href: "/admin/tasks" },
  { key: "pendingAlerts", label: "Open Alerts", icon: Shield, color: "text-orange-400", href: "/admin/alerts" },
  { key: "recentLogins", label: "Logins (24h)", icon: Activity, color: "text-primary", href: "/admin/sessions" },
  { key: "failedLoginsLast7Days", label: "Failed Logins (7d)", icon: AlertTriangle, color: "text-red-400", href: "/admin/audit-logs" },
];

const ROLE_LABELS: Record<string, string> = {
  chairman: "Chairman",
  ict_admin: "ICT Admin",
  hr_admin: "HR Admin",
  compliance_admin: "Compliance",
  auditor: "Auditor",
  department_head: "Dept Head",
  manager: "Manager",
  supervisor: "Supervisor",
  staff: "Staff",
};

export default function AdminOverviewPage() {
  const { data: summary, isLoading } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() },
  });

  // Poll online users every 30 seconds
  const { data: onlineData, isLoading: onlineLoading } = useGetOnlineUsers({
    query: {
      queryKey: getGetOnlineUsersQueryKey(),
      refetchInterval: 30_000,
    },
  });

  const onlineCount = onlineData?.count ?? 0;
  const onlineUsers = onlineData?.users ?? [];

  return (
    <AppLayout title="Admin Overview">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Control Center</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Organization-wide metrics and quick access</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Live online badge */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold border bg-green-500/10 text-green-400 border-green-500/20"
              data-testid="online-count-badge"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              {onlineLoading ? "—" : onlineCount} online now
            </div>
            <div className="text-xs font-mono text-muted-foreground bg-muted px-3 py-1.5 rounded-sm border border-border">
              Live
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" data-testid="admin-stats-grid">
          {STAT_CONFIG.map(({ key, label, icon: Icon, color, href }) => (
            <Link
              key={key}
              href={href}
              className="block bg-card border border-border rounded-sm p-5 hover:border-primary/50 transition-colors group"
              data-testid={`stat-${key}`}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
                <Icon className={cn("h-4 w-4", color)} />
              </div>
              <p className="text-3xl font-bold text-foreground tabular-nums">
                {isLoading ? "—" : (summary as any)?.[key] ?? 0}
              </p>
            </Link>
          ))}
        </div>

        {/* Live online users panel */}
        <div className="bg-card border border-border rounded-sm" data-testid="online-users-panel">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-green-400" />
              <h3 className="text-sm font-semibold text-foreground">Live Online Users</h3>
              <span className="text-xs text-muted-foreground">(active sessions in last 5 min)</span>
            </div>
            <span className="text-xs font-mono text-muted-foreground">auto-refreshes every 30s</span>
          </div>
          <div className="divide-y divide-border" data-testid="online-users-list">
            {onlineLoading ? (
              <div className="px-5 py-4 text-sm text-muted-foreground">Loading…</div>
            ) : onlineUsers.length === 0 ? (
              <div className="px-5 py-8 text-sm text-muted-foreground text-center">No active sessions in the last 5 minutes</div>
            ) : (
              onlineUsers.map((u) => (
                <div key={u.userId} className="px-5 py-3 flex items-center justify-between gap-4" data-testid={`online-user-${u.userId}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                      {u.fullName[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{u.fullName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{ROLE_LABELS[u.role] ?? u.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 text-xs text-muted-foreground">
                    {u.country && (
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {u.country}
                      </span>
                    )}
                    {u.ipAddress && (
                      <span className="font-mono hidden sm:block">{u.ipAddress}</span>
                    )}
                    <span>{formatDistanceToNow(new Date(u.sessionStartedAt), { addSuffix: true })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-sm p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "Add New Staff Member", href: "/admin/users/new", icon: Users },
                { label: "Create Announcement", href: "/admin/announcements", icon: Activity },
                { label: "Create Department", href: "/admin/departments", icon: Building2 },
                { label: "Review Security Alerts", href: "/admin/alerts", icon: Shield },
                { label: "View Audit Logs", href: "/admin/audit-logs", icon: Activity },
              ].map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-foreground hover:bg-muted transition-colors"
                  data-testid={`quick-action-${label.toLowerCase().replace(/ /g, "-")}`}
                >
                  <Icon className="h-4 w-4 text-primary" />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-sm p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">System Status</h3>
            <div className="space-y-3">
              {[
                { label: "Database", status: "Operational" },
                { label: "Authentication", status: "Operational" },
                { label: "Document Storage", status: "Operational" },
                { label: "Audit Logging", status: "Active" },
                { label: "Session Monitor", status: "Active" },
                { label: "MFA (TOTP)", status: "Configured" },
                { label: "Account Lockout", status: "Active" },
              ].map(({ label, status }) => (
                <div key={label} className="flex items-center justify-between" data-testid={`system-status-${label.toLowerCase().replace(/ /g, "-")}`}>
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-xs text-green-500 font-medium">{status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}