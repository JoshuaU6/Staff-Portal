import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import AppLayout from "@/components/layout/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Briefcase, MapPin, Clock, Users, Edit2, Trash2, Eye, EyeOff, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  description: "", responsibilities: "", requirements: "", benefits: "",
};

const STATUS_COLOURS: Record<string, string> = {
  draft: "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20",
  published: "bg-green-500/10 text-green-600 border border-green-500/20",
  closed: "bg-gray-500/10 text-gray-500 border border-gray-500/20",
};

// ── Modal rendered via portal so it escapes AppLayout overflow container ──────
function JobFormModal({
  editJob,
  form,
  setForm,
  onClose,
  onSave,
  saving,
}: {
  editJob: any;
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const f = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));

  const inputCls = "w-full border border-border rounded-sm px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";
  const labelCls = "block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5";

  // Lock body scroll while modal open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 z-[9999] flex items-start justify-center p-4 pt-8 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card rounded-t-xl z-10">
          <div>
            <h3 className="font-semibold text-foreground text-base">
              {editJob ? "Edit Job Posting" : "New Job Posting"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {editJob ? "Update the job details below" : "Fill in the details — save as draft first, then publish when ready"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className={labelCls}>Job Title <span className="text-destructive">*</span></label>
            <Input
              placeholder="e.g. Senior Crude Oil Trader"
              value={form.title}
              onChange={f("title")}
              autoFocus
            />
          </div>

          {/* Department + Division */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Department <span className="text-destructive">*</span></label>
              <Input placeholder="e.g. Oil & Gas" value={form.department} onChange={f("department")} />
            </div>
            <div>
              <label className={labelCls}>Division</label>
              <Input placeholder="e.g. Trading" value={form.division} onChange={f("division")} />
            </div>
          </div>

          {/* Location + Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Location <span className="text-destructive">*</span></label>
              <Input placeholder="e.g. London / Doha / Amsterdam" value={form.location} onChange={f("location")} />
            </div>
            <div>
              <label className={labelCls}>Country</label>
              <Input placeholder="e.g. UK / Qatar / Netherlands" value={form.country} onChange={f("country")} />
            </div>
          </div>

          {/* Type + Level + Work Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Employment Type</label>
              <select value={form.type} onChange={f("type")} className={inputCls}>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Level</label>
              <select value={form.level} onChange={f("level")} className={inputCls}>
                <option>Junior</option>
                <option>Mid-level</option>
                <option>Senior</option>
                <option>Management</option>
                <option>Executive</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Work Mode</label>
              <select value={form.workMode} onChange={f("workMode")} className={inputCls}>
                <option>On-site</option>
                <option>Hybrid</option>
                <option>Remote</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Job Description <span className="text-destructive">*</span></label>
            <textarea
              value={form.description}
              onChange={f("description")}
              rows={4}
              className={`${inputCls} resize-none`}
              placeholder="Describe the role, what it involves and what success looks like..."
            />
          </div>

          {/* Responsibilities */}
          <div>
            <label className={labelCls}>Responsibilities</label>
            <textarea
              value={form.responsibilities}
              onChange={f("responsibilities")}
              rows={4}
              className={`${inputCls} resize-none`}
              placeholder="Key duties and responsibilities..."
            />
          </div>

          {/* Requirements */}
          <div>
            <label className={labelCls}>Requirements & Qualifications</label>
            <textarea
              value={form.requirements}
              onChange={f("requirements")}
              rows={4}
              className={`${inputCls} resize-none`}
              placeholder="Minimum qualifications, experience, certifications, skills required..."
            />
          </div>

          {/* Benefits */}
          <div>
            <label className={labelCls}>Benefits & Package</label>
            <textarea
              value={form.benefits}
              onChange={f("benefits")}
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Salary range, benefits, allowances, visa sponsorship..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border sticky bottom-0 bg-card rounded-b-xl">
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button size="sm" onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : editJob ? "Save Changes" : "Create Draft"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminJobsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const apiFetch = useApiFetch();
  const [showForm, setShowForm] = useState(false);
  const [editJob, setEditJob] = useState<any>(null);
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: () => apiFetch("/api/jobs"),
    refetchInterval: 30_000,
  });

  const openCreate = () => {
    setEditJob(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (job: any) => {
    setEditJob(job);
    setForm({
      title: job.title ?? "",
      department: job.department ?? "",
      division: job.division ?? "",
      location: job.location ?? "",
      country: job.country ?? "",
      type: job.type ?? "Full-time",
      level: job.level ?? "Mid-level",
      workMode: job.workMode ?? "On-site",
      description: job.description ?? "",
      responsibilities: job.responsibilities ?? "",
      requirements: job.requirements ?? "",
      benefits: job.benefits ?? "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.department.trim() || !form.location.trim() || !form.description.trim()) {
      toast({ title: "Please fill in all required fields (Title, Department, Location, Description)", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editJob) {
        await apiFetch(`/api/jobs/${editJob.id}`, { method: "PATCH", body: JSON.stringify(form) });
        toast({ title: "Job updated successfully" });
      } else {
        await apiFetch("/api/jobs", { method: "POST", body: JSON.stringify(form) });
        toast({ title: "Job created as draft — click Publish to make it live" });
      }
      qc.invalidateQueries({ queryKey: ["admin-jobs"] });
      setShowForm(false);
    } catch (e: any) {
      toast({ title: e.message ?? "Failed to save job", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (job: any, status: string) => {
    try {
      await apiFetch(`/api/jobs/${job.id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      toast({
        title: status === "published"
          ? "Job published — now visible on website"
          : status === "closed"
          ? "Job closed"
          : "Job set to draft",
      });
      qc.invalidateQueries({ queryKey: ["admin-jobs"] });
    } catch (e: any) {
      toast({ title: e.message ?? "Failed", variant: "destructive" });
    }
  };

  const handleDelete = async (job: any) => {
    if (!confirm(`Delete "${job.title}"? This will also delete all applications for this job.`)) return;
    try {
      await apiFetch(`/api/jobs/${job.id}`, { method: "DELETE" });
      toast({ title: "Job deleted" });
      qc.invalidateQueries({ queryKey: ["admin-jobs"] });
    } catch (e: any) {
      toast({ title: e.message ?? "Failed", variant: "destructive" });
    }
  };

  return (
    <AppLayout title="Job Postings">
      {/* Portal modal — rendered outside AppLayout DOM to avoid overflow clipping */}
      {showForm && (
        <JobFormModal
          editJob={editJob}
          form={form}
          setForm={setForm}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
          saving={saving}
        />
      )}

      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Job Postings</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage open positions — published jobs appear live on the website instantly
            </p>
          </div>
          <Button size="sm" className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Job
          </Button>
        </div>

        {/* Jobs list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-sm p-5 animate-pulse h-20" />
            ))}
          </div>
        ) : (jobs as any[]).length === 0 ? (
          <div className="bg-card border border-border rounded-sm py-16 text-center">
            <Briefcase className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No job postings yet</p>
            <p className="text-xs text-muted-foreground mt-1">Click "New Job" to create your first posting</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(jobs as any[]).map((job) => (
              <div
                key={job.id}
                className="bg-card border border-border rounded-sm p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLOURS[job.status] ?? ""}`}>
                        {job.status}
                      </span>
                      {job.jobId && (
                        <span className="text-xs font-mono text-muted-foreground">{job.jobId}</span>
                      )}
                      <span className="text-xs text-muted-foreground">{job.department}</span>
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{job.title}</h3>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.type}</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {job.applicationCount ?? 0} application{job.applicationCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    {job.status === "draft" && (
                      <Button
                        size="sm" variant="outline"
                        className="gap-1 text-green-600 border-green-500/30 hover:bg-green-500/5"
                        onClick={() => handleStatusChange(job, "published")}
                      >
                        <Eye className="h-3.5 w-3.5" /> Publish
                      </Button>
                    )}
                    {job.status === "published" && (
                      <Button
                        size="sm" variant="outline"
                        className="gap-1 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/5"
                        onClick={() => handleStatusChange(job, "closed")}
                      >
                        <EyeOff className="h-3.5 w-3.5" /> Close
                      </Button>
                    )}
                    {job.status === "closed" && (
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange(job, "draft")}>
                        Reopen
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => openEdit(job)}>
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      size="sm" variant="outline"
                      className="gap-1 text-destructive border-destructive/30 hover:bg-destructive/5"
                      onClick={() => handleDelete(job)}
                    >
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