import AppLayout from "@/components/layout/AppLayout";
import {
  useGetCurrentUser,
  useGetDepartment,
  useGetDepartmentMembers,
  useListAnnouncements,
  useListTasks,
  getGetDepartmentQueryKey,
  getGetDepartmentMembersQueryKey,
  getListAnnouncementsQueryKey,
  getListTasksQueryKey,
} from "@workspace/api-client-react";
import {
  Building2,
  Users,
  Megaphone,
  CheckSquare,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const ROLE_LABELS: Record<string, string> = {
  chairman: "Chairman",
  ict_admin: "ICT Admin",
  hr_admin: "HR Admin",
  department_head: "Department Head",
  manager: "Manager",
  supervisor: "Supervisor",
  staff: "Staff Member",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/10 text-green-500 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  suspended: "bg-red-500/10 text-red-500 border-red-500/20",
  archived: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const TASK_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
};

function NoDepartmentState() {
  return (
    <div
      className="flex flex-col items-center justify-center py-24 text-center"
      data-testid="no-department-state"
    >
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
        <Building2 className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">No department assigned</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        You have not been assigned to a department yet. Contact ICT Admin to have your department
        configured.
      </p>
    </div>
  );
}

export default function DepartmentPage() {
  const { data: me, isLoading: meLoading } = useGetCurrentUser();

  const deptId = me?.departmentId ?? null;
  const enabled = deptId != null;

  const { data: dept, isLoading: deptLoading } = useGetDepartment(
    deptId!,
    { query: { queryKey: getGetDepartmentQueryKey(deptId!), enabled } }
  );

  const { data: members, isLoading: membersLoading } = useGetDepartmentMembers(
    deptId!,
    { query: { queryKey: getGetDepartmentMembersQueryKey(deptId!), enabled } }
  );

  const { data: announcements, isLoading: annLoading } = useListAnnouncements(
    { department_id: deptId ?? undefined },
    {
      query: {
        queryKey: getListAnnouncementsQueryKey({ department_id: deptId ?? undefined }),
        enabled,
      },
    }
  );

  const { data: tasks, isLoading: tasksLoading } = useListTasks(
    { department_id: deptId ?? undefined },
    {
      query: {
        queryKey: getListTasksQueryKey({ department_id: deptId ?? undefined }),
        enabled,
      },
    }
  );

  const isLoading = meLoading;

  return (
    <AppLayout title="My Department">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground" data-testid="dept-heading">
            My Department
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Team overview, announcements, and tasks for your department
          </p>
        </div>

        {isLoading ? (
          <div className="py-20 text-sm text-muted-foreground text-center">Loading...</div>
        ) : !deptId ? (
          <NoDepartmentState />
        ) : (
          <>
            {/* Department header card */}
            <div
              className="bg-card border border-border rounded-sm px-6 py-5 flex items-start gap-5"
              data-testid="card-department-info"
            >
              <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="text-base font-semibold text-foreground"
                  data-testid="dept-name"
                >
                  {deptLoading ? "Loading..." : (dept?.name ?? "—")}
                </h3>
                {dept?.parentDepartmentName && (
                  <p className="text-xs text-muted-foreground mt-0.5" data-testid="dept-parent">
                    Part of {dept.parentDepartmentName}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {membersLoading ? "—" : `${members?.length ?? 0} member${(members?.length ?? 0) !== 1 ? "s" : ""}`}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckSquare className="h-3 w-3" />
                    {tasksLoading ? "—" : `${tasks?.filter((t) => t.status !== "completed").length ?? 0} open task${(tasks?.filter((t) => t.status !== "completed").length ?? 0) !== 1 ? "s" : ""}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-card border border-border rounded-sm" data-testid="card-team-members">
              <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Team Members</h3>
                {!membersLoading && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {members?.length ?? 0} member{(members?.length ?? 0) !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {membersLoading ? (
                <div className="px-5 py-6 text-sm text-muted-foreground">Loading...</div>
              ) : !members || members.length === 0 ? (
                <div className="px-5 py-10 text-sm text-muted-foreground text-center">
                  No team members found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" data-testid="table-members">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Name
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Staff ID
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Role
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {members.map((m) => (
                        <tr
                          key={m.id}
                          className={cn(
                            "transition-colors hover:bg-accent/30",
                            m.id === me?.id ? "bg-primary/5" : ""
                          )}
                          data-testid={`member-row-${m.id}`}
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-bold text-primary">
                                  {m.fullName?.[0] ?? "?"}
                                </span>
                              </div>
                              <span className="font-medium text-foreground">
                                {m.fullName}
                                {m.id === me?.id && (
                                  <span className="ml-2 text-[10px] text-primary font-semibold uppercase tracking-wide">
                                    You
                                  </span>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                            {m.staffId}
                          </td>
                          <td className="px-5 py-3 text-muted-foreground capitalize">
                            {ROLE_LABELS[m.role] ?? m.role}
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={cn(
                                "text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-sm border",
                                STATUS_COLORS[m.status] ?? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                              )}
                            >
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Two-column: announcements + tasks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department Announcements */}
              <div className="bg-card border border-border rounded-sm" data-testid="card-dept-announcements">
                <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Department Announcements</h3>
                </div>
                <div className="divide-y divide-border">
                  {annLoading ? (
                    <div className="px-5 py-4 text-sm text-muted-foreground">Loading...</div>
                  ) : !announcements || announcements.length === 0 ? (
                    <div className="px-5 py-8 text-sm text-muted-foreground text-center flex flex-col items-center gap-2">
                      <AlertCircle className="h-4 w-4 opacity-40" />
                      No announcements for this department
                    </div>
                  ) : (
                    announcements.slice(0, 6).map((ann) => (
                      <div key={ann.id} className="px-5 py-3" data-testid={`dept-ann-${ann.id}`}>
                        <p className="text-sm font-medium text-foreground leading-snug">{ann.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground">{ann.createdByName}</span>
                          <span className="text-xs text-muted-foreground">
                            {ann.publishedAt
                              ? formatDistanceToNow(new Date(ann.publishedAt), { addSuffix: true })
                              : ""}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Department Tasks */}
              <div className="bg-card border border-border rounded-sm" data-testid="card-dept-tasks">
                <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Department Tasks</h3>
                </div>
                <div className="divide-y divide-border">
                  {tasksLoading ? (
                    <div className="px-5 py-4 text-sm text-muted-foreground">Loading...</div>
                  ) : !tasks || tasks.length === 0 ? (
                    <div className="px-5 py-8 text-sm text-muted-foreground text-center flex flex-col items-center gap-2">
                      <AlertCircle className="h-4 w-4 opacity-40" />
                      No tasks for this department
                    </div>
                  ) : (
                    tasks.slice(0, 6).map((task) => (
                      <div
                        key={task.id}
                        className="px-5 py-3 flex items-center justify-between gap-3"
                        data-testid={`dept-task-${task.id}`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {task.assigneeName && (
                              <span className="text-xs text-muted-foreground truncate">
                                {task.assigneeName}
                              </span>
                            )}
                            {task.dueDate && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(task.dueDate).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className={cn(
                            "text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-sm border shrink-0",
                            TASK_STATUS_COLORS[task.status] ?? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                          )}
                        >
                          {task.status?.replace(/_/g, " ")}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
