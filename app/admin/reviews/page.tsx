"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { getReviews, updateReview, deleteReview , logActivity } from "@/lib/firestore";
import { Star, Check, X, Trash2, MessageSquare } from "lucide-react";
import { HeartLoader } from "@/components/ui/HeartLoader";
import { AdminCard, StatusBadge } from "@/components/admin/Bits";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
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
      toast.error("Failed to fetch reviews.");
    }
    setLoading(false);
  }

  async function handleStatus(id: string, active: boolean) {
    setStatusLoadingId(id);
    try {
      await updateReview(id, { active });
      setReviews(reviews.map(r => r.id === id ? { ...r, active } : r));
      toast.success(active ? "Review approved successfully!" : "Review hidden from store.");
    } catch {
      toast.error("Failed to update review status.");
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
      toast.success("Review deleted permanently.");
    } catch {
      toast.error("Failed to delete review.");
    } finally {
      setDeleteLoadingId(null);
    }
  }

  const paginatedReviews = reviews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <Protected adminOnly>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-semibold text-adminSidebar tracking-tight">Review Moderation</h1>
            <p className="text-adminMuted mt-1">Approve or hide customer reviews</p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-[40vh] items-center justify-center text-adminMuted">
            <HeartLoader text="Loading reviews..." />
          </div>
        ) : reviews.length === 0 ? (
          <AdminCard className="p-12 text-center shadow-sm bg-white border-adminBorder">
            <div className="bg-adminBg w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="h-6 w-6 text-adminMuted" />
            </div>
            <h3 className="text-xl font-serif text-adminSidebar">No Reviews Submitted</h3>
            <p className="text-adminMuted text-sm mt-2">Reviews posted by users will populate here for moderator vetting.</p>
          </AdminCard>
        ) : (
          <div className="space-y-3">
            {paginatedReviews.map((r) => (
              <div key={r.id} className="p-4 sm:p-5 rounded-2xl border border-adminBorder bg-white hover:bg-adminBg transition-colors shadow-sm">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="h-10 w-10 rounded-full grid place-items-center text-white text-xs font-semibold shrink-0 bg-adminGold shadow-sm">
                    {(r.name || "A").split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-serif font-medium text-adminSidebar">{r.name}</span>
                      <span className="text-xs text-adminMuted">on</span>
                      <span className="text-xs font-medium text-adminSidebar">{r.productName || "Unknown Product"}</span>
                      <div className="flex items-center gap-0.5 ml-auto">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-stone-300"}`} />
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-sm text-adminSidebar mt-2 italic leading-relaxed">“{r.comment}”</p>
                    
                    {r.createdAt && (
                      <p className="text-[10px] text-adminMuted mt-2">Posted on: {new Date(r.createdAt).toLocaleDateString()}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-adminBorder">
                      <StatusBadge status={r.active ? "Visible" : "Hidden"} />
                      <span className="ml-auto" />
                      
                      {r.active ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          disabled={statusLoadingId === r.id}
                          onClick={() => handleStatus(r.id, false)}
                          className="h-8 text-xs rounded-full border-adminBorder text-adminSidebar hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                          {statusLoadingId === r.id ? <HeartLoader size="sm" text="" /> : <><X className="h-3.5 w-3.5 mr-1" /> Hide</>}
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          disabled={statusLoadingId === r.id}
                          onClick={() => handleStatus(r.id, true)}
                          className="h-8 text-xs rounded-full border-adminBorder text-adminSidebar hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                        >
                          {statusLoadingId === r.id ? <HeartLoader size="sm" text="" /> : <><Check className="h-3.5 w-3.5 mr-1" /> Approve</>}
                        </Button>
                      )}

                      <Button 
                        size="icon" 
                        variant="ghost" 
                        disabled={deleteLoadingId === r.id}
                        onClick={() => handleDelete(r.id)}
                        className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        {deleteLoadingId === r.id ? <HeartLoader size="sm" text="" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {reviews.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between border-t border-adminBorder pt-4 mt-2 px-2">
                <span className="text-xs text-adminMuted">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, reviews.length)} of {reviews.length} reviews
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    className="h-8 text-xs rounded-full border-adminBorder text-adminSidebar hover:bg-adminBg"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage * ITEMS_PER_PAGE >= reviews.length}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="h-8 text-xs rounded-full border-adminBorder text-adminSidebar hover:bg-adminBg"
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
