import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useGetCurrentUser, useGetMysessions, getGetMysessionsQueryKey } from "@workspace/api-client-react";
import { useUser } from "@clerk/react";
import { Shield, User, Clock, Monitor, CheckCircle2, AlertCircle, MapPin, Globe, Laptop, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const ROLE_LABELS: Record<string, string> = {
  chairman: "Chairman",
  ict_admin: "ICT Admin",
  hr_admin: "HR Admin",
  compliance_admin: "Compliance Admin",
  auditor: "Auditor",
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

const SESSION_STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/10 text-green-500 border-green-500/20",
  ended: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  revoked: "bg-red-500/10 text-red-500 border-red-500/20",
};

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

async function fetchDevices(): Promise<DeviceRecord[]> {
  const res = await fetch(`${BASE}/api/devices/me`, { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

async function revokeDevice(id: number): Promise<void> {
  await fetch(`${BASE}/api/devices/${id}`, { method: "DELETE", credentials: "include" });
}

async function registerDevice(): Promise<void> {
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join("|");
  const hash = btoa(fingerprint).slice(0, 32);
  await fetch(`${BASE}/api/devices/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ fingerprint: hash, userAgent: navigator.userAgent }),
  });
}

export default function ProfilePage() {
  const { user: clerkUser } = useUser();
  const { data: me, isLoading: meLoading } = useGetCurrentUser();
  const { data: sessions, isLoading: sessLoading } = useGetMysessions(
    { limit: 10 },
    { query: { queryKey: getGetMysessionsQueryKey({ limit: 10 }) } }
  );
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    registerDevice().then(() => {
      fetchDevices().then((d) => { setDevices(d); setDevicesLoading(false); });
    }).catch(() => {
      fetchDevices().then((d) => { setDevices(d); setDevicesLoading(false); });
    });
  }, []);

  const handleRevoke = async (id: number) => {
    await revokeDevice(id);
    setDevices((prev) => prev.filter((d) => d.id !== id));
    toast({ title: "Device revoked" });
  };

  const mfaEnabled = clerkUser?.twoFactorEnabled ?? false;
  const lastSession = sessions?.[0];

  return (
    <AppLayout title="My Profile">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground" data-testid="profile-heading">
              My Profile
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Account information and security overview
            </p>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-card border border-border rounded-sm" data-testid="card-account-info">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Account Information</h3>
          </div>
          {meLoading ? (
            <div className="px-5 py-6 text-sm text-muted-foreground">Loading...</div>
          ) : (
            <div className="divide-y divide-border">
              {[
                { label: "Full Name", value: me?.fullName, testId: "field-full-name" },
                { label: "Staff ID", value: me?.staffId, mono: true, testId: "field-staff-id" },
                { label: "Email Address", value: me?.email, testId: "field-email" },
                {
                  label: "Role",
                  value: ROLE_LABELS[me?.role ?? ""] ?? me?.role,
                  testId: "field-role",
                },
                {
                  label: "Department",
                  value: me?.departmentName ?? "Not assigned",
                  muted: !me?.departmentName,
                  testId: "field-department",
                },
                {
                  label: "Account Status",
                  custom: (
                    <span
                      className={cn(
                        "text-[11px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-sm border",
                        STATUS_COLORS[me?.status ?? "pending"]
                      )}
                      data-testid="field-status"
                    >
                      {me?.status ?? "—"}
                    </span>
                  ),
                },
                {
                  label: "Member Since",
                  value: me?.createdAt
                    ? new Date(me.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "—",
                  testId: "field-created-at",
                },
              ].map(({ label, value, mono, muted, custom, testId }) => (
                <div
                  key={label}
                  className="px-5 py-3.5 flex items-center justify-between"
                >
                  <span className="text-sm text-muted-foreground w-40 shrink-0">{label}</span>
                  {custom ?? (
                    <span
                      className={cn(
                        "text-sm flex-1 text-right",
                        mono ? "font-mono text-primary" : "",
                        muted ? "text-muted-foreground italic" : "text-foreground font-medium"
                      )}
                      data-testid={testId}
                    >
                      {value ?? "—"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Overview */}
        <div className="bg-card border border-border rounded-sm" data-testid="card-security">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Security</h3>
          </div>
          <div className="divide-y divide-border">
            <div className="px-5 py-3.5 flex items-center justify-between" data-testid="field-mfa-status">
              <span className="text-sm text-muted-foreground">Multi-Factor Authentication</span>
              <div className="flex items-center gap-2">
                {mfaEnabled ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-500">Enabled</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-500">Not Enrolled</span>
                  </>
                )}
              </div>
            </div>
            <div className="px-5 py-3.5 flex items-center justify-between" data-testid="field-last-login">
              <span className="text-sm text-muted-foreground">Last Login</span>
              <div className="flex items-center gap-3 text-right">
                <div className="text-sm">
                  {lastSession ? (
                    <>
                      <span className="font-medium text-foreground">
                        {formatDistanceToNow(new Date(lastSession.startedAt), { addSuffix: true })}
                      </span>
                      {lastSession.ipAddress && (
                        <span className="text-muted-foreground ml-2 font-mono text-xs">
                          {lastSession.ipAddress}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground">No session recorded</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trusted Devices */}
        <div className="bg-card border border-border rounded-sm" data-testid="card-trusted-devices">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Laptop className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Trusted Devices</h3>
            <span className="ml-auto text-xs text-muted-foreground">{devices.length} device{devices.length !== 1 ? "s" : ""}</span>
          </div>
          {devicesLoading ? (
            <div className="px-5 py-6 text-sm text-muted-foreground">Loading...</div>
          ) : devices.length === 0 ? (
            <div className="px-5 py-10 text-sm text-muted-foreground text-center">
              No trusted devices registered
            </div>
          ) : (
            <div className="divide-y divide-border">
              {devices.map((device) => {
                const browser = getBrowserLabel(device.userAgent);
                const os = getOsLabel(device.userAgent);
                const isCurrent = device.revokedAt === null;
                return (
                  <div key={device.id} className="px-5 py-4 flex items-start justify-between" data-testid={`device-row-${device.id}`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-2 bg-muted rounded-sm">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {browser}{os ? ` on ${os}` : ""}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                          {device.ipAddress && (
                            <span className="text-xs text-muted-foreground font-mono">{device.ipAddress}</span>
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
                    <div className="flex items-center gap-2 shrink-0">
                      {isCurrent && (
                        <span className="text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-sm border bg-green-500/10 text-green-500 border-green-500/20">
                          Active
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRevoke(device.id)}
                        data-testid={`button-revoke-device-${device.id}`}
                        title="Revoke device"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Session History */}
        <div className="bg-card border border-border rounded-sm" data-testid="card-session-history">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Monitor className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">My Sessions</h3>
            <span className="ml-auto text-xs text-muted-foreground">Last 10 sessions</span>
          </div>
          {sessLoading ? (
            <div className="px-5 py-6 text-sm text-muted-foreground">Loading...</div>
          ) : !sessions || sessions.length === 0 ? (
            <div className="px-5 py-10 text-sm text-muted-foreground text-center">
              No session history recorded
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-sessions">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Started
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> IP Address</span>
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Country</span>
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Ended</span>
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-accent/30 transition-colors" data-testid={`session-row-${s.id}`}>
                      <td className="px-5 py-3 text-foreground font-medium">
                        {new Date(s.startedAt).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                        {s.ipAddress ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {s.country ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground text-xs">
                        {s.endedAt
                          ? formatDistanceToNow(new Date(s.endedAt), { addSuffix: true })
                          : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            "text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-sm border",
                            SESSION_STATUS_COLORS[s.status] ?? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                          )}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
