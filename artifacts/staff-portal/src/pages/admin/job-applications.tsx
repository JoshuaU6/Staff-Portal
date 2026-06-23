import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import AppLayout from "@/components/layout/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Users, Mail, Phone, Linkedin, FileText, X, ExternalLink, Search } from "lucide-react";
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

const STATUS_COLOURS: Record<string, string> = {
  new:                   "bg-blue-500/10 text-blue-600 border border-blue-500/20",
  reviewing:             "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20",
  shortlisted:           "bg-green-500/10 text-green-600 border border-green-500/20",
  assessment:            "bg-purple-500/10 text-purple-600 border border-purple-500/20",
  interview_scheduled:   "bg-cyan-500/10 text-cyan-600 border border-cyan-500/20",
  interview_completed:   "bg-sky-500/10 text-sky-600 border border-sky-500/20",
  reference_check:       "bg-orange-500/10 text-orange-600 border border-orange-500/20",
  document_verification: "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20",
  offer_issued:          "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
  offer_accepted:        "bg-green-500/10 text-green-700 border border-green-500/20",
  hired:                 "bg-red-500/10 text-red-700 border border-red-500/20",
  rejected:              "bg-red-500/10 text-red-500 border border-red-500/20",
  talent_pool:           "bg-gray-500/10 text-gray-500 border border-gray-500/20",
};

const ALL_STATUSES = [
  "new", "reviewing", "shortlisted", "assessment",
  "interview_scheduled", "interview_completed", "reference_check",
  "document_verification", "offer_issued", "offer_accepted",
  "hired", "rejected", "talent_pool"
];

// Statuses that need extra info before sending the email
const NEEDS_MODAL = new Set(["assessment", "interview_scheduled", "offer_issued", "rejected"]);

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

// ── Status Extra-Info Modal (portal — uses Tailwind like everything else) ─────
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
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const f = (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setExtra((p) => ({ ...p, [key]: e.target.value }));

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between px-6 py-4 border-b border-border">
          <div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded mb-2 inline-block ${STATUS_COLOURS[status] ?? "bg-muted text-muted-foreground"}`}>
              {label}
            </span>
            <h3 className="font-semibold text-foreground text-sm">Update status for {applicantName}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">An automatic email will be sent to the candidate</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-6 space-y-4">
          {status === "assessment" && (
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Assessment Details / Instructions
              </label>
              <textarea
                value={extra.assessmentDetails ?? ""}
                onChange={f("assessmentDetails")}
                rows={5}
                className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Describe the assessment format, deadline, submission link, or any specific instructions..."
              />
              <p className="text-xs text-muted-foreground mt-1">This text will be included in the candidate's email.</p>
            </div>
          )}

          {status === "interview_scheduled" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Interview Date</label>
                  <input type="date" value={extra.interviewDate ?? ""} onChange={f("interviewDate")}
                    className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Interview Time</label>
                  <input type="time" value={extra.interviewTime ?? ""} onChange={f("interviewTime")}
                    className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Meeting Link / Location</label>
                <input type="text" value={extra.interviewLink ?? ""} onChange={f("interviewLink")}
                  className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="https://meet.google.com/xxx or office address" />
              </div>
            </>
          )}

          {status === "offer_issued" && (
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Offer Letter URL (optional)</label>
              <input type="url" value={extra.offerLetterUrl ?? ""} onChange={f("offerLetterUrl")}
                className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="https://... (link to signed offer letter PDF)" />
              <p className="text-xs text-muted-foreground mt-1">Upload to Google Drive and paste the shareable link. Candidate will get a download button in their email.</p>
            </div>
          )}

          {status === "rejected" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Rejection Reason</label>
                <select value={extra.rejectionReason ?? ""} onChange={f("rejectionReason")}
                  className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Select a reason...</option>
                  {REJECTION_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Additional Note to Candidate (optional)</label>
                <textarea value={extra.rejectionNote ?? ""} onChange={f("rejectionNote")} rows={3}
                  className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Personalised feedback or encouragement for the candidate..." />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button size="sm" onClick={() => onConfirm(extra)} disabled={loading}>
            {loading ? "Updating..." : "Confirm & Send Email"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminJobApplicationsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const apiFetch = useApiFetch();
  const [selected, setSelected] = useState<any>(null);
  const [note, setNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["admin-job-applications"],
    queryFn: () => apiFetch("/api/job-applications"),
    refetchInterval: 60_000,
  });

  const handleStatusClick = (status: string) => {
    if (NEEDS_MODAL.has(status)) {
      setPendingStatus(status);
    } else {
      confirmStatusUpdate(status, {});
    }
  };

  const confirmStatusUpdate = async (status: string, extra: Record<string, string>) => {
    if (!selected) return;
    setUpdatingStatus(true);
    setPendingStatus(null);
    try {
      await apiFetch(`/api/job-applications/${selected.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, ...extra }),
      });
      toast({ title: `Status updated — email sent to candidate` });
      qc.invalidateQueries({ queryKey: ["admin-job-applications"] });
      setSelected((p: any) => p ? { ...p, status } : p);
    } catch (e: any) {
      toast({ title: e.message ?? "Failed", variant: "destructive" });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const submitNote = async () => {
    if (!note.trim() || !selected) return;
    setAddingNote(true);
    try {
      await apiFetch(`/api/job-applications/${selected.id}/notes`, { method: "POST", body: JSON.stringify({ note }) });
      toast({ title: "Note added" });
      setNote("");
      qc.invalidateQueries({ queryKey: ["admin-job-applications"] });
    } catch (e: any) {
      toast({ title: e.message ?? "Failed", variant: "destructive" });
    } finally { setAddingNote(false); }
  };

  const newCount = (applications as any[]).filter((a) => a.status === "new").length;

  const filtered = (applications as any[]).filter((a) => {
    const matchSearch = !search ||
      a.fullName.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      (a.applicationId ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <AppLayout title="Job Applications">
      {/* Status extra-info modal — portal to escape AppLayout overflow */}
      {pendingStatus && selected && (
        <StatusModal
          status={pendingStatus}
          applicantName={selected.fullName}
          onConfirm={(extra) => confirmStatusUpdate(pendingStatus, extra)}
          onClose={() => setPendingStatus(null)}
          loading={updatingStatus}
        />
      )}

      {/* Application detail panel — original Tailwind classes preserved exactly */}
      {selected && !pendingStatus && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-foreground">{selected.fullName}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{selected.applicationId} · {selected.jobTitle}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Contact */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <a href={`mailto:${selected.email}`} className="text-primary hover:underline truncate">{selected.email}</a>
                </div>
                {selected.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5 shrink-0" />{selected.phone}</div>}
                {selected.linkedin && (
                  <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                    <Linkedin className="h-3.5 w-3.5 shrink-0" />
                    <a href={selected.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">LinkedIn <ExternalLink className="h-3 w-3" /></a>
                  </div>
                )}
                {selected.cvUrl && (
                  <div className="flex items-center gap-2 col-span-2">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <a href={selected.cvUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">{selected.cvFileName ?? "View CV"} <ExternalLink className="h-3 w-3" /></a>
                  </div>
                )}
              </div>

              {/* Key details */}
              <div className="bg-muted/30 rounded p-3 text-xs space-y-1 border border-border">
                {selected.nationality && <div><span className="text-muted-foreground">Nationality:</span> {selected.nationality}</div>}
                {selected.countryOfResidence && <div><span className="text-muted-foreground">Country:</span> {selected.countryOfResidence}</div>}
                {selected.yearsOfExperience && <div><span className="text-muted-foreground">Experience:</span> {selected.yearsOfExperience}</div>}
                {selected.highestEducation && <div><span className="text-muted-foreground">Education:</span> {selected.highestEducation}</div>}
                {selected.availableStartDate && <div><span className="text-muted-foreground">Available:</span> {selected.availableStartDate}</div>}
                {selected.willingToRelocate !== null && <div><span className="text-muted-foreground">Relocate:</span> {selected.willingToRelocate ? "Yes" : "No"}</div>}
                {selected.addToTalentPool && <div className="text-green-600 font-medium">✓ Talent Pool</div>}
              </div>

              {/* Cover letter */}
              {selected.coverLetter && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Cover Letter</p>
                  <div className="bg-muted/30 rounded-sm p-3 text-sm text-foreground whitespace-pre-wrap leading-relaxed border border-border">{selected.coverLetter}</div>
                </div>
              )}

              {/* Status update */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Update Status <span className="normal-case font-normal">— email sent automatically to candidate · ✏️ = extra details required</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {ALL_STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusClick(s)}
                      disabled={updatingStatus || s === selected.status}
                      className={`text-xs px-3 py-1.5 rounded border font-medium transition-colors disabled:opacity-50 ${
                        selected.status === s
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      {s.replace(/_/g, " ")}{NEEDS_MODAL.has(s) ? " ✏️" : ""}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Add Note (internal only)</p>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                  placeholder="Internal HR notes — not visible to the candidate..."
                  className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-background text-foreground resize-none" />
                <Button size="sm" className="mt-2" onClick={submitNote} disabled={addingNote || !note.trim()}>
                  {addingNote ? "Adding..." : "Add Note"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              Job Applications
              {newCount > 0 && <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">{newCount} new</span>}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">Review and manage all incoming applications</p>
          </div>
        </div>

        {/* Search + filter */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, position or reference..."
              className="w-full pl-9 pr-4 py-2 border border-border rounded-sm text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-border rounded-sm px-3 py-2 text-sm bg-background text-foreground focus:outline-none">
            <option value="all">All Statuses</option>
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading applications...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-sm py-16 text-center">
            <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">
              {(applications as any[]).length === 0 ? "No applications yet" : "No results match your search"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {(applications as any[]).length === 0 ? "Applications submitted through the website will appear here" : "Try adjusting your filters"}
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs text-muted-foreground uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Applicant</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Position</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Applied</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((app) => (
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
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLOURS[app.status] ?? "bg-gray-500/10 text-gray-500 border border-gray-500/20"}`}>
                        {app.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => setSelected(app)}>Review</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}