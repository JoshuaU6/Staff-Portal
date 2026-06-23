import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import AppLayout from "@/components/layout/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Users, Mail, Phone, Linkedin, FileText, X, ExternalLink, ChevronDown, Search } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { format } from "date-fns";

const API = (import.meta.env.VITE_API_BASE_URL as string | undefined)
  ?? "https://staff-portal-production-2d9f.up.railway.app";

function useApiFetch() {
  const { getToken } = useAuth();
  return async function apiFetch(path: string, opts?: RequestInit) {
    const token = await getToken().catch(() => null);
    const res = await fetch(`${API}${path}`, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts?.headers ?? {}),
      },
      credentials: "include",
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? res.statusText);
    if (res.status === 204) return null;
    return res.json();
  };
}

// Status config — label, colour, whether it needs extra input
const STATUS_CONFIG: Record<string, { label: string; colour: string; bg: string }> = {
  new:                   { label: "New",                   colour: "#3b82f6", bg: "#eff6ff" },
  reviewing:             { label: "Reviewing",             colour: "#f59e0b", bg: "#fffbeb" },
  shortlisted:           { label: "Shortlisted",           colour: "#22c55e", bg: "#f0fdf4" },
  assessment:            { label: "Assessment",            colour: "#8b5cf6", bg: "#f5f3ff" },
  interview_scheduled:   { label: "Interview Scheduled",   colour: "#06b6d4", bg: "#ecfeff" },
  interview_completed:   { label: "Interview Completed",   colour: "#0ea5e9", bg: "#f0f9ff" },
  reference_check:       { label: "Reference Check",       colour: "#f97316", bg: "#fff7ed" },
  document_verification: { label: "Document Verification", colour: "#6366f1", bg: "#eef2ff" },
  offer_issued:          { label: "Offer Issued",          colour: "#10b981", bg: "#ecfdf5" },
  offer_accepted:        { label: "Offer Accepted",        colour: "#059669", bg: "#d1fae5" },
  hired:                 { label: "Hired",                 colour: "#C0001A", bg: "#fff1f2" },
  rejected:              { label: "Rejected",              colour: "#ef4444", bg: "#fef2f2" },
  talent_pool:           { label: "Talent Pool",           colour: "#64748b", bg: "#f8fafc" },
};

const REJECTION_REASONS = [
  "Position filled internally",
  "Qualifications did not meet requirements",
  "Insufficient relevant experience",
  "Another candidate was selected",
  "Role requirements changed",
  "Application withdrawn by candidate",
  "Failed background/reference check",
  "Salary expectations not aligned",
  "Other (see note below)",
];

// Statuses that need extra HR input before sending email
const NEEDS_MODAL = new Set(["assessment", "interview_scheduled", "offer_issued", "rejected"]);

// ── Status Action Modal ───────────────────────────────────────────────────────
function StatusModal({
  status,
  applicantName,
  onConfirm,
  onClose,
  loading,
}: {
  status: string;
  applicantName: string;
  onConfirm: (extra: Record<string, string>) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [extra, setExtra] = useState<Record<string, string>>({});
  const cfg = STATUS_CONFIG[status];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setExtra((p) => ({ ...p, [key]: e.target.value }));

  const inputCls = "w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 bg-white";
  const labelCls = "block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5";

  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 99999, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 25px 50px rgba(0,0,0,0.4)", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "inline-block", background: cfg.bg, color: cfg.colour, fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
              {cfg.label}
            </div>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#1a1a2e" }}>Update status for {applicantName}</p>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#888" }}>An automatic email will be sent to the candidate</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", padding: "4px" }}><X size={18} /></button>
        </div>

        {/* Body — extra fields per status */}
        <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {status === "assessment" && (
            <div>
              <label className={labelCls}>Assessment Details / Instructions</label>
              <textarea value={extra.assessmentDetails ?? ""} onChange={f("assessmentDetails")} rows={5}
                className={inputCls + " resize-none"}
                placeholder="Describe the assessment format, deadline, submission link, or any specific instructions for the candidate..." />
              <p style={{ fontSize: "11px", color: "#aaa", marginTop: "6px" }}>This text will be included in the email to the candidate.</p>
            </div>
          )}

          {status === "interview_scheduled" && (<>
            <div className="grid grid-cols-2 gap-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label className={labelCls}>Interview Date</label>
                <input type="date" value={extra.interviewDate ?? ""} onChange={f("interviewDate")} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Interview Time</label>
                <input type="time" value={extra.interviewTime ?? ""} onChange={f("interviewTime")} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Meeting Link / Location</label>
              <input type="text" value={extra.interviewLink ?? ""} onChange={f("interviewLink")} className={inputCls} placeholder="https://meet.google.com/xxx or Office address" />
            </div>
          </>)}

          {status === "offer_issued" && (
            <div>
              <label className={labelCls}>Offer Letter URL (optional)</label>
              <input type="url" value={extra.offerLetterUrl ?? ""} onChange={f("offerLetterUrl")} className={inputCls} placeholder="https://... (link to signed offer letter PDF)" />
              <p style={{ fontSize: "11px", color: "#aaa", marginTop: "6px" }}>Upload the offer letter to Google Drive or similar and paste the link here. The candidate will receive a download button in their email.</p>
            </div>
          )}

          {status === "rejected" && (<>
            <div>
              <label className={labelCls}>Rejection Reason</label>
              <select value={extra.rejectionReason ?? ""} onChange={f("rejectionReason")} className={inputCls}>
                <option value="">Select a reason...</option>
                {REJECTION_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Additional Note to Candidate (optional)</label>
              <textarea value={extra.rejectionNote ?? ""} onChange={f("rejectionNote")} rows={3}
                className={inputCls + " resize-none"}
                placeholder="Any personalised feedback or encouragement for the candidate..." />
            </div>
          </>)}
        </div>

        {/* Footer */}
        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button onClick={onClose} disabled={loading} style={{ padding: "8px 16px", fontSize: "13px", border: "1px solid #e5e7eb", borderRadius: "6px", background: "#fff", cursor: "pointer", color: "#555" }}>
            Cancel
          </button>
          <button onClick={() => onConfirm(extra)} disabled={loading}
            style={{ padding: "8px 20px", fontSize: "13px", fontWeight: 600, border: "none", borderRadius: "6px", background: cfg.colour, color: "#fff", cursor: "pointer", opacity: loading ? 0.6 : 1 }}>
            {loading ? "Updating..." : `Confirm & Send Email`}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Application Detail Panel ──────────────────────────────────────────────────
function AppDetailModal({ app, onClose, onStatusUpdate }: {
  app: any;
  onClose: () => void;
  onStatusUpdate: (status: string, extra?: Record<string, string>) => void;
}) {
  const apiFetch = useApiFetch();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [note, setNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleStatusClick = (status: string) => {
    if (NEEDS_MODAL.has(status)) {
      setPendingStatus(status);
    } else {
      confirmStatusUpdate(status, {});
    }
  };

  const confirmStatusUpdate = async (status: string, extra: Record<string, string>) => {
    setUpdatingStatus(true);
    setPendingStatus(null);
    try {
      await onStatusUpdate(status, extra);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const submitNote = async () => {
    if (!note.trim()) return;
    setAddingNote(true);
    try {
      await apiFetch(`/api/job-applications/${app.id}/notes`, { method: "POST", body: JSON.stringify({ note }) });
      toast({ title: "Note added" });
      setNote("");
      qc.invalidateQueries({ queryKey: ["admin-job-applications"] });
    } catch (e: any) {
      toast({ title: e.message ?? "Failed", variant: "destructive" });
    } finally { setAddingNote(false); }
  };

  const cfg = STATUS_CONFIG[app.status] ?? { label: app.status, colour: "#888", bg: "#f8f8f8" };

  return createPortal(
    <>
      {pendingStatus && (
        <StatusModal
          status={pendingStatus}
          applicantName={app.fullName}
          onConfirm={(extra) => confirmStatusUpdate(pendingStatus, extra)}
          onClose={() => setPendingStatus(null)}
          loading={updatingStatus}
        />
      )}
      <div
        style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "2rem 1rem", overflowY: "auto" }}
        onClick={(e) => { if (e.target === e.currentTarget && !pendingStatus) onClose(); }}
      >
        <div style={{ background: "var(--card, #fff)", border: "1px solid var(--border, #e5e7eb)", borderRadius: "12px", boxShadow: "0 25px 50px rgba(0,0,0,0.4)", width: "100%", maxWidth: "680px", margin: "auto" }}>
          {/* Header */}
          <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border, #e5e7eb)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "16px", color: "var(--foreground, #1a1a2e)" }}>{app.fullName}</h3>
              <p style={{ margin: "0 0 6px", fontSize: "12px", color: "var(--muted-foreground, #888)" }}>{app.applicationId} · {app.jobTitle}</p>
              <span style={{ display: "inline-block", background: cfg.bg, color: cfg.colour, fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "1px" }}>
                {cfg.label}
              </span>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground,#888)", padding: "4px" }}><X size={20} /></button>
          </div>

          <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Contact */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <a href={`mailto:${app.email}`} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#C0001A", textDecoration: "none" }}>
                <Mail size={14} />{app.email}
              </a>
              {app.phone && <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--muted-foreground,#888)" }}><Phone size={14} />{app.phone}</span>}
              {app.linkedin && <a href={app.linkedin} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#C0001A", textDecoration: "none" }}><Linkedin size={14} />LinkedIn <ExternalLink size={11} /></a>}
              {app.cvUrl && <a href={app.cvUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#C0001A", textDecoration: "none" }}><FileText size={14} />{app.cvFileName ?? "View CV"} <ExternalLink size={11} /></a>}
            </div>

            {/* Key details */}
            <div style={{ background: "var(--muted,#f8f8f8)", borderRadius: "6px", padding: "12px 16px", border: "1px solid var(--border,#e5e7eb)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: "12px" }}>
              {[
                ["Nationality", app.nationality],
                ["Country", app.countryOfResidence],
                ["City", app.cityOfResidence],
                ["Experience", app.yearsOfExperience],
                ["Education", app.highestEducation],
                ["Field", app.fieldOfStudy],
                ["Current Role", app.currentJobTitle],
                ["Employer", app.currentEmployer],
                ["Start Date", app.availableStartDate],
                ["Relocate", app.willingToRelocate === true ? "Yes" : app.willingToRelocate === false ? "No" : null],
                ["Visa Required", app.requiresVisaSponsorship === true ? "Yes" : app.requiresVisaSponsorship === false ? "No" : null],
                ["Talent Pool", app.addToTalentPool ? "Yes" : null],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label as string}><span style={{ color: "var(--muted-foreground,#888)" }}>{label}: </span><span style={{ color: "var(--foreground,#1a1a2e)", fontWeight: 500 }}>{value as string}</span></div>
              ))}
            </div>

            {/* Cover letter */}
            {app.coverLetter && (
              <div>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted-foreground,#888)", textTransform: "uppercase", letterSpacing: "1.5px", margin: "0 0 8px" }}>Cover Letter</p>
                <div style={{ background: "var(--muted,#f8f8f8)", border: "1px solid var(--border,#e5e7eb)", borderRadius: "6px", padding: "12px 16px", fontSize: "13px", lineHeight: 1.8, color: "var(--foreground,#333)", whiteSpace: "pre-wrap", maxHeight: "180px", overflowY: "auto" }}>
                  {app.coverLetter}
                </div>
              </div>
            )}

            {/* Status update */}
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted-foreground,#888)", textTransform: "uppercase", letterSpacing: "1.5px", margin: "0 0 10px" }}>
                Update Status — email sent automatically to candidate
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
                  <button
                    key={s}
                    onClick={() => handleStatusClick(s)}
                    disabled={updatingStatus || s === app.status}
                    style={{
                      padding: "6px 14px", fontSize: "12px", fontWeight: 600,
                      border: `2px solid ${s === app.status ? cfg.colour : "#e5e7eb"}`,
                      borderRadius: "20px", cursor: s === app.status ? "default" : "pointer",
                      background: s === app.status ? cfg.bg : "#fff",
                      color: s === app.status ? cfg.colour : "#555",
                      opacity: updatingStatus ? 0.5 : 1,
                      transition: "all 0.15s",
                    }}
                  >
                    {NEEDS_MODAL.has(s) ? `${cfg.label} ✏️` : cfg.label}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: "11px", color: "#aaa", margin: "8px 0 0" }}>✏️ = requires extra details before sending</p>
            </div>

            {/* Notes */}
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted-foreground,#888)", textTransform: "uppercase", letterSpacing: "1.5px", margin: "0 0 8px" }}>HR Notes (internal only)</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Add an internal note — not visible to the candidate..."
                style={{ width: "100%", border: "1px solid var(--border,#e5e7eb)", borderRadius: "6px", padding: "10px 12px", fontSize: "13px", resize: "none", background: "var(--background,#fff)", color: "var(--foreground,#333)", boxSizing: "border-box" }}
              />
              <button
                onClick={submitNote}
                disabled={addingNote || !note.trim()}
                style={{ marginTop: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: 600, border: "none", borderRadius: "6px", background: "#1a1a2e", color: "#fff", cursor: "pointer", opacity: (addingNote || !note.trim()) ? 0.5 : 1 }}
              >
                {addingNote ? "Adding..." : "Add Note"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminJobApplicationsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const apiFetch = useApiFetch();
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["admin-job-applications"],
    queryFn: () => apiFetch("/api/job-applications"),
    refetchInterval: 60_000,
  });

  const handleStatusUpdate = async (status: string, extra: Record<string, string> = {}) => {
    if (!selected) return;
    try {
      const updated = await apiFetch(`/api/job-applications/${selected.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, ...extra }),
      });
      toast({ title: `Status updated to "${STATUS_CONFIG[status]?.label ?? status}" — email sent to candidate` });
      qc.invalidateQueries({ queryKey: ["admin-job-applications"] });
      setSelected((p: any) => p ? { ...p, status } : p);
    } catch (e: any) {
      toast({ title: e.message ?? "Failed to update status", variant: "destructive" });
    }
  };

  const newCount = (applications as any[]).filter((a) => a.status === "new").length;

  const filtered = (applications as any[]).filter((a) => {
    const matchSearch = !search || a.fullName.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      (a.applicationId ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <AppLayout title="Job Applications">
      {selected && (
        <AppDetailModal
          app={selected}
          onClose={() => setSelected(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              Job Applications
              {newCount > 0 && (
                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{newCount} new</span>
              )}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">Click Review to update status — emails sent automatically to candidates</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, position, ref..."
              className="w-full pl-9 pr-4 py-2 border border-border rounded text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-border rounded px-3 py-2 text-sm bg-background text-foreground focus:outline-none">
            <option value="all">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([s, c]) => (
              <option key={s} value={s}>{c.label}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading applications...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-sm py-16 text-center">
            <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">{(applications as any[]).length === 0 ? "No applications yet" : "No results match your search"}</p>
            <p className="text-xs text-muted-foreground mt-1">{(applications as any[]).length === 0 ? "Applications submitted through the website will appear here" : "Try adjusting your filters"}</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs text-muted-foreground uppercase tracking-wide border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3">Applicant</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Position</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Applied</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((app) => {
                  const cfg = STATUS_CONFIG[app.status] ?? { label: app.status, colour: "#888", bg: "#f8f8f8" };
                  return (
                    <tr key={app.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{app.fullName}</p>
                        <p className="text-xs text-muted-foreground">{app.email}</p>
                        {app.applicationId && <p className="text-xs text-muted-foreground font-mono">{app.applicationId}</p>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">{app.jobTitle}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                        {format(new Date(app.appliedAt), "d MMM yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        <span style={{ display: "inline-block", background: cfg.bg, color: cfg.colour, fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="outline" onClick={() => setSelected(app)}>Review</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}