import AppLayout from "@/components/layout/AppLayout";
import {
  useListUsers,
  useApproveUser,
  useSuspendUser,
  useReactivateUser,
  useForceLogoutUser,
  useOffboardUser,
  getListUsersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Plus, Search, UserCheck, UserX, LogOut, UserMinus, RefreshCw, Download, Users, Monitor, Laptop, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface DeviceRecord {
  id: number;
  fingerprint: string;
  userAgent: string | null;
  label: string | null;
  ipAddress: string | null;
  trustedAt: string;
  lastSeenAt: string;
  revokedAt: string | null;
}

function getBrowserLabel(ua: string | null): string {
  if (!ua) return "Unknown Device";
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Edg")) return "Edge";
  return "Browser";
}

function getOsLabel(ua: string | null): string {
  if (!ua) return "";
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "";
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  pending: { color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", label: "Pending" },
  active: { color: "bg-green-500/10 text-green-500 border-green-500/20", label: "Active" },
  suspended: { color: "bg-red-500/10 text-red-500 border-red-500/20", label: "Suspended" },
  archived: { color: "bg-muted text-muted-foreground border-border", label: "Archived" },
};

const ROLE_LABELS: Record<string, string> = {
  chairman: "Chairman",
  ict_admin: "ICT Admin",
  hr_admin: "HR Admin",
  compliance_admin: "Compliance Admin",
  auditor: "Auditor",
  department_head: "Dept. Head",
  manager: "Manager",
  supervisor: "Supervisor",
  staff: "Staff",
};

function downloadCsv(rows: any[], filename: string) {
  const headers = ["Staff ID", "Full Name", "Email", "Role", "Department", "Status", "Created At"];
  const lines = [
    headers.join(","),
    ...rows.map((u) =>
      [
        u.staffId ?? "",
        `"${(u.fullName ?? "").replace(/"/g, '""')}"`,
        u.email ?? "",
        u.role ?? "",
        `"${(u.departmentName ?? "").replace(/"/g, '""')}"`,
        u.status ?? "",
        u.createdAt ? new Date(u.createdAt).toISOString().split("T")[0] : "",
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

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pendingAction, setPendingAction] = useState<{ type: string; userId: number; name: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [deviceModal, setDeviceModal] = useState<{ userId: number; name: string } | null>(null);
  const [userDevices, setUserDevices] = useState<DeviceRecord[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const qc = useQueryClient();
  const { toast } = useToast();

  const params = statusFilter !== "all" ? { status: statusFilter as any } : {};
  const { data: users, isLoading } = useListUsers(params, {
    query: { queryKey: getListUsersQueryKey(params) },
  });

  const approveUser = useApproveUser();
  const suspendUser = useSuspendUser();
  const reactivateUser = useReactivateUser();
  const forceLogout = useForceLogoutUser();
  const offboard = useOffboardUser();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getListUsersQueryKey({}) });
    qc.invalidateQueries({ queryKey: getListUsersQueryKey(params) });
  };

  const openDeviceModal = async (userId: number, name: string) => {
    setDeviceModal({ userId, name });
    setDevicesLoading(true);
    try {
      const res = await fetch(`${BASE}/api/devices/user/${userId}`, { credentials: "include" });
      setUserDevices(res.ok ? await res.json() : []);
    } catch { setUserDevices([]); }
    setDevicesLoading(false);
  };

  const revokeUserDevice = async (deviceId: number) => {
    await fetch(`${BASE}/api/devices/${deviceId}`, { method: "DELETE", credentials: "include" });
    setUserDevices((prev) => prev.filter((d) => d.id !== deviceId));
    toast({ title: "Device revoked" });
  };

  const filtered = (users ?? []).filter((u) =>
    search === "" ||
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.staffId?.toLowerCase().includes(search.toLowerCase())
  );

  const allFilteredIds = filtered.map((u) => u.id!).filter(Boolean);
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedIds.has(id));
  const someSelected = allFilteredIds.some((id) => selectedIds.has(id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allFilteredIds));
    }
  };

  const toggleOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkAction = async (action: "suspend" | "reactivate" | "force_logout") => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      const res = await fetch(`${BASE}/api/users/bulk-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userIds: Array.from(selectedIds), action }),
      });
      if (!res.ok) throw new Error("Bulk action failed");
      const result = await res.json();
      toast({ title: result.message ?? "Bulk action applied" });
      setSelectedIds(new Set());
      invalidate();
    } catch {
      toast({ title: "Bulk action failed", variant: "destructive" });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleAction = (type: string, userId: number, name: string) => {
    if (type === "force-logout") {
      forceLogout.mutate({ id: userId }, {
        onSuccess: () => { toast({ title: `${name} sessions terminated` }); invalidate(); },
        onError: () => toast({ title: "Action failed", variant: "destructive" }),
      });
      return;
    }
    setPendingAction({ type, userId, name });
  };

  const confirmAction = () => {
    if (!pendingAction) return;
    const { type, userId, name } = pendingAction;
    const opts = {
      onSuccess: () => { toast({ title: `${name} ${type}d successfully` }); invalidate(); setPendingAction(null); },
      onError: () => { toast({ title: "Action failed", variant: "destructive" }); setPendingAction(null); },
    };
    if (type === "approve") approveUser.mutate({ id: userId }, opts);
    else if (type === "suspend") suspendUser.mutate({ id: userId }, opts);
    else if (type === "reactivate") reactivateUser.mutate({ id: userId }, opts);
    else if (type === "offboard") offboard.mutate({ id: userId }, opts);
  };

  return (
    <AppLayout title="User Management">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Staff Directory</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => downloadCsv(filtered, "staff-directory.csv")}
              disabled={filtered.length === 0}
              data-testid="button-export-csv"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
            <Link href="/admin/users/new">
              <a data-testid="button-add-user">
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Staff Member
                </Button>
              </a>
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or staff ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search-users"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36" data-testid="select-user-status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 bg-primary/5 border border-primary/20 rounded-sm px-4 py-2.5" data-testid="bulk-action-bar">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{selectedIds.size} selected</span>
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
              onClick={() => handleBulkAction("suspend")}
              disabled={bulkLoading}
              data-testid="button-bulk-suspend"
            >
              <UserX className="h-3.5 w-3.5 mr-1.5" />
              Suspend
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
              onClick={() => handleBulkAction("reactivate")}
              disabled={bulkLoading}
              data-testid="button-bulk-reactivate"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Reactivate
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-orange-600 border-orange-300 hover:bg-orange-50"
              onClick={() => handleBulkAction("force_logout")}
              disabled={bulkLoading}
              data-testid="button-bulk-force-logout"
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Force Logout
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              disabled={bulkLoading}
              data-testid="button-bulk-clear"
            >
              Clear
            </Button>
          </div>
        )}

        <div className="bg-card border border-border rounded-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]" data-testid="users-table">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                    onChange={toggleAll}
                    className="h-3.5 w-3.5 rounded-sm accent-primary cursor-pointer"
                    data-testid="checkbox-select-all"
                    aria-label="Select all"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Staff</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Staff ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Department</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No staff members found</td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const status = STATUS_CONFIG[u.status ?? "pending"];
                  const isChecked = selectedIds.has(u.id!);
                  return (
                    <tr key={u.id} className={cn("hover:bg-muted/30 transition-colors", isChecked && "bg-primary/5")} data-testid={`user-row-${u.id}`}>
                      <td className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleOne(u.id!)}
                          className="h-3.5 w-3.5 rounded-sm accent-primary cursor-pointer"
                          data-testid={`checkbox-user-${u.id}`}
                          aria-label={`Select ${u.fullName}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground">{u.fullName}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{u.staffId}</td>
                      <td className="px-4 py-3 text-muted-foreground">{ROLE_LABELS[u.role ?? ""] ?? u.role}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.departmentName ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={cn("text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-sm border", status?.color)}>
                          {status?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 px-2" data-testid={`button-user-actions-${u.id}`}>
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {u.status === "pending" && (
                              <DropdownMenuItem onClick={() => handleAction("approve", u.id!, u.fullName!)} data-testid={`action-approve-${u.id}`}>
                                <UserCheck className="h-3.5 w-3.5 mr-2 text-green-500" />
                                Approve
                              </DropdownMenuItem>
                            )}
                            {u.status === "active" && (
                              <DropdownMenuItem onClick={() => handleAction("suspend", u.id!, u.fullName!)} data-testid={`action-suspend-${u.id}`}>
                                <UserX className="h-3.5 w-3.5 mr-2 text-yellow-500" />
                                Suspend
                              </DropdownMenuItem>
                            )}
                            {u.status === "suspended" && (
                              <DropdownMenuItem onClick={() => handleAction("reactivate", u.id!, u.fullName!)} data-testid={`action-reactivate-${u.id}`}>
                                <RefreshCw className="h-3.5 w-3.5 mr-2 text-blue-500" />
                                Reactivate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleAction("force-logout", u.id!, u.fullName!)} data-testid={`action-force-logout-${u.id}`}>
                              <LogOut className="h-3.5 w-3.5 mr-2 text-orange-500" />
                              Force Logout
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeviceModal(u.id!, u.fullName!)}
                              data-testid={`action-view-devices-${u.id}`}
                            >
                              <Laptop className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                              View Devices
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleAction("offboard", u.id!, u.fullName!)}
                              className="text-destructive focus:text-destructive"
                              data-testid={`action-offboard-${u.id}`}
                            >
                              <UserMinus className="h-3.5 w-3.5 mr-2" />
                              Offboard
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={!!pendingAction} onOpenChange={() => setPendingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to <strong>{pendingAction?.type}</strong> {pendingAction?.name}? This action will be logged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction} data-testid="button-confirm-action">Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!deviceModal} onOpenChange={() => setDeviceModal(null)}>
        <DialogContent className="max-w-lg" data-testid="dialog-user-devices">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Laptop className="h-4 w-4 text-primary" />
              Devices — {deviceModal?.name}
            </DialogTitle>
          </DialogHeader>
          {devicesLoading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">Loading devices...</div>
          ) : userDevices.length === 0 ? (
            <div className="py-8 text-center">
              <Monitor className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No trusted devices registered</p>
            </div>
          ) : (
            <div className="divide-y divide-border max-h-72 overflow-y-auto">
              {userDevices.map((device) => {
                const browser = getBrowserLabel(device.userAgent);
                const os = getOsLabel(device.userAgent);
                const isActive = device.revokedAt === null;
                return (
                  <div key={device.id} className="py-3 flex items-start justify-between gap-3" data-testid={`admin-device-row-${device.id}`}>
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 p-1.5 bg-muted rounded-sm">
                        <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {browser}{os ? ` on ${os}` : ""}
                          {!isActive && <span className="ml-2 text-[10px] font-medium uppercase text-muted-foreground">(revoked)</span>}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 mt-0.5">
                          {device.ipAddress && (
                            <span className="text-xs font-mono text-muted-foreground">{device.ipAddress}</span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            Last seen {formatDistanceToNow(new Date(device.lastSeenAt), { addSuffix: true })}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Trusted {format(new Date(device.trustedAt), "d MMM yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => revokeUserDevice(device.id)}
                        data-testid={`button-admin-revoke-device-${device.id}`}
                        title="Revoke device"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
