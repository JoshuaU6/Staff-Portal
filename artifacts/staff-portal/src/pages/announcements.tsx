import AppLayout from "@/components/layout/AppLayout";
import {
  useListAnnouncements,
  getListAnnouncementsQueryKey,
} from "@workspace/api-client-react";
import { Megaphone } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export default function AnnouncementsPage() {
  const { data: announcements, isLoading } = useListAnnouncements(
    {},
    { query: { queryKey: getListAnnouncementsQueryKey({}) } }
  );

  return (
    <AppLayout title="Announcements">
      <div className="max-w-3xl mx-auto space-y-5">
        <h2 className="text-lg font-semibold text-foreground">Company Announcements</h2>

        <div className="space-y-3" data-testid="announcements-list">
          {isLoading ? (
            <div className="bg-card border border-border rounded-sm px-5 py-8 text-sm text-muted-foreground text-center">
              Loading announcements...
            </div>
          ) : announcements?.length === 0 ? (
            <div className="bg-card border border-border rounded-sm px-5 py-12 text-center">
              <Megaphone className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No announcements yet</p>
            </div>
          ) : (
            announcements?.map((ann) => (
              <div key={ann.id} className="bg-card border border-border rounded-sm p-5" data-testid={`announcement-${ann.id}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground mb-2">{ann.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{ann.body}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-[10px] font-medium uppercase tracking-wide bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-sm">
                      {ann.scope}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">{ann.createdByName}</span>
                  <span className="text-xs text-muted-foreground">
                    {ann.publishedAt
                      ? format(new Date(ann.publishedAt), "d MMM yyyy, HH:mm")
                      : ""}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {ann.publishedAt ? formatDistanceToNow(new Date(ann.publishedAt), { addSuffix: true }) : ""}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
