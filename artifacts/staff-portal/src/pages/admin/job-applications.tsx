import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Users, Mail, Phone, Linkedin, FileText, X, ExternalLink } from "lucide-react";
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
  new: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
  reviewing: "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20",
  shortlisted: "bg-green-500/10 text-green-600 border border-green-500/20",
  rejected: "bg-red-500/10 text-red-500 border border-red-500/20",
  hired: "bg-purple-500/10 text-purple-600 border border-purple-500/20",
  offer_issued: "bg-orange-500/10 text-orange-600 border border-orange-500/20",
};

const ALL_STATUSES = ["new","reviewing","shortlisted","assessment","interview_scheduled","interview_completed","reference_check","document_verification","offer_issued","offer_accepted","hired","rejected","talent_pool"];

export default function AdminJobApplicationsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const apiFetch = useApiFetch();
  const [selected, setSelected] = useState<any>(null);
  const [note, setNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["admin-job-applications"],
    queryFn: () => apiFetch("/api/job-applications"),
    refetchInterval: 60_000,
  });

  const updateStatus = async (id: number, status: string) => {
    try {
      await apiFetch(`/api/job-applications/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      toast({ title: `Status updated to ${status}` });
      qc.invalidateQueries({ queryKey: ["admin-job-applications"] });
      setSelected((p: any) => p ? { ...p, status } : p);
    } catch (e: any) { toast({ title: e.message ?? "Failed", variant: "destructive" }); }
  };

  const submitNote = async () => {
    if (!note.trim() || !selected) return;
    setAddingNote(true);
    try {
      await apiFetch(`/api/job-applications/${selected.id}/notes`, { method: "POST", body: JSON.stringify({ note }) });
      toast({ title: "Note added" });
      setNote("");
      qc.invalidateQueries({ queryKey: ["admin-job-applications"] });
    } catch (e: any) { toast({ title: e.message ?? "Failed", variant: "destructive" }); }
    finally { setAddingNote(false); }
  };

  const newCount = (applications as any[]).filter((a) => a.status === "new").length;

  return (
    <AppLayout title="Job Applications">
      <div className="max-w-5xl mx-auto space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            Job Applications
            {newCount > 0 && <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">{newCount} new</span>}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">Review and manage all incoming applications</p>
        </div>

        {selected && (
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

                {selected.coverLetter && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Cover Letter</p>
                    <div className="bg-muted/30 rounded-sm p-3 text-sm text-foreground whitespace-pre-wrap leading-relaxed border border-border">{selected.coverLetter}</div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_STATUSES.map((s) => (
                      <button key={s} onClick={() => updateStatus(selected.id, s)}
                        className={`text-xs px-3 py-1.5 rounded border font-medium transition-colors ${selected.status === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}>
                        {s.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Add Note</p>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                    placeholder="Internal HR notes..." className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-background text-foreground resize-none" />
                  <Button size="sm" className="mt-2" onClick={submitNote} disabled={addingNote || !note.trim()}>
                    {addingNote ? "Adding..." : "Add Note"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading applications...</div>
        ) : (applications as any[]).length === 0 ? (
          <div className="bg-card border border-border rounded-sm py-16 text-center">
            <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No applications yet</p>
            <p className="text-xs text-muted-foreground mt-1">Applications submitted through the website will appear here</p>
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
                {(applications as any[]).map((app) => (
                  <tr key={app.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{app.fullName}</p>
                      <p className="text-xs text-muted-foreground">{app.email}</p>
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