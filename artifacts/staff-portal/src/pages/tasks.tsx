import AppLayout from "@/components/layout/AppLayout";
import {
  useListTasks,
  useUpdateTask,
  getListTasksQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckSquare, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
};

export default function TasksPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const qc = useQueryClient();
  const { toast } = useToast();

  const params = statusFilter !== "all" ? { status: statusFilter as any } : {};
  const { data: tasks, isLoading } = useListTasks(params, {
    query: { queryKey: getListTasksQueryKey(params) },
  });
  const updateTask = useUpdateTask();

  const handleStatusChange = (taskId: number, status: string) => {
    updateTask.mutate(
      { id: taskId, data: { status: status as any } },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getListTasksQueryKey({}) });
          toast({ title: "Task updated" });
        },
        onError: () => toast({ title: "Failed to update task", variant: "destructive" }),
      }
    );
  };

  return (
    <AppLayout title="My Tasks">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Assigned Tasks</h2>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40" data-testid="select-status-filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card border border-border rounded-sm divide-y divide-border" data-testid="tasks-list">
          {isLoading ? (
            <div className="px-5 py-8 text-sm text-muted-foreground text-center">Loading tasks...</div>
          ) : tasks?.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <CheckSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No tasks found</p>
            </div>
          ) : (
            tasks?.map((task) => (
              <div key={task.id} className="px-4 py-4 flex items-start gap-3" data-testid={`task-${task.id}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{task.title}</p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{task.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                    {task.assigneeName && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{task.assigneeName}</span>
                      </div>
                    )}
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Due {new Date(task.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {task.createdAt ? formatDistanceToNow(new Date(task.createdAt as string), { addSuffix: true }) : ""}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={cn(
                    "text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-sm border",
                    STATUS_COLORS[task.status ?? "pending"]
                  )}>
                    {task.status?.replace(/_/g, " ")}
                  </span>
                  <Select
                    defaultValue={task.status ?? "pending"}
                    onValueChange={(val) => handleStatusChange(task.id!, val)}
                  >
                    <SelectTrigger className="h-7 w-[120px] text-xs" data-testid={`select-task-status-${task.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
