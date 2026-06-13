"use client";

import { useEffect, useState } from "react";
import { getContactMessages, updateContactMessage, deleteContactMessage } from "@/lib/firestore";
import { ContactMessage } from "@/types";
import { Mail, MailOpen, Trash2, CheckCircle2, Loader, CheckCircle, AlertCircle } from "lucide-react";

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

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
      showToast("error", "Failed to fetch contact messages.");
    }
    setLoading(false);
  }

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  async function toggleRead(msg: ContactMessage) {
    const isRead = !msg.isRead;
    const targetId = msg.id || msg.createdAt;
    setStatusLoadingId(targetId);
    try {
      await updateContactMessage(targetId, { isRead });
      setMessages(messages.map(m => m.id === msg.id || m.createdAt === msg.createdAt ? { ...m, isRead } : m));
      showToast("success", isRead ? "Marked as read." : "Marked as unread.");
    } catch {
      showToast("error", "Failed to update read status.");
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
      showToast("success", isReplied ? "Marked as replied." : "Marked as pending reply.");
    } catch {
      showToast("error", "Failed to update reply status.");
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
      showToast("success", "Message deleted successfully.");
    } catch {
      showToast("error", "Failed to delete message.");
    } finally {
      setDeleteLoadingId(null);
    }
  }

  const paginatedMessages = messages.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-8 animate-fade-in relative pb-10">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl px-5 py-3 shadow-lg border text-sm transition-all ${
          toast.type === "success" 
            ? "bg-emerald-950/90 text-emerald-400 border-emerald-500/20" 
            : "bg-rose-950/90 text-rose-400 border-rose-500/20"
        }`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-serif font-semibold text-gold tracking-wide">Customer Support enquiries</h1>
        <p className="text-sm text-cream/55 mt-1">Read questions, trace email queries, and record client responses.</p>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center text-gold">
          <Loader className="animate-spin" size={32} />
          <span className="ml-2">Loading messages...</span>
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-[2rem] border border-gold/15 bg-white/[0.03] p-12 text-center shadow-jewel">
          <h3 className="text-xl font-serif text-gold">No Messages Received</h3>
          <p className="text-cream/55 text-sm mt-2">Emails submitted through the contact page will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedMessages.map((m) => {
            const targetId = m.id || m.createdAt;
            return (
              <div
                key={targetId}
                className={`rounded-3xl border p-5 bg-white/[0.03] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                  m.isRead ? "border-gold/5 opacity-70" : "border-gold/25 bg-gold/[0.01]"
                }`}
              >
                {/* Message Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3 font-semibold">
                    <span className={`text-sm ${m.isRead ? "text-cream/70" : "text-gold font-bold"}`}>
                      {m.name}
                    </span>
                    <span className="text-xs text-cream/45 font-mono">({m.email})</span>
                    {m.phone && (
                      <span className="text-xs text-gold/80 font-mono">
                        | Phone: {m.phone}
                      </span>
                    )}
                    {m.createdAt && (
                      <span className="text-[10px] text-cream/45 border-l border-gold/10 pl-3">
                        {new Date(m.createdAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-cream/80 text-sm font-sans whitespace-pre-wrap leading-relaxed">{m.message}</p>
                </div>

                {/* Status and Action Buttons */}
                <div className="flex items-center gap-3 justify-end shrink-0">
                  {/* Replied status indicator */}
                  <button
                    type="button"
                    disabled={statusLoadingId === targetId || deleteLoadingId === targetId}
                    onClick={() => toggleReplied(m)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all disabled:opacity-50 ${
                      m.isReplied 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : "bg-noir/30 text-cream/40 border-gold/10 hover:border-gold/30"
                    }`}
                  >
                    {statusLoadingId === targetId ? (
                      <Loader className="animate-spin h-3.5 w-3.5" />
                    ) : (
                      <CheckCircle2 size={12} />
                    )}
                    <span>{m.isReplied ? "Replied" : "Pending Reply"}</span>
                  </button>

                  {/* Read indicator & actions */}
                  <div className="flex gap-2 border-l border-gold/15 pl-4">
                    <button
                      disabled={statusLoadingId === targetId || deleteLoadingId === targetId}
                      onClick={() => toggleRead(m)}
                      className={`p-2 rounded-full transition-colors disabled:opacity-50 ${
                        m.isRead 
                          ? "bg-noir text-cream/45 hover:bg-gold/10 hover:text-gold" 
                          : "bg-gold/10 text-gold hover:bg-gold hover:text-noir"
                      }`}
                      title={m.isRead ? "Mark unread" : "Mark read"}
                    >
                      {statusLoadingId === targetId ? (
                        <Loader className="animate-spin h-3.5 w-3.5" />
                      ) : m.isRead ? (
                        <MailOpen size={14} />
                      ) : (
                        <Mail size={14} />
                      )}
                    </button>

                    <button
                      disabled={statusLoadingId === targetId || deleteLoadingId === targetId}
                      onClick={() => handleDelete(m)}
                      className="p-2 rounded-full bg-noir text-rose border border-rose/20 hover:bg-rose hover:text-noir transition-colors disabled:opacity-50"
                      title="Delete message"
                    >
                      {deleteLoadingId === targetId ? (
                        <Loader className="animate-spin h-3.5 w-3.5" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination Controls */}
          {messages.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between border-t border-gold/15 pt-6 mt-6">
              <span className="text-xs text-cream/55">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, messages.length)} of {messages.length} messages
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="rounded-full border border-gold/15 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-cream hover:border-gold disabled:opacity-50 transition-all"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage * ITEMS_PER_PAGE >= messages.length}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="rounded-full border border-gold/15 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-cream hover:border-gold disabled:opacity-50 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
