import AppLayout from "@/components/layout/AppLayout";
import {
  useListTasks,
  useCreateTask,
  useListUsers,
  useListDepartments,
  getListTasksQueryKey,
  getListUsersQueryKey,
  getListDepartmentsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, CheckSquare, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
};

export default function AdminTasksPage() {
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState({ title: "", description: "", assigneeId: "", departmentId: "", dueDate: "" });
  const qc = useQueryClient();
  const { toast } = useToast();

  const params = statusFilter !== "all" ? { status: statusFilter as any } : {};
  const { data: tasks, isLoading } = useListTasks(params, { query: { queryKey: getListTasksQueryKey(params) } });
  const { data: users } = useListUsers({}, { query: { queryKey: getListUsersQueryKey({}) } });
  const { data: depts } = useListDepartments({ query: { queryKey: getListDepartmentsQueryKey() } });
  const createTask = useCreateTask();

  const handleCreate = () => {
    if (!form.title.trim()) return;
    createTask.mutate(
      {
        data: {
          title: form.title.trim(),
          description: form.description || undefined,
          assigneeId: form.assigneeId ? Number(form.assigneeId) : undefined,
          departmentId: form.departmentId ? Number(form.departmentId) : undefined,
          dueDate: form.dueDate || undefined,
        },
      },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getListTasksQueryKey({}) });
          toast({ title: "Task created and assigned" });
          setOpen(false);
          setForm({ title: "", description: "", assigneeId: "", departmentId: "", dueDate: "" });
        },
        onError: () => toast({ title: "Failed to create task", variant: "destructive" }),
      }
    );
  };

  const activeUsers = users?.filter((u) => u.status === "active") ?? [];

  return (
    <AppLayout title="Task Management">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">All Tasks</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36" data-testid="select-task-status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="gap-2" onClick={() => setOpen(true)} data-testid="button-create-task">
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
          </div>
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
              <div key={task.id} className="px-5 py-4 flex items-start justify-between gap-4" data-testid={`task-${task.id}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{task.title}</p>
                  {task.description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{task.description}</p>}
                  <div className="flex items-center gap-4 mt-2">
                    {task.assigneeName && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{task.assigneeName}</span>
                      </div>
                    )}
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Due {new Date(task.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {task.createdAt ? formatDistanceToNow(new Date(task.createdAt as string), { addSuffix: true }) : ""}
                    </span>
                  </div>
                </div>
                <span className={cn("text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-sm border shrink-0", STATUS_COLORS[task.status ?? "pending"])}>
                  {task.status?.replace(/_/g, " ")}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Task title" data-testid="input-task-title" />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Task details..." rows={3} data-testid="input-task-description" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select value={form.assigneeId} onValueChange={(v) => setForm((f) => ({ ...f, assigneeId: v }))}>
                  <SelectTrigger data-testid="select-task-assignee"><SelectValue placeholder="Select staff" /></SelectTrigger>
                  <SelectContent>
                    {activeUsers.map((u) => <SelectItem key={u.id} value={String(u.id)}>{u.fullName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={form.departmentId} onValueChange={(v) => setForm((f) => ({ ...f, departmentId: v }))}>
                  <SelectTrigger data-testid="select-task-department"><SelectValue placeholder="Select dept." /></SelectTrigger>
                  <SelectContent>
                    {depts?.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Due Date (optional)</Label>
              <Input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} data-testid="input-task-due-date" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createTask.isPending || !form.title.trim()} data-testid="button-confirm-create-task">
              {createTask.isPending ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
