import AppLayout from "@/components/layout/AppLayout";
import {
  useListDocuments,
  getListDocumentsQueryKey,
} from "@workspace/api-client-react";
import { FileText, Lock, Globe, Shield, Key, Download, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useGetCurrentUser } from "@workspace/api-client-react";

const SENSITIVITY_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  public: { icon: Globe, color: "text-green-500", label: "Public" },
  internal: { icon: Shield, color: "text-blue-500", label: "Internal" },
  confidential: { icon: Lock, color: "text-yellow-500", label: "Confidential" },
  restricted: { icon: Key, color: "text-red-500", label: "Restricted" },
};

const ADMIN_ROLES = ["chairman", "ict_admin", "hr_admin"];

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const [filter, setFilter] = useState<string>("all");
  const [downloading, setDownloading] = useState<number | null>(null);
  const params = filter !== "all" ? { sensitivity: filter as any } : {};
  const { data: docs, isLoading } = useListDocuments(params, {
    query: { queryKey: getListDocumentsQueryKey(params) },
  });
  const { toast } = useToast();
  const { data: me } = useGetCurrentUser();
  const isAdmin = ADMIN_ROLES.includes(me?.role ?? "");

  const handleView = async (docId: number, docName: string, sensitivity: string) => {
    if (sensitivity === "confidential" && !isAdmin) {
      toast({ title: "Access denied", description: "Confidential documents require admin access.", variant: "destructive" });
      return;
    }

    setDownloading(docId);
    try {
      const res = await fetch(`/api/documents/${docId}/download`, { credentials: "include" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast({ title: "Access denied", description: body.error ?? "You do not have permission to access this document.", variant: "destructive" });
        return;
      }
      const { url } = await res.json();
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        toast({ title: "No file attached", description: "This document has no file stored yet.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to retrieve document.", variant: "destructive" });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <AppLayout title="Documents">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Department Documents</h2>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-44" data-testid="select-sensitivity-filter">
              <SelectValue placeholder="Filter by sensitivity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Documents</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="internal">Internal</SelectItem>
              <SelectItem value="confidential">Confidential</SelectItem>
              <SelectItem value="restricted">Restricted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card border border-border rounded-sm divide-y divide-border" data-testid="documents-list">
          {isLoading ? (
            <div className="px-5 py-8 text-sm text-muted-foreground text-center">Loading documents...</div>
          ) : docs?.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No documents found</p>
            </div>
          ) : (
            docs?.map((doc) => {
              const cfg = SENSITIVITY_CONFIG[doc.sensitivity ?? "internal"];
              const Icon = cfg?.icon ?? FileText;
              const isConfidential = doc.sensitivity === "confidential";
              const canAccess = !isConfidential || isAdmin;

              return (
                <div key={doc.id} className="px-5 py-4 flex items-center gap-4" data-testid={`document-${doc.id}`}>
                  <div className="w-9 h-9 rounded-sm bg-muted flex items-center justify-center shrink-0">
                    {canAccess ? (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{doc.name}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {doc.uploadedByName && (
                        <span className="text-xs text-muted-foreground">{doc.uploadedByName}</span>
                      )}
                      {doc.createdAt && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(doc.createdAt as string), { addSuffix: true })}
                        </span>
                      )}
                      {doc.fileSize ? (
                        <span className="text-xs text-muted-foreground">{formatBytes(doc.fileSize)}</span>
                      ) : null}
                      {typeof doc.downloadCount === "number" && doc.downloadCount > 0 && (
                        <span className="text-xs text-muted-foreground">{doc.downloadCount} download{doc.downloadCount !== 1 ? "s" : ""}</span>
                      )}
                    </div>
                    {!canAccess && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs text-yellow-600">Confidential — admin access required</span>
                      </div>
                    )}
                  </div>
                  <div className={cn("flex items-center gap-1.5 text-xs font-medium shrink-0", cfg?.color)}>
                    <Icon className="h-3.5 w-3.5" />
                    {cfg?.label}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 text-xs shrink-0"
                    disabled={!canAccess || downloading === doc.id}
                    onClick={() => handleView(doc.id!, doc.name, doc.sensitivity ?? "internal")}
                    data-testid={`button-view-document-${doc.id}`}
                  >
                    <Download className="h-3 w-3" />
                    {downloading === doc.id ? "..." : "View"}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
