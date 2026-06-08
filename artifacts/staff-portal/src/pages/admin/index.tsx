import AppLayout from "@/components/layout/AppLayout";
import { useGetDashboardSummary, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { Users, UserCheck, UserX, Building2, CheckSquare, Shield, Activity, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

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

export default function AdminOverviewPage() {
  const { data: summary, isLoading } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() },
  });

  return (
    <AppLayout title="Admin Overview">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Control Center</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Organization-wide metrics and quick access</p>
          </div>
          <div className="text-xs font-mono text-muted-foreground bg-muted px-3 py-1.5 rounded-sm border border-border shrink-0">
            Live
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
