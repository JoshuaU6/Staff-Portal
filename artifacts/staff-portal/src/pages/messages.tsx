import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useGetCurrentUser } from "@workspace/api-client-react";
import { Mail, Send, Inbox, Trash2, Plus, ChevronRight, X, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface MessageItem {
  id: number;
  fromUserId: number;
  toUserId: number | null;
  fromName: string;
  toName: string;
  subject: string;
  body: string;
  isRead: boolean;
  scope: string;
  createdAt: string;
}

interface StaffUser {
  id: number;
  fullName: string;
  email: string;
  staffId: string;
  role: string;
}

async function fetchMessages(box: "inbox" | "sent"): Promise<MessageItem[]> {
  const res = await fetch(`/api/messages?box=${box}`, { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

async function sendMessage(payload: { toUserId?: number; subject: string; body: string; scope: string }) {
  const res = await fetch(`/api/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to send");
  return res.json();
}

async function markRead(id: number) {
  await fetch(`/api/messages/${id}/read`, { method: "PATCH", credentials: "include" });
}

async function deleteMessage(id: number) {
  await fetch(`/api/messages/${id}`, { method: "DELETE", credentials: "include" });
}

async function fetchStaff(): Promise<StaffUser[]> {
  const res = await fetch(`/api/users`, { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

const ROLE_LABELS: Record<string, string> = {
  chairman: "Chairman", ict_admin: "ICT Admin", hr_admin: "HR Admin",
  compliance_admin: "Compliance Admin", auditor: "Auditor",
  department_head: "Dept. Head", manager: "Manager", supervisor: "Supervisor", staff: "Staff",
};

export default function MessagesPage() {
  const { data: me } = useGetCurrentUser();
  const { toast } = useToast();
  const isAdmin = ["chairman", "ict_admin", "hr_admin"].includes(me?.role ?? "");

  const [box, setBox] = useState<"inbox" | "sent">("inbox");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MessageItem | null>(null);
  const [search, setSearch] = useState("");
  const [composing, setComposing] = useState(false);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [composeData, setComposeData] = useState({ toUserId: "", subject: "", body: "", scope: "personal" });
  const [sending, setSending] = useState(false);

  const showDetail = composing || !!selected;

  const load = async () => {
    setLoading(true);
    const msgs = await fetchMessages(box);
    setMessages(msgs);
    setLoading(false);
  };

  useEffect(() => { load(); }, [box]);

  const openMessage = async (msg: MessageItem) => {
    setSelected(msg);
    setComposing(false);
    if (!msg.isRead && box === "inbox") {
      await markRead(msg.id);
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, isRead: true } : m));
    }
  };

  const handleDelete = async (id: number) => {
    await deleteMessage(id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selected?.id === id) setSelected(null);
    toast({ title: "Message deleted" });
  };

  const openCompose = async () => {
    if (isAdmin && staff.length === 0) {
      const users = await fetchStaff();
      setStaff(users.filter((u) => u.id !== me?.id));
    }
    setSelected(null);
    setComposing(true);
    setComposeData({ toUserId: "", subject: "", body: "", scope: "personal" });
  };

  const handleSend = async () => {
    if (!composeData.subject.trim() || !composeData.body.trim()) {
      toast({ title: "Subject and message are required", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      await sendMessage({
        toUserId: composeData.toUserId ? parseInt(composeData.toUserId) : undefined,
        subject: composeData.subject,
        body: composeData.body,
        scope: composeData.scope,
      });
      toast({ title: "Message sent" });
      setComposing(false);
      if (box === "sent") load();
    } catch {
      toast({ title: "Failed to send message", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const goBack = () => { setComposing(false); setSelected(null); };

  const filtered = messages.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return m.subject.toLowerCase().includes(q) || m.fromName.toLowerCase().includes(q) || m.toName.toLowerCase().includes(q);
  });

  const unreadCount = messages.filter((m) => !m.isRead && box === "inbox").length;

  return (
    <AppLayout title="Messages">
      <div className="max-w-6xl mx-auto flex flex-col gap-4">

        {/* Page header */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Messages</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Internal staff communication</p>
          </div>
          <Button size="sm" className="gap-2" onClick={openCompose} data-testid="button-compose">
            <Plus className="h-4 w-4" />
            Compose
          </Button>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row gap-4">

          {/* Left: folder + list — hidden on mobile when detail/compose is open */}
          <div className={cn(
            "md:w-80 md:shrink-0 flex flex-col gap-3",
            showDetail ? "hidden md:flex" : "flex"
          )}>
            {/* Folder tabs */}
            <div className="flex gap-1 bg-muted/50 p-1 rounded-sm border border-border">
              <button
                onClick={() => { setBox("inbox"); setSelected(null); }}
                className={cn("flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-sm transition-colors", box === "inbox" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground")}
                data-testid="tab-inbox"
              >
                <Inbox className="h-3.5 w-3.5" />
                Inbox
                {unreadCount > 0 && <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
              </button>
              <button
                onClick={() => { setBox("sent"); setSelected(null); }}
                className={cn("flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-sm transition-colors", box === "sent" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground")}
                data-testid="tab-sent"
              >
                <Send className="h-3.5 w-3.5" />
                Sent
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search messages..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-8 text-xs" />
            </div>

            {/* Message list */}
            <div className="bg-card border border-border rounded-sm overflow-y-auto min-h-[300px] md:min-h-0 md:max-h-[calc(100vh-16rem)]">
              {loading ? (
                <div className="p-4 text-center text-xs text-muted-foreground">Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center">
                  <Mail className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">{box === "inbox" ? "No messages" : "Nothing sent yet"}</p>
                </div>
              ) : (
                filtered.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => openMessage(msg)}
                    className={cn(
                      "w-full text-left px-3 py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors",
                      selected?.id === msg.id && "bg-primary/5 border-l-2 border-l-primary"
                    )}
                    data-testid={`message-item-${msg.id}`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-0.5">
                      <p className={cn("text-xs truncate", !msg.isRead && box === "inbox" ? "font-semibold text-foreground" : "font-medium text-foreground/80")}>
                        {box === "inbox" ? msg.fromName : msg.toName}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {format(new Date(msg.createdAt), "dd MMM")}
                      </span>
                    </div>
                    <p className={cn("text-xs truncate", !msg.isRead && box === "inbox" ? "text-foreground" : "text-muted-foreground")}>
                      {msg.subject}
                    </p>
                    {!msg.isRead && box === "inbox" && (
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right: message detail or compose — full-screen on mobile when active */}
          <div className={cn(
            "flex-1 bg-card border border-border rounded-sm overflow-hidden flex flex-col min-h-[500px] md:min-h-0 md:max-h-[calc(100vh-16rem)]",
            !showDetail ? "hidden md:flex" : "flex"
          )}>
            {/* Mobile back button */}
            {showDetail && (
              <button
                className="md:hidden flex items-center gap-2 px-4 py-2.5 border-b border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={goBack}
                data-testid="button-back-to-list"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to messages
              </button>
            )}

            {composing ? (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">New Message</h3>
                  <button onClick={goBack} className="hidden md:block text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                  {isAdmin && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Scope</label>
                      <select
                        value={composeData.scope}
                        onChange={(e) => setComposeData((d) => ({ ...d, scope: e.target.value, toUserId: e.target.value !== "personal" ? "" : d.toUserId }))}
                        className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-background text-foreground"
                        data-testid="compose-scope"
                      >
                        <option value="personal">Individual staff member</option>
                        <option value="all">All staff (broadcast)</option>
                      </select>
                    </div>
                  )}
                  {(!isAdmin || composeData.scope === "personal") && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">To</label>
                      {isAdmin ? (
                        <select
                          value={composeData.toUserId}
                          onChange={(e) => setComposeData((d) => ({ ...d, toUserId: e.target.value }))}
                          className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-background text-foreground"
                          data-testid="compose-recipient"
                        >
                          <option value="">Select recipient...</option>
                          {staff.map((u) => (
                            <option key={u.id} value={u.id}>{u.fullName} — {ROLE_LABELS[u.role] ?? u.role}</option>
                          ))}
                        </select>
                      ) : (
                        <Input placeholder="Recipient staff ID or name" value={composeData.toUserId} onChange={(e) => setComposeData((d) => ({ ...d, toUserId: e.target.value }))} data-testid="compose-recipient-input" />
                      )}
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Subject</label>
                    <Input placeholder="Message subject" value={composeData.subject} onChange={(e) => setComposeData((d) => ({ ...d, subject: e.target.value }))} data-testid="compose-subject" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Message</label>
                    <textarea
                      placeholder="Write your message here..."
                      value={composeData.body}
                      onChange={(e) => setComposeData((d) => ({ ...d, body: e.target.value }))}
                      rows={8}
                      className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-background text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                      data-testid="compose-body"
                    />
                  </div>
                </div>
                <div className="px-5 py-3 border-t border-border flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={goBack}>Cancel</Button>
                  <Button size="sm" onClick={handleSend} disabled={sending} data-testid="button-send-message">
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    {sending ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </div>
            ) : selected ? (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-foreground mb-1 break-words">{selected.subject}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>{box === "inbox" ? `From: ${selected.fromName}` : `To: ${selected.toName}`}</span>
                        <span>{format(new Date(selected.createdAt), "d MMM yyyy, HH:mm")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleDelete(selected.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete message"
                        data-testid="button-delete-message"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button onClick={goBack} className="hidden md:block p-1.5 text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-5 overflow-y-auto">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{selected.body}</p>
                </div>
                {box === "inbox" && (
                  <div className="px-5 py-3 border-t border-border">
                    <Button size="sm" variant="outline" className="gap-2" onClick={() => {
                      setComposeData({ toUserId: String(selected.fromUserId), subject: `Re: ${selected.subject}`, body: "", scope: "personal" });
                      setComposing(true);
                      setSelected(null);
                    }}>
                      <ChevronRight className="h-3.5 w-3.5" />
                      Reply
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <Mail className="h-12 w-12 text-muted-foreground/20 mb-4" />
                <p className="text-sm font-medium text-foreground">Select a message</p>
                <p className="text-xs text-muted-foreground mt-1">Choose a message from the list to read it</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
