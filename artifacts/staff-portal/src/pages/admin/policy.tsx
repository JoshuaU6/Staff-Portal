import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useGetCurrentUser } from "@workspace/api-client-react";
import { Shield, CheckCircle2, XCircle, Plus, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

function downloadComplianceCsv(rows: ComplianceRow[], filename: string) {
  const headers = ["Staff ID", "Full Name", "Email", "Role", "Acknowledged", "Acknowledged At"];
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.staffId,
        `"${r.fullName.replace(/"/g, '""')}"`,
        r.email,
        r.role,
        r.acknowledged ? "Yes" : "No",
        r.acknowledgedAt
          ? new Date(r.acknowledgedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
          : "",
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

interface ComplianceRow {
  userId: number;
  staffId: string;
  fullName: string;
  email: string;
  role: string;
  acknowledged: boolean;
  acknowledgedAt: string | null;
}

interface PolicyVersion {
  id: number;
  version: string;
  body: string;
  publishedAt: string;
}

interface PolicyComplianceData {
  policyVersion: PolicyVersion | null;
  compliance: ComplianceRow[];
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type FetchError = { type: "unauthorized" } | { type: "server" } | { type: "network" };

async function fetchPolicyCompliance(): Promise<{ data: PolicyComplianceData; error: null } | { data: null; error: FetchError }> {
  try {
    const res = await fetch(`${BASE}/api/policy/compliance`, { credentials: "include" });
    if (res.status === 401 || res.status === 403) return { data: null, error: { type: "unauthorized" } };
    if (!res.ok) return { data: null, error: { type: "server" } };
    return { data: await res.json(), error: null };
  } catch {
    return { data: null, error: { type: "network" } };
  }
}

async function publishPolicy(version: string, body: string): Promise<PolicyVersion> {
  const res = await fetch(`${BASE}/api/policy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ version, body }),
  });
  if (!res.ok) throw new Error("Failed to publish policy");
  return res.json();
}

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

const ADMIN_ROLES = ["chairman", "ict_admin", "hr_admin"];

export default function AdminPolicyPage() {
  const [data, setData] = useState<PolicyComplianceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<FetchError | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newVersion, setNewVersion] = useState("");
  const [newBody, setNewBody] = useState("");
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const { data: currentUser } = useGetCurrentUser();
  const canPublish = currentUser?.role ? ADMIN_ROLES.includes(currentUser.role) : false;

  const load = async () => {
    setLoading(true);
    setFetchError(null);
    const result = await fetchPolicyCompliance();
    if (result.error) {
      setFetchError(result.error);
    } else {
      setData(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handlePublish = async () => {
    if (!newVersion.trim() || !newBody.trim()) {
      toast({ title: "Version and policy text are required", variant: "destructive" });
      return;
    }
    setPublishing(true);
    try {
      await publishPolicy(newVersion.trim(), newBody.trim());
      toast({ title: `Policy v${newVersion} published. All staff must re-acknowledge.` });
      setShowForm(false);
      setNewVersion("");
      setNewBody("");
      await load();
    } catch {
      toast({ title: "Failed to publish policy", variant: "destructive" });
    } finally {
      setPublishing(false);
    }
  };

  const rows = (data?.compliance ?? []).filter(
    (r) =>
      search === "" ||
      r.fullName.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.staffId.toLowerCase().includes(search.toLowerCase()),
  );

  const acknowledged = rows.filter((r) => r.acknowledged).length;
  const pending = rows.filter((r) => !r.acknowledged).length;
  const rate = rows.length > 0 ? Math.round((acknowledged / rows.length) * 100) : 0;

  return (
    <AppLayout title="Policy Management">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Staff Policy Compliance</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {data?.policyVersion
                ? `Current: v${data.policyVersion.version} — published ${new Date(data.policyVersion.publishedAt).toLocaleDateString("en-GB")}`
                : "No policy published yet"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => downloadComplianceCsv(rows, `policy-compliance-${new Date().toISOString().split("T")[0]}.csv`)}
              disabled={rows.length === 0}
              data-testid="button-export-compliance-csv"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
            {canPublish && (
              <Button
                size="sm"
                className="gap-2"
                onClick={() => setShowForm(!showForm)}
                data-testid="button-publish-policy"
              >
                <Plus className="h-4 w-4" />
                Publish New Version
              </Button>
            )}
          </div>
        </div>

        {/* Publish form — admin-only */}
        {showForm && canPublish && (
          <div className="bg-card border border-border rounded-sm p-5 space-y-4" data-testid="publish-policy-form">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Publish New Policy Version</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Publishing a new version will reset all acknowledgments. Every active staff member will be shown the policy gate on next login.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="w-full sm:w-40">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">
                  Version
                </label>
                <Input
                  placeholder="e.g. 2.1"
                  value={newVersion}
                  onChange={(e) => setNewVersion(e.target.value)}
                  data-testid="input-policy-version"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">
                Policy Text
              </label>
              <textarea
                className="w-full h-48 bg-background border border-border rounded-sm p-3 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary font-light"
                placeholder="Enter the full policy text..."
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                data-testid="textarea-policy-body"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handlePublish} disabled={publishing} data-testid="button-confirm-publish">
                {publishing ? "Publishing..." : "Publish Policy"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Summary stats */}
        {data && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4" data-testid="policy-stats">
            <div className="bg-card border border-border rounded-sm p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Acknowledged</p>
              <p className="text-2xl font-bold text-green-500 tabular-nums">{acknowledged}</p>
            </div>
            <div className="bg-card border border-border rounded-sm p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-500 tabular-nums">{pending}</p>
            </div>
            <div className="bg-card border border-border rounded-sm p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Compliance Rate</p>
              <p className="text-2xl font-bold text-foreground tabular-nums">{rate}%</p>
            </div>
          </div>
        )}

        {/* Search */}
        <Input
          placeholder="Search by name, email, or staff ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
          data-testid="input-search-compliance"
        />

        {/* Compliance table */}
        <div className="bg-card border border-border rounded-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]" data-testid="compliance-table">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Staff Member</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Staff ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Acknowledged At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading...</td>
                </tr>
              ) : fetchError?.type === "unauthorized" ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">You do not have permission to view compliance data.</td>
                </tr>
              ) : fetchError ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    Failed to load compliance data.{" "}
                    <button className="underline" onClick={() => load()}>Retry</button>
                  </td>
                </tr>
              ) : !data || !data.policyVersion ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No policy published yet</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No staff found</td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.userId} className="hover:bg-muted/30 transition-colors" data-testid={`compliance-row-${r.userId}`}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{r.fullName}</p>
                        <p className="text-xs text-muted-foreground">{r.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.staffId}</td>
                    <td className="px-4 py-3 text-muted-foreground">{ROLE_LABELS[r.role] ?? r.role}</td>
                    <td className="px-4 py-3">
                      {r.acknowledged ? (
                        <span className={cn("flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-green-500")}>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Acknowledged
                        </span>
                      ) : (
                        <span className={cn("flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-yellow-500")}>
                          <XCircle className="h-3.5 w-3.5" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {r.acknowledgedAt
                        ? new Date(r.acknowledgedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                        : "—"}
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
