import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Briefcase, MapPin, Clock, Users, Edit2, Trash2, Eye, EyeOff, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";

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

const EMPTY_FORM = {
  title: "", department: "", division: "", location: "", country: "",
  type: "Full-time", level: "Mid-level", workMode: "On-site",
  description: "", responsibilities: "", requirements: "", benefits: ""
};

const STATUS_COLOURS: Record<string, string> = {
  draft: "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20",
  published: "bg-green-500/10 text-green-600 border border-green-500/20",
  closed: "bg-gray-500/10 text-gray-500 border border-gray-500/20",
};

export default function AdminJobsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const apiFetch = useApiFetch();
  const [showForm, setShowForm] = useState(false);
  const [editJob, setEditJob] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: () => apiFetch("/api/jobs"),
    refetchInterval: 30_000,
  });

  const openCreate = () => { setEditJob(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (job: any) => {
    setEditJob(job);
    setForm({
      title: job.title, department: job.department, division: job.division ?? "",
      location: job.location, country: job.country ?? "", type: job.type,
      level: job.level, workMode: job.workMode ?? "On-site",
      description: job.description, responsibilities: job.responsibilities ?? "",
      requirements: job.requirements ?? "", benefits: job.benefits ?? "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.department || !form.location || !form.description) {
      toast({ title: "Please fill in all required fields", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      if (editJob) {
        await apiFetch(`/api/jobs/${editJob.id}`, { method: "PATCH", body: JSON.stringify(form) });
        toast({ title: "Job updated" });
      } else {
        await apiFetch("/api/jobs", { method: "POST", body: JSON.stringify(form) });
        toast({ title: "Job created as draft" });
      }
      qc.invalidateQueries({ queryKey: ["admin-jobs"] });
      setShowForm(false);
    } catch (e: any) {
      toast({ title: e.message ?? "Failed to save", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (job: any, status: string) => {
    try {
      await apiFetch(`/api/jobs/${job.id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      toast({ title: status === "published" ? "Job published — now visible on website" : status === "closed" ? "Job closed" : "Job set to draft" });
      qc.invalidateQueries({ queryKey: ["admin-jobs"] });
    } catch (e: any) { toast({ title: e.message ?? "Failed", variant: "destructive" }); }
  };

  const handleDelete = async (job: any) => {
    if (!confirm(`Delete "${job.title}"? This will also delete all applications.`)) return;
    try {
      await apiFetch(`/api/jobs/${job.id}`, { method: "DELETE" });
      toast({ title: "Job deleted" });
      qc.invalidateQueries({ queryKey: ["admin-jobs"] });
    } catch (e: any) { toast({ title: e.message ?? "Failed", variant: "destructive" }); }
  };

  const f = (key: keyof typeof form) => (e: any) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const inputCls = "w-full border border-border rounded-sm px-3 py-2 text-sm bg-background text-foreground";
  const labelCls = "block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5";

  return (
    <AppLayout title="Job Postings">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Job Postings</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Manage open positions — published jobs appear live on the website</p>
          </div>
          <Button size="sm" className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Job
          </Button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="font-semibold text-foreground">{editJob ? "Edit Job" : "New Job Posting"}</h3>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelCls}>Job Title *</label>
                    <Input placeholder="e.g. Senior Crude Oil Trader" value={form.title} onChange={f("title")} />
                  </div>
                  <div>
                    <label className={labelCls}>Department *</label>
                    <Input placeholder="e.g. Oil & Gas" value={form.department} onChange={f("department")} />
                  </div>
                  <div>
                    <label className={labelCls}>Division</label>
                    <Input placeholder="e.g. Trading" value={form.division} onChange={f("division")} />
                  </div>
                  <div>
                    <label className={labelCls}>Location *</label>
                    <Input placeholder="e.g. London / Doha / Amsterdam" value={form.location} onChange={f("location")} />
                  </div>
                  <div>
                    <label className={labelCls}>Country</label>
                    <Input placeholder="e.g. UK / Qatar / Netherlands" value={form.country} onChange={f("country")} />
                  </div>
                  <div>
                    <label className={labelCls}>Type</label>
                    <select value={form.type} onChange={f("type")} className={inputCls}>
                      <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Level</label>
                    <select value={form.level} onChange={f("level")} className={inputCls}>
                      <option>Junior</option><option>Mid-level</option><option>Senior</option><option>Management</option><option>Executive</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Work Mode</label>
                    <select value={form.workMode} onChange={f("workMode")} className={inputCls}>
                      <option>On-site</option><option>Hybrid</option><option>Remote</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Job Description *</label>
                    <textarea value={form.description} onChange={f("description")} rows={4} className={`${inputCls} resize-none`} placeholder="Describe the role..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Responsibilities</label>
                    <textarea value={form.responsibilities} onChange={f("responsibilities")} rows={3} className={`${inputCls} resize-none`} placeholder="Key responsibilities..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Requirements</label>
                    <textarea value={form.requirements} onChange={f("requirements")} rows={3} className={`${inputCls} resize-none`} placeholder="Qualifications, experience, certifications..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Benefits</label>
                    <textarea value={form.benefits} onChange={f("benefits")} rows={2} className={`${inputCls} resize-none`} placeholder="Benefits offered..." />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editJob ? "Save Changes" : "Create Draft"}</Button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading jobs...</div>
        ) : (jobs as any[]).length === 0 ? (
          <div className="bg-card border border-border rounded-sm py-16 text-center">
            <Briefcase className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No job postings yet</p>
            <p className="text-xs text-muted-foreground mt-1">Click "New Job" to create your first posting</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(jobs as any[]).map((job) => (
              <div key={job.id} className="bg-card border border-border rounded-sm p-5 hover:shadow-sm transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLOURS[job.status] ?? ""}`}>{job.status}</span>
                      {job.jobId && <span className="text-xs font-mono text-muted-foreground">{job.jobId}</span>}
                      <span className="text-xs text-muted-foreground">{job.department}</span>
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{job.title}</h3>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.type}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{job.applicationCount ?? 0} application{job.applicationCount !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {job.status === "draft" && (
                      <Button size="sm" variant="outline" className="gap-1 text-green-600 border-green-500/30 hover:bg-green-500/5" onClick={() => handleStatusChange(job, "published")}>
                        <Eye className="h-3.5 w-3.5" /> Publish
                      </Button>
                    )}
                    {job.status === "published" && (
                      <Button size="sm" variant="outline" className="gap-1 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/5" onClick={() => handleStatusChange(job, "closed")}>
                        <EyeOff className="h-3.5 w-3.5" /> Close
                      </Button>
                    )}
                    {job.status === "closed" && (
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange(job, "draft")}>Reopen</Button>
                    )}
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => openEdit(job)}>
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 text-destructive border-destructive/30 hover:bg-destructive/5" onClick={() => handleDelete(job)}>
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}