"use client";

import { useEffect, useState } from "react";
import { getReviews, updateReview, deleteReview } from "@/lib/firestore";
import { Star, Check, X, Trash2, Loader, CheckCircle, AlertCircle } from "lucide-react";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  
  // Pagination & per-item actions states
  const [currentPage, setCurrentPage] = useState(1);
  const [statusLoadingId, setStatusLoadingId] = useState<string | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    setLoading(true);
    try {
      const data = await getReviews();
      setReviews(data);
    } catch {
      showToast("error", "Failed to fetch reviews.");
    }
    setLoading(false);
  }

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleStatus(id: string, active: boolean) {
    setStatusLoadingId(id);
    try {
      await updateReview(id, { active });
      setReviews(reviews.map(r => r.id === id ? { ...r, active } : r));
      showToast("success", active ? "Review approved successfully!" : "Review hidden from store.");
    } catch {
      showToast("error", "Failed to update review status.");
    } finally {
      setStatusLoadingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this review permanently?")) return;
    setDeleteLoadingId(id);
    try {
      await deleteReview(id);
      setReviews(reviews.filter(r => r.id !== id));
      showToast("success", "Review deleted permanently.");
    } catch {
      showToast("error", "Failed to delete review.");
    } finally {
      setDeleteLoadingId(null);
    }
  }

  const paginatedReviews = reviews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
        <h1 className="text-3xl font-serif font-semibold text-gold tracking-wide">Reviews & Moderation</h1>
        <p className="text-sm text-cream/55 mt-1">Approve, reject, or delete customer reviews submitted across products.</p>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center text-gold">
          <Loader className="animate-spin" size={32} />
          <span className="ml-2">Loading reviews...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-[2rem] border border-gold/15 bg-white/[0.03] p-12 text-center shadow-jewel">
          <h3 className="text-xl font-serif text-gold">No Reviews Submitted</h3>
          <p className="text-cream/55 text-sm mt-2">Reviews posted by users will populate here for moderator vetting.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {paginatedReviews.map((r) => (
            <div
              key={r.id}
              className={`rounded-3xl border p-5 bg-white/[0.03] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                r.active ? "border-gold/15" : "border-rose/10 opacity-70"
              }`}
            >
              {/* Review details */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3 font-semibold">
                  <span className="text-cream">{r.name}</span>
                  <div className="flex items-center text-gold text-xs">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < r.rating ? "fill-gold" : "text-gold/20"} />
                    ))}
                  </div>
                  {r.productName && (
                    <span className="text-[10px] text-gold uppercase tracking-wider font-mono">
                      Product: {r.productName}
                    </span>
                  )}
                </div>
                <p className="text-cream/70 text-sm italic font-sans leading-relaxed">“{r.comment}”</p>
                {r.createdAt && (
                  <p className="text-[10px] text-cream/45">Posted on: {new Date(r.createdAt).toLocaleDateString()}</p>
                )}
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-3 justify-end">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${
                  r.active ? "bg-emerald-500/10 text-emerald-400" : "bg-rose/10 text-rose"
                }`}>
                  {r.active ? "Visible" : "Hidden"}
                </span>

                <div className="flex gap-2 border-l border-gold/15 pl-4">
                  <button
                    disabled={statusLoadingId === r.id || deleteLoadingId === r.id}
                    onClick={() => handleStatus(r.id, !r.active)}
                    className={`p-2 rounded-full transition-colors disabled:opacity-50 ${
                      r.active 
                        ? "bg-rose/10 text-rose hover:bg-rose hover:text-noir" 
                        : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-noir"
                    }`}
                    title={r.active ? "Hide review" : "Approve review"}
                  >
                    {statusLoadingId === r.id ? (
                      <Loader className="animate-spin h-3.5 w-3.5" />
                    ) : r.active ? (
                      <X size={14} />
                    ) : (
                      <Check size={14} />
                    )}
                  </button>

                  <button
                    disabled={statusLoadingId === r.id || deleteLoadingId === r.id}
                    onClick={() => handleDelete(r.id)}
                    className="p-2 rounded-full bg-noir text-rose border border-rose/20 hover:bg-rose hover:text-noir transition-colors disabled:opacity-50"
                    title="Delete permanently"
                  >
                    {deleteLoadingId === r.id ? (
                      <Loader className="animate-spin h-3.5 w-3.5" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {reviews.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between border-t border-gold/15 pt-6 mt-6">
              <span className="text-xs text-cream/55">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, reviews.length)} of {reviews.length} reviews
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
                  disabled={currentPage * ITEMS_PER_PAGE >= reviews.length}
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
