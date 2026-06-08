import AppLayout from "@/components/layout/AppLayout";
import {
  useListDocuments,
  useDeleteDocument,
  useListDepartments,
  useGetDocumentAccessLogs,
  getListDocumentsQueryKey,
  getListDepartmentsQueryKey,
  getGetDocumentAccessLogsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Plus, Trash2, FileText, Lock, Globe, Shield, Key, Upload, Download, History, X, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";

const SENSITIVITY_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  public: { icon: Globe, color: "text-green-500", label: "Public" },
  internal: { icon: Shield, color: "text-blue-500", label: "Internal" },
  confidential: { icon: Lock, color: "text-yellow-500", label: "Confidential" },
  restricted: { icon: Key, color: "text-red-500", label: "Restricted" },
};

const ALLOWED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "image/png"];

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function AccessHistoryPanel({ docId, onClose }: { docId: number; onClose: () => void }) {
  const { data: logs, isLoading } = useGetDocumentAccessLogs(docId, { limit: 10 }, {
    query: { queryKey: getGetDocumentAccessLogsQueryKey(docId, { limit: 10 }) },
  });

  return (
    <div className="border-t border-border bg-muted/30">
      <div className="px-5 py-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Access History</span>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose} data-testid="button-close-access-history">
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="px-5 pb-3">
        {isLoading ? (
          <p className="text-xs text-muted-foreground py-2">Loading...</p>
        ) : !logs?.length ? (
          <p className="text-xs text-muted-foreground py-2">No access events recorded yet.</p>
        ) : (
          <div className="space-y-1">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 py-1.5 border-b border-border/50 last:border-0" data-testid={`access-log-${log.id}`}>
                <span className={cn("text-xs font-medium w-16 shrink-0", log.action === "download" ? "text-blue-500" : "text-green-500")}>
                  {log.action}
                </span>
                <span className="text-xs text-foreground font-medium truncate flex-1">{log.userName ?? "Unknown"}</span>
                {log.staffId && <span className="text-xs text-muted-foreground font-mono shrink-0">{log.staffId}</span>}
                <span className="text-xs text-muted-foreground shrink-0">{log.ipAddress ?? "—"}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {log.accessedAt ? format(new Date(log.accessedAt), "dd MMM HH:mm") : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDocumentsPage() {
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [expandedAccessId, setExpandedAccessId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [form, setForm] = useState({ name: "", departmentId: "", sensitivity: "internal" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: docs, isLoading } = useListDocuments({}, { query: { queryKey: getListDocumentsQueryKey({}) } });
  const { data: depts } = useListDepartments({ query: { queryKey: getListDepartmentsQueryKey() } });
  const deleteDoc = useDeleteDocument();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Allowed: PDF, DOCX, XLSX, PNG", variant: "destructive" });
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 25 MB.", variant: "destructive" });
      return;
    }
    setSelectedFile(file);
    if (!form.name) {
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      setForm((f) => ({ ...f, name: baseName }));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !form.name.trim()) return;
    setUploading(true);
    setUploadProgress("Uploading...");
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("name", form.name.trim());
      formData.append("sensitivity", form.sensitivity);
      if (form.departmentId) formData.append("departmentId", form.departmentId);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Upload failed");
      }

      qc.invalidateQueries({ queryKey: getListDocumentsQueryKey({}) });
      toast({ title: "Document uploaded" });
      setOpen(false);
      setSelectedFile(null);
      setForm({ name: "", departmentId: "", sensitivity: "internal" });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteDoc.mutate({ id: deleteId }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListDocumentsQueryKey({}) });
        toast({ title: "Document removed" });
        setDeleteId(null);
      },
      onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
    });
  };

  const toggleAccess = (id: number) => {
    setExpandedAccessId((prev) => (prev === id ? null : id));
  };

  return (
    <AppLayout title="Documents">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Document Library</h2>
          <Button size="sm" className="gap-2" onClick={() => setOpen(true)} data-testid="button-add-document">
            <Plus className="h-4 w-4" />
            Upload Document
          </Button>
        </div>

        <div className="bg-card border border-border rounded-sm divide-y divide-border" data-testid="documents-list">
          {isLoading ? (
            <div className="px-5 py-8 text-sm text-muted-foreground text-center">Loading...</div>
          ) : docs?.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No documents yet</p>
            </div>
          ) : (
            docs?.map((doc) => {
              const cfg = SENSITIVITY_CONFIG[doc.sensitivity ?? "internal"];
              const Icon = cfg?.icon ?? FileText;
              const isExpanded = expandedAccessId === doc.id;
              return (
                <div key={doc.id} data-testid={`document-${doc.id}`}>
                  <div className="px-5 py-4 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-sm bg-muted flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{doc.name}</p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {doc.mimeType && <span className="text-xs text-muted-foreground font-mono">{doc.mimeType.split("/").pop()?.toUpperCase()}</span>}
                        {doc.fileSize ? <span className="text-xs text-muted-foreground">{formatBytes(doc.fileSize)}</span> : null}
                        {doc.uploadedByName && <span className="text-xs text-muted-foreground">{doc.uploadedByName}</span>}
                        {doc.createdAt && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(doc.createdAt as string), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                    {typeof doc.downloadCount === "number" && (
                      <Badge variant="outline" className="text-xs shrink-0" data-testid={`badge-downloads-${doc.id}`}>
                        <Download className="h-3 w-3 mr-1" />
                        {doc.downloadCount}
                      </Badge>
                    )}
                    <div className={cn("flex items-center gap-1.5 text-xs font-medium shrink-0", cfg?.color)}>
                      <Icon className="h-3.5 w-3.5" />
                      {cfg?.label}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground shrink-0"
                      onClick={() => toggleAccess(doc.id!)}
                      data-testid={`button-access-history-${doc.id}`}
                      title="Access history"
                    >
                      {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <History className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => setDeleteId(doc.id!)}
                      data-testid={`button-delete-document-${doc.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {isExpanded && (
                    <AccessHistoryPanel docId={doc.id!} onClose={() => setExpandedAccessId(null)} />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={(v) => { if (!uploading) { setOpen(v); if (!v) { setSelectedFile(null); setForm({ name: "", departmentId: "", sensitivity: "internal" }); if (fileInputRef.current) fileInputRef.current.value = ""; } } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>File</Label>
              <div
                className="border-2 border-dashed border-border rounded-sm p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                data-testid="upload-dropzone"
              >
                {selectedFile ? (
                  <div className="space-y-1">
                    <FileText className="h-6 w-6 text-primary mx-auto" />
                    <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(selectedFile.size)}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-6 w-6 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">Click to select a file</p>
                    <p className="text-xs text-muted-foreground">PDF, DOCX, XLSX, PNG — max 25 MB</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.xlsx,.png"
                className="hidden"
                onChange={handleFileChange}
                data-testid="input-file"
              />
            </div>
            <div className="space-y-2">
              <Label>Document Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Q4 Financial Report"
                data-testid="input-document-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={form.departmentId} onValueChange={(v) => setForm((f) => ({ ...f, departmentId: v }))}>
                  <SelectTrigger data-testid="select-document-department"><SelectValue placeholder="All departments" /></SelectTrigger>
                  <SelectContent>
                    {depts?.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sensitivity</Label>
                <Select value={form.sensitivity} onValueChange={(v) => setForm((f) => ({ ...f, sensitivity: v }))}>
                  <SelectTrigger data-testid="select-document-sensitivity"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="confidential">Confidential</SelectItem>
                    <SelectItem value="restricted">Restricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={uploading}>Cancel</Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || !selectedFile || !form.name.trim()}
              data-testid="button-confirm-upload-document"
            >
              {uploading ? uploadProgress || "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>This document record will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground" data-testid="button-confirm-delete-document">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
