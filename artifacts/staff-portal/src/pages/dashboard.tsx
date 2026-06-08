import AppLayout from "@/components/layout/AppLayout";
import {
  useGetCurrentUser,
  useListAnnouncements,
  useListTasks,
  useGetRecentActivity,
  getListAnnouncementsQueryKey,
  getListTasksQueryKey,
  getGetRecentActivityQueryKey,
} from "@workspace/api-client-react";
import { Clock, CheckSquare, Megaphone, Activity, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useEffect } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
};

function registerDeviceSilently() {
  try {
    const fingerprint = btoa([
      navigator.userAgent,
      navigator.language,
      screen.width + "x" + screen.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    ].join("|")).slice(0, 32);
    fetch(`${BASE}/api/devices/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ fingerprint, userAgent: navigator.userAgent }),
    }).catch(() => {});
  } catch {}
}

export default function DashboardPage() {
  useEffect(() => { registerDeviceSilently(); }, []);
  const { data: me } = useGetCurrentUser();
  const { data: announcements, isLoading: annLoading } = useListAnnouncements(
    {},
    { query: { queryKey: getListAnnouncementsQueryKey({}) } }
  );
  const { data: tasks, isLoading: tasksLoading } = useListTasks(
    {},
    { query: { queryKey: getListTasksQueryKey({}) } }
  );
  const { data: activity, isLoading: actLoading } = useGetRecentActivity(
    { limit: 10 },
    { query: { queryKey: getGetRecentActivityQueryKey({ limit: 10 }) } }
  );

  const myTasks = tasks?.filter((t) => t.status !== "completed") ?? [];
  const pendingCount = tasks?.filter((t) => t.status === "pending").length ?? 0;
  const inProgressCount = tasks?.filter((t) => t.status === "in_progress").length ?? 0;

  return (
    <AppLayout title="Dashboard">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground truncate" data-testid="text-welcome">
              Welcome, {me?.fullName ?? "Staff Member"}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5 capitalize">
              {me?.role?.replace(/_/g, " ") ?? ""} {me?.departmentName ? `— ${me.departmentName}` : ""}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground">Staff ID</p>
            <p className="text-sm font-mono font-medium text-primary whitespace-nowrap" data-testid="text-staff-id">
              {me?.staffId ?? "—"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Pending Tasks", value: pendingCount, icon: CheckSquare, color: "text-yellow-500" },
            { label: "In Progress", value: inProgressCount, icon: Activity, color: "text-blue-500" },
            { label: "Announcements", value: announcements?.length ?? 0, icon: Megaphone, color: "text-primary" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-border rounded-sm p-5" data-testid={`stat-${label.toLowerCase().replace(/ /g, "-")}`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
                <Icon className={cn("h-4 w-4", color)} />
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-sm">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Recent Announcements</h3>
            </div>
            <div className="divide-y divide-border" data-testid="announcements-list">
              {annLoading ? (
                <div className="px-5 py-4 text-sm text-muted-foreground">Loading...</div>
              ) : announcements?.length === 0 ? (
                <div className="px-5 py-8 text-sm text-muted-foreground text-center">No announcements</div>
              ) : (
                announcements?.slice(0, 5).map((ann) => (
                  <div key={ann.id} className="px-5 py-3" data-testid={`announcement-${ann.id}`}>
                    <p className="text-sm font-medium text-foreground">{ann.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">{ann.createdByName}</span>
                      <span className="text-xs text-muted-foreground">
                        {ann.publishedAt ? formatDistanceToNow(new Date(ann.publishedAt), { addSuffix: true }) : ""}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-sm">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">My Tasks</h3>
            </div>
            <div className="divide-y divide-border" data-testid="tasks-list">
              {tasksLoading ? (
                <div className="px-5 py-4 text-sm text-muted-foreground">Loading...</div>
              ) : myTasks.length === 0 ? (
                <div className="px-5 py-8 text-sm text-muted-foreground text-center">No pending tasks</div>
              ) : (
                myTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="px-5 py-3 flex items-center justify-between" data-testid={`task-${task.id}`}>
                    <div>
                      <p className="text-sm font-medium text-foreground">{task.title}</p>
                      {task.dueDate && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Due {new Date(task.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className={cn(
                      "text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-sm border",
                      STATUS_COLORS[task.status ?? "pending"]
                    )}>
                      {task.status?.replace(/_/g, " ")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-sm">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
          </div>
          <div className="divide-y divide-border" data-testid="activity-list">
            {actLoading ? (
              <div className="px-5 py-4 text-sm text-muted-foreground">Loading...</div>
            ) : (activity?.length ?? 0) === 0 ? (
              <div className="px-5 py-8 text-sm text-muted-foreground text-center">No recent activity</div>
            ) : (
              activity?.map((log) => (
                <div key={log.id} className="px-5 py-3 flex items-center justify-between" data-testid={`activity-${log.id}`}>
                  <div className="flex items-center gap-3">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-foreground">{log.actorName ?? "System"}</span>
                      <span className="text-sm text-muted-foreground"> — {log.eventType}</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {log.createdAt ? formatDistanceToNow(new Date(log.createdAt as string), { addSuffix: true }) : ""}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
