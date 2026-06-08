import AppLayout from "@/components/layout/AppLayout";
import { useListSessions, useForceLogoutUser, getListSessionsQueryKey, getListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetCurrentUser } from "@workspace/api-client-react";
import { useState } from "react";
import { MonitorSmartphone, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";

const SESSION_STATUS: Record<string, string> = {
  active: "bg-green-500/10 text-green-500 border-green-500/20",
  ended: "bg-muted text-muted-foreground border-border",
  force_terminated: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function AdminSessionsPage() {
  const [statusFilter, setStatusFilter] = useState("active");
  const [confirmUserId, setConfirmUserId] = useState<number | null>(null);
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: currentUser } = useGetCurrentUser();
  const isAuditor = currentUser?.role === "auditor";

  const params = statusFilter !== "all" ? { status: statusFilter as any } : {};
  const { data: sessions, isLoading } = useListSessions(params, {
    query: { queryKey: getListSessionsQueryKey(params) },
  });
  const forceLogout = useForceLogoutUser();

  const handleForceLogout = () => {
    if (!confirmUserId) return;
    forceLogout.mutate({ id: confirmUserId }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListSessionsQueryKey({}) });
        qc.invalidateQueries({ queryKey: getListUsersQueryKey({}) });
        toast({ title: "Sessions terminated" });
        setConfirmUserId(null);
      },
      onError: () => toast({ title: "Failed", variant: "destructive" }),
    });
  };

  return (
    <AppLayout title="Active Sessions">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Session Monitor</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Track and control all staff sessions</p>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40" data-testid="select-session-status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="ended">Ended</SelectItem>
              <SelectItem value="force_terminated">Force Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card border border-border rounded-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]" data-testid="sessions-table">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Staff Member</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">IP Address</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Started</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading sessions...</td></tr>
              ) : sessions?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <MonitorSmartphone className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No sessions found</p>
                  </td>
                </tr>
              ) : (
                sessions?.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/20 transition-colors" data-testid={`session-${s.id}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{(s as any).userName ?? "Unknown"}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.ipAddress ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {s.startedAt ? formatDistanceToNow(new Date(s.startedAt), { addSuffix: true }) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-sm border", SESSION_STATUS[s.status ?? "active"])}>
                        {s.status?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {s.status === "active" && !isAuditor && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1.5 text-xs text-orange-500 hover:text-orange-400"
                          onClick={() => setConfirmUserId(s.userId!)}
                          data-testid={`button-force-logout-session-${s.id}`}
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          Force Logout
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={!!confirmUserId} onOpenChange={() => setConfirmUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Force Logout</AlertDialogTitle>
            <AlertDialogDescription>All active sessions for this user will be terminated immediately. They will need to sign in again.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleForceLogout} data-testid="button-confirm-force-logout">Terminate Sessions</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
