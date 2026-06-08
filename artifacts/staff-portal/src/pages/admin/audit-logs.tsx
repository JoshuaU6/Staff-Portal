import AppLayout from "@/components/layout/AppLayout";
import { useListAuditLogs, getListAuditLogsQueryKey } from "@workspace/api-client-react";
import { ActivitySquare, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { format } from "date-fns";

const EVENT_TYPES = [
  "user.created", "user.approved", "user.suspended", "user.reactivated",
  "user.force_logout", "user.offboarded", "user.updated",
  "department.created", "announcement.created", "announcement.deleted",
  "task.created", "task.updated", "document.uploaded", "document.deleted",
  "alert.resolved",
];

function downloadCsv(logs: any[], filename: string) {
  const headers = ["Timestamp", "Actor", "Event Type", "Target Type", "Target ID"];
  const lines = [
    headers.join(","),
    ...(logs ?? []).map((log) =>
      [
        log.createdAt ? format(new Date(log.createdAt as string), "yyyy-MM-dd HH:mm:ss") : "",
        `"${((log as any).actorName ?? "System").replace(/"/g, '""')}"`,
        log.eventType ?? "",
        log.targetType ?? "",
        log.targetId ?? "",
      ].join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminAuditLogsPage() {
  const [eventFilter, setEventFilter] = useState("all");
  const params = eventFilter !== "all" ? { event_type: eventFilter } : {};
  const { data: logs, isLoading } = useListAuditLogs(params, {
    query: { queryKey: getListAuditLogsQueryKey(params) },
  });

  return (
    <AppLayout title="Audit Logs">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Audit Trail</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Immutable record of all system events</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => downloadCsv(logs ?? [], `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`)}
              disabled={!logs || logs.length === 0}
              data-testid="button-export-audit-csv"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-52" data-testid="select-event-type-filter">
                <SelectValue placeholder="Filter by event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {EVENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-card border border-border rounded-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]" data-testid="audit-logs-table">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Timestamp</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Actor</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Event</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading audit logs...</td></tr>
              ) : logs?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <ActivitySquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No audit logs found</p>
                  </td>
                </tr>
              ) : (
                logs?.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors" data-testid={`audit-log-${log.id}`}>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {log.createdAt ? format(new Date(log.createdAt as string), "yyyy-MM-dd HH:mm:ss") : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{(log as any).actorName ?? <span className="text-muted-foreground">System</span>}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded-sm text-foreground">{log.eventType}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {log.targetType ? `${log.targetType} #${log.targetId}` : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
