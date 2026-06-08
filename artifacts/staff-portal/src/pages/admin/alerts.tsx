import AppLayout from "@/components/layout/AppLayout";
import { useListSecurityAlerts, useResolveSecurityAlert, getListSecurityAlertsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetCurrentUser } from "@workspace/api-client-react";
import { useState } from "react";
import { Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const SEVERITY_CONFIG: Record<string, string> = {
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function AdminAlertsPage() {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("open");
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: currentUser } = useGetCurrentUser();
  const isAuditor = currentUser?.role === "auditor";

  const params: any = {};
  if (severityFilter !== "all") params.severity = severityFilter;
  if (statusFilter !== "all") params.status = statusFilter;

  const { data: alerts, isLoading } = useListSecurityAlerts(params, {
    query: { queryKey: getListSecurityAlertsQueryKey(params) },
  });
  const resolveAlert = useResolveSecurityAlert();

  const handleResolve = (id: number) => {
    resolveAlert.mutate({ id }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListSecurityAlertsQueryKey({}) });
        qc.invalidateQueries({ queryKey: getListSecurityAlertsQueryKey({ status: "open" }) });
        toast({ title: "Alert resolved" });
      },
      onError: () => toast({ title: "Failed to resolve alert", variant: "destructive" }),
    });
  };

  return (
    <AppLayout title="Security Alerts">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Security Alert Center</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Monitor and respond to security events</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-36" data-testid="select-severity-filter">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36" data-testid="select-alert-status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2" data-testid="alerts-list">
          {isLoading ? (
            <div className="bg-card border border-border rounded-sm px-5 py-8 text-sm text-muted-foreground text-center">Loading alerts...</div>
          ) : alerts?.length === 0 ? (
            <div className="bg-card border border-border rounded-sm px-5 py-12 text-center">
              <Shield className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No alerts found</p>
            </div>
          ) : (
            alerts?.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "bg-card border rounded-sm p-4 flex flex-wrap items-center gap-3",
                  alert.severity === "critical" ? "border-red-500/30" :
                  alert.severity === "high" ? "border-orange-500/20" : "border-border"
                )}
                data-testid={`alert-${alert.id}`}
              >
                <div className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm border shrink-0 min-w-[60px] text-center",
                  SEVERITY_CONFIG[alert.severity ?? "low"]
                )}>
                  {alert.severity}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground">{alert.eventRef}</p>
                    {alert.source === "auto" && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-violet-500/10 text-violet-400 border border-violet-500/20 shrink-0" data-testid={`alert-source-${alert.id}`}>
                        Auto-detected
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-3 mt-0.5">
                    {(alert as any).userName && (
                      <p className="text-xs text-muted-foreground">User: {(alert as any).userName}</p>
                    )}
                    {alert.ipAddress && (
                      <p className="text-xs text-muted-foreground font-mono">IP: {alert.ipAddress}</p>
                    )}
                    {alert.country && (
                      <p className="text-xs text-muted-foreground">Country: {alert.country}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-auto shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {alert.createdAt ? formatDistanceToNow(new Date(alert.createdAt as string), { addSuffix: true }) : ""}
                  </span>
                  {alert.status === "open" && !isAuditor ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1.5 text-xs text-green-500 border-green-500/30 hover:bg-green-500/10"
                      onClick={() => handleResolve(alert.id!)}
                      disabled={resolveAlert.isPending}
                      data-testid={`button-resolve-alert-${alert.id}`}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Resolve
                    </Button>
                  ) : alert.status === "open" ? (
                    <span className="text-[10px] font-medium uppercase tracking-wide bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-sm">
                      Open
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium uppercase tracking-wide bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-sm">
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
