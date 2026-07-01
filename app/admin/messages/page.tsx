"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { getContactMessages, updateContactMessage, deleteContactMessage } from "@/lib/firestore";
import { ContactMessage } from "@/types";
import { Mail, Trash2, CheckCheck, Undo2, Check } from "lucide-react";
import { HeartLoader } from "@/components/ui/HeartLoader";
import { AdminCard, StatusBadge } from "@/components/admin/Bits";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & per-item action states
  const [currentPage, setCurrentPage] = useState(1);
  const [statusLoadingId, setStatusLoadingId] = useState<string | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    setLoading(true);
    try {
      const data = await getContactMessages();
      setMessages(data);
    } catch {
      toast.error("Failed to fetch contact messages.");
    }
    setLoading(false);
  }

  async function toggleRead(msg: ContactMessage) {
    const isRead = !msg.isRead;
    const targetId = msg.id || msg.createdAt;
    setStatusLoadingId(targetId);
    try {
      await updateContactMessage(targetId, { isRead });
      setMessages(messages.map(m => m.id === msg.id || m.createdAt === msg.createdAt ? { ...m, isRead } : m));
      toast.success(isRead ? "Marked as read." : "Marked as unread.");
    } catch {
      toast.error("Failed to update read status.");
    } finally {
      setStatusLoadingId(null);
    }
  }

  async function toggleReplied(msg: ContactMessage) {
    const isReplied = !msg.isReplied;
    const targetId = msg.id || msg.createdAt;
    setStatusLoadingId(targetId);
    try {
      await updateContactMessage(targetId, { isReplied });
      setMessages(messages.map(m => m.id === msg.id || m.createdAt === msg.createdAt ? { ...m, isReplied } : m));
      toast.success(isReplied ? "Marked as replied." : "Marked as pending reply.");
    } catch {
      toast.error("Failed to update reply status.");
    } finally {
      setStatusLoadingId(null);
    }
  }

  async function handleDelete(msg: ContactMessage) {
    if (!confirm("Are you sure you want to delete this message?")) return;
    const targetId = msg.id || msg.createdAt;
    setDeleteLoadingId(targetId);
    try {
      await deleteContactMessage(targetId);
      setMessages(messages.filter(m => m.id !== msg.id && m.createdAt !== msg.createdAt));
      toast.success("Message deleted successfully.");
    } catch {
      toast.error("Failed to delete message.");
    } finally {
      setDeleteLoadingId(null);
    }
  }

  const paginatedMessages = messages.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <Protected adminOnly>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-semibold text-foreground tracking-tight">Customer Messages</h1>
            <p className="text-muted-foreground mt-1">Replies from your contact form</p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-[40vh] items-center justify-center text-muted-foreground">
            <HeartLoader text="Loading messages..." />
          </div>
        ) : messages.length === 0 ? (
          <AdminCard className="p-12 text-center shadow-sm">
            <div className="bg-secondary/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-display text-foreground">No Messages Received</h3>
            <p className="text-muted-foreground text-sm mt-2">Emails submitted through the contact page will appear here.</p>
          </AdminCard>
        ) : (
          <div className="glass-card divide-y divide-border/60 rounded-2xl border border-border/60 shadow-sm bg-card/40">
            {paginatedMessages.map((m) => {
              const targetId = m.id || m.createdAt;
              return (
                <div key={targetId} className={`p-4 sm:p-5 flex flex-wrap gap-3 items-start hover:bg-secondary/30 transition-colors ${!m.isRead ? "bg-primary/5" : ""}`}>
                  <div className="h-10 w-10 rounded-full grid place-items-center text-white text-xs font-semibold shrink-0" style={{ background: "var(--gradient-rose)" }}>
                    {(m.name || "A").split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`font-medium ${!m.isRead ? "text-foreground font-semibold" : "text-foreground/80"}`}>{m.name}</span>
                      <span className="text-xs text-muted-foreground">{m.email}</span>
                      {m.phone && <span className="text-xs text-muted-foreground">· {m.phone}</span>}
                      {m.createdAt && <span className="ml-auto text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleString()}</span>}
                    </div>
                    
                    <p className={`text-sm mt-1.5 whitespace-pre-wrap leading-relaxed ${!m.isRead ? "text-foreground" : "text-foreground/70"}`}>{m.message}</p>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-border/30">
                      <StatusBadge status={m.isReplied ? "Replied" : "Pending"} />
                      <span className="ml-auto" />
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        disabled={statusLoadingId === targetId}
                        onClick={() => toggleReplied(m)}
                        className="h-8 text-xs rounded-xl"
                      >
                        {statusLoadingId === targetId ? <HeartLoader size="sm" text="" /> : m.isReplied ? <><Undo2 className="h-3.5 w-3.5 mr-1" /> Unmark Reply</> : <><Check className="h-3.5 w-3.5 mr-1" /> Mark Replied</>}
                      </Button>

                      <Button 
                        size="sm" 
                        variant="outline" 
                        disabled={statusLoadingId === targetId}
                        onClick={() => toggleRead(m)}
                        className="h-8 text-xs rounded-xl"
                      >
                        {statusLoadingId === targetId ? <HeartLoader size="sm" text="" /> : m.isRead ? <><Mail className="h-3.5 w-3.5 mr-1" /> Mark unread</> : <><CheckCheck className="h-3.5 w-3.5 mr-1" /> Mark read</>}
                      </Button>

                      <Button 
                        size="icon" 
                        variant="ghost" 
                        disabled={deleteLoadingId === targetId}
                        onClick={() => handleDelete(m)}
                        className="h-8 w-8 rounded-xl text-dustyRose hover:text-dustyRose hover:bg-dustyRose/10"
                      >
                        {deleteLoadingId === targetId ? <HeartLoader size="sm" text="" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {messages.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between p-4 px-5">
                <span className="text-xs text-muted-foreground">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, messages.length)} of {messages.length} messages
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    className="h-8 text-xs rounded-xl"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage * ITEMS_PER_PAGE >= messages.length}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="h-8 text-xs rounded-xl"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Protected>
  );
}
