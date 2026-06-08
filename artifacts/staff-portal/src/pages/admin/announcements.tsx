import AppLayout from "@/components/layout/AppLayout";
import {
  useListAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  getListAnnouncementsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function AdminAnnouncementsPage() {
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [scope, setScope] = useState("all");
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: announcements, isLoading } = useListAnnouncements({}, {
    query: { queryKey: getListAnnouncementsQueryKey({}) },
  });
  const createAnn = useCreateAnnouncement();
  const deleteAnn = useDeleteAnnouncement();

  const handleCreate = () => {
    if (!title.trim() || !body.trim()) return;
    createAnn.mutate(
      { data: { title: title.trim(), body: body.trim(), scope: scope as any } },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getListAnnouncementsQueryKey({}) });
          toast({ title: "Announcement published" });
          setOpen(false); setTitle(""); setBody(""); setScope("all");
        },
        onError: () => toast({ title: "Failed to publish", variant: "destructive" }),
      }
    );
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteAnn.mutate({ id: deleteId }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListAnnouncementsQueryKey({}) });
        toast({ title: "Announcement removed" });
        setDeleteId(null);
      },
      onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
    });
  };

  return (
    <AppLayout title="Announcements">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Company Announcements</h2>
          <Button size="sm" className="gap-2" onClick={() => setOpen(true)} data-testid="button-create-announcement">
            <Plus className="h-4 w-4" />
            New Announcement
          </Button>
        </div>

        <div className="space-y-3" data-testid="announcements-list">
          {isLoading ? (
            <div className="bg-card border border-border rounded-sm px-5 py-8 text-sm text-muted-foreground text-center">Loading...</div>
          ) : announcements?.length === 0 ? (
            <div className="bg-card border border-border rounded-sm px-5 py-12 text-center">
              <Megaphone className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No announcements yet</p>
            </div>
          ) : (
            announcements?.map((ann) => (
              <div key={ann.id} className="bg-card border border-border rounded-sm p-5" data-testid={`announcement-${ann.id}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{ann.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-2">{ann.body}</p>
                    <div className="flex items-center gap-4 mt-3 pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">{ann.createdByName}</span>
                      <span className="text-[10px] font-medium uppercase tracking-wide bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-sm">{ann.scope}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {ann.publishedAt ? formatDistanceToNow(new Date(ann.publishedAt), { addSuffix: true }) : ""}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => setDeleteId(ann.id!)}
                    data-testid={`button-delete-announcement-${ann.id}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" data-testid="input-announcement-title" />
            </div>
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Announcement content..." rows={5} data-testid="input-announcement-body" />
            </div>
            <div className="space-y-2">
              <Label>Scope</Label>
              <Select value={scope} onValueChange={setScope}>
                <SelectTrigger data-testid="select-announcement-scope">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createAnn.isPending || !title.trim() || !body.trim()} data-testid="button-publish-announcement">
              {createAnn.isPending ? "Publishing..." : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>This announcement will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground" data-testid="button-confirm-delete">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
