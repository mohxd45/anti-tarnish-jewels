"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Product, Review } from "@/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { getProductReviews, submitProductReview } from "@/lib/firestore";
import { ProductCard } from "@/components/ProductCard";
import { Heart, Minus, Plus, ShoppingBag, ShieldCheck, Truck, RotateCcw, Sparkles, Star, UserCircle } from "lucide-react";
import { toast } from "sonner";

export function ProductDetailsClient({ product: p, initialSimilar }: { product: Product, initialSimilar: Product[] }) {
  const { addToCart } = useCart();
  const { addToWishlist: addWishlist, removeFromWishlist: removeWishlist, items: wishlist } = useWishlist();

  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("atj_recently_viewed");
      let recent: Product[] = stored ? JSON.parse(stored) : [];
      
      // Show recently viewed (excluding current product)
      setRecentlyViewed(recent.filter(item => item.id !== p.id));

      // Add current product to top of history and save
      const updated = [p, ...recent.filter(item => item.id !== p.id)].slice(0, 8);
      localStorage.setItem("atj_recently_viewed", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save recently viewed", e);
    }
  }, [p]);

  const images = p.images && p.images.length > 0 ? p.images : ["/product-stack.jpg"];
  const isWishlisted = wishlist.some(item => item.id === p.id);

  const handleAddToCart = () => {
    if (p.selectedColorRequired && !selectedColor) {
      toast.error("Please select a color");
      return;
    }
    if (p.selectedSizeRequired && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    addToCart(p, qty, selectedSize, selectedColor);
    toast.success("Added to cart!");
  };

  const toggleWishlist = () => {
    if (isWishlisted) {
      removeWishlist(p.id);
      toast.success("Removed from wishlist");
    } else {
      addWishlist(p);
      toast.success("Added to wishlist!");
    }
  };

  const isSale = p.regularPrice && p.regularPrice > p.salePrice;

  return (
    <>
      <div className="mx-auto max-w-6xl xl:max-w-[1140px] px-4 pt-6 md:pt-10">
        <div className="grid grid-cols-1 gap-6 md:gap-10 lg:grid-cols-2">
          {/* Gallery */}
          <div className="flex flex-col gap-3">
            <div className="bg-[#FFF9FB] border border-[#E8D7C8]/50 shadow-sm overflow-hidden rounded-[24px] flex items-center justify-center relative aspect-square sm:aspect-[4/5] md:aspect-auto md:h-[480px]">
              <img
                src={images[activeImg] || "/product-stack.jpg"}
                onError={(e) => { e.currentTarget.src = "/product-stack.jpg"; }}
                alt={p.name}
                className="w-full h-full object-contain mix-blend-multiply p-4"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style>{`
                  .scrollbar-hide::-webkit-scrollbar {
                      display: none;
                  }
                `}</style>
                {images.map((src: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`h-16 w-16 md:h-20 md:w-20 shrink-0 overflow-hidden rounded-2xl bg-[#FFF9FB] transition-all ${i === activeImg ? "ring-2 ring-offset-2 ring-[#B8955E] border-transparent" : "border border-[#E8D7C8] opacity-70 hover:opacity-100"}`}
                  >
                    <img src={src || "/product-stack.jpg"} onError={(e) => { e.currentTarget.src = "/product-stack.jpg"; }} alt="" className="h-full w-full object-cover mix-blend-multiply p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              {p.tags?.[0] && <span className="rounded-full bg-[#3A2428] border border-[#3A2428] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white shadow-sm">{p.tags[0]}</span>}
              {p.isBestSeller && <span className="rounded-full bg-[#FFF9FB] border border-[#B8955E] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#B8955E] shadow-sm">Bestseller</span>}
              {isSale && <span className="rounded-full bg-[#B8955E] border border-[#B8955E] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white shadow-sm">Sale</span>}
              <span className="rounded-full bg-[#FFF9FB] border border-[#E8D7C8] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#8F817B] shadow-sm">Anti-Tarnish</span>
            </div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#B8955E]">{(p.categorySlug || p.category || "").replace("-", " ")}</p>
              {p.sku && (
                <>
                  <span className="text-[#E8D7C8]">•</span>
                  <p className="text-[10px] font-mono tracking-wider text-[#8F817B]">Item Code: {p.sku}</p>
                </>
              )}
            </div>
            <h1 className="mb-4 font-serif text-[28px] leading-tight text-[#3A2428] md:text-[34px]">{p.name}</h1>
            
            <div className="mb-6 flex items-end gap-3">
              <span className="text-3xl font-serif font-medium text-[#3A2428] md:text-4xl">₹{p.salePrice}</span>
              {isSale && (
                <>
                  <span className="text-base font-medium text-[#8F817B] line-through mb-1">₹{p.regularPrice}</span>
                  <span className="mb-1.5 rounded-md bg-[#B8955E]/10 border border-[#B8955E]/20 px-2 py-0.5 text-[10px] font-bold tracking-widest text-[#B8955E]">
                    {Math.round(((p.regularPrice! - p.salePrice) / p.regularPrice!) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
            
            <p className="mb-6 text-sm leading-relaxed text-[#3A2428]/80">
              {p.description || "Discover waterproof, sweatproof, and life-proof luxury pieces designed for your everyday elegance."}
            </p>

            {p.colorOptions && p.colorOptions.length > 0 && (
              <div className="mb-6">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#8F817B]">
                  Color {p.selectedColorRequired && <span className="text-red-500">*</span>}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {p.colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`min-w-[3.5rem] rounded-full px-4 py-2 text-[11px] font-bold tracking-wide transition-all border shadow-sm ${
                        selectedColor === color
                          ? "bg-gradient-to-r from-[#B8955E] to-[#E3C9A3] text-white border-transparent"
                          : "bg-[#FFF9FB] text-[#3A2428] border-[#E8D7C8] hover:border-[#B8955E]"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {p.sizeOptions && p.sizeOptions.length > 0 && (
              <div className="mb-6">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#8F817B]">
                  Size {p.selectedSizeRequired && <span className="text-red-500">*</span>}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {p.sizeOptions.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3.5rem] rounded-full px-4 py-2 text-[11px] font-bold tracking-wide transition-all border shadow-sm ${
                        selectedSize === size
                          ? "bg-gradient-to-r from-[#B8955E] to-[#E3C9A3] text-white border-transparent"
                          : "bg-[#FFF9FB] text-[#3A2428] border-[#E8D7C8] hover:border-[#B8955E]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6 flex items-center gap-4">
              <div className="flex items-center gap-1 rounded-2xl p-1 bg-[#FFF9FB] border border-[#E8D7C8] shadow-sm">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-10 w-10 items-center justify-center rounded-xl text-[#3A2428] hover:bg-[#FFF0F5]" aria-label="Decrease">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-[13px] font-bold text-[#3A2428]">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(p.stock || 10, q + 1))} className="flex h-10 w-10 items-center justify-center rounded-xl text-[#3A2428] hover:bg-[#FFF0F5]" aria-label="Increase">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#8F817B]">{p.stock || "In"} stock</span>
            </div>

            <div className="mb-10 flex flex-col gap-3 sm:flex-row pb-4">
              <button 
                onClick={handleAddToCart}
                className="w-full flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#B8955E] to-[#E3C9A3] px-6 py-4 text-[13px] font-bold tracking-wide uppercase text-white shadow-md shadow-[#B8955E]/20 transition-all hover:opacity-90 active:scale-[0.98]"
              >
                <ShoppingBag className="h-5 w-5" />
                <span>Add to Cart</span>
              </button>
              <button 
                onClick={toggleWishlist}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-[#E8D7C8] bg-[#FFF9FB] px-6 py-4 text-[13px] font-bold tracking-wide uppercase shadow-sm transition-all hover:border-[#B8955E] active:scale-[0.98] ${isWishlisted ? "text-red-500 border-red-200" : "text-[#3A2428]"}`}
                aria-label="Wishlist"
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
              </button>
            </div>

            <div className="rounded-2xl bg-[#FFF9FB] border border-[#E8D7C8]/60 p-5 shadow-sm">
              <h4 className="mb-3 font-serif text-lg text-[#3A2428]">Care instructions</h4>
              <ul className="space-y-1.5 text-sm text-[#3A2428]/80">
                <li className="flex gap-2"><Sparkles className="h-4 w-4 shrink-0 text-[#B8955E] mt-0.5" /> Wipe with a soft dry cloth after use.</li>
                <li className="flex gap-2"><Sparkles className="h-4 w-4 shrink-0 text-[#B8955E] mt-0.5" /> Avoid direct contact with perfume or lotion.</li>
                <li className="flex gap-2"><Sparkles className="h-4 w-4 shrink-0 text-[#B8955E] mt-0.5" /> Store in the provided pouch to preserve shine.</li>
              </ul>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <MiniTrust icon={<ShieldCheck className="h-5 w-5" />} label="Anti-Tarnish" />
              <MiniTrust icon={<Truck className="h-5 w-5" />} label="Free ₹999+" />
              <MiniTrust icon={<RotateCcw className="h-5 w-5" />} label="7-Day Returns" />
              <MiniTrust icon={<Sparkles className="h-5 w-5" />} label="Hypoallergenic" />
            </div>
            
            <FAQAccordion product={p} />
          </div>
        </div>

        <ProductReviews productId={p.id} />

        {/* Related */}
        {initialSimilar && initialSimilar.length > 0 && (
          <div className="mt-12 md:mt-16 pb-4 md:pb-8">
            <h2 className="mb-6 md:mb-8 font-serif text-[26px] md:text-3xl text-[#3A2428]">You may also like</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {initialSimilar.map((prod) => <ProductCard key={prod.id} product={prod} />)}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        {recentlyViewed && recentlyViewed.length > 0 && (
          <div className="mt-8 md:mt-12 pb-16 border-t border-[#E8D7C8]/50 pt-10 md:pt-16">
            <h2 className="mb-6 md:mb-8 font-serif text-[26px] md:text-3xl text-[#3A2428]">Recently Viewed</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {recentlyViewed.map((prod) => <ProductCard key={prod.id} product={prod} />)}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function MiniTrust({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-[#FFF9FB] border border-[#E8D7C8]/60 p-4 shadow-sm text-center">
      <div className="mb-2 flex justify-center text-[#B8955E]">{icon}</div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#3A2428]">{label}</p>
    </div>
  );
}

function FAQAccordion({ product }: { product: Product }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = product.faqs && product.faqs.length > 0 ? product.faqs : [
    { question: "Is it anti-tarnish?", answer: "Yes, our jewelry is crafted with high-quality anti-tarnish coating to ensure long-lasting shine." },
    { question: "Is it suitable for daily wear?", answer: "Absolutely. Our pieces are sweatproof and waterproof, perfect for everyday elegance." },
    { question: "How long is delivery?", answer: "Standard delivery takes 3-5 business days across India." },
    { question: "Is COD available?", answer: "Yes, Cash on Delivery is available on orders up to ₹3000." },
    { question: "What is the return/exchange policy?", answer: "We offer a 7-day hassle-free return and exchange policy. Items must be unused and in original packaging." },
    { question: "How should I care for the jewelry?", answer: "Wipe with a soft dry cloth after use. Avoid direct contact with perfume or harsh chemicals, and store in the provided pouch." }
  ];

  return (
    <div className="mt-8 rounded-2xl bg-[#FFF9FB] border border-[#E8D7C8]/60 p-5 shadow-sm">
      <h3 className="mb-4 font-serif text-xl text-[#3A2428]">Frequently Asked Questions</h3>
      <div className="divide-y divide-[#E8D7C8]/60">
        {faqs.map((faq, i) => (
          <div key={i} className="py-3.5">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between text-left focus:outline-none"
            >
              <span className="font-medium text-[#3A2428] text-sm">{faq.question}</span>
              <span className="ml-4 text-[#B8955E]">
                {openIndex === i ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? "max-h-96 mt-3 opacity-100" : "max-h-0 opacity-0"}`}>
              <p className="text-sm text-[#3A2428]/80 leading-relaxed pr-6">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchReviews() {
      const data = await getProductReviews(productId);
      setReviews(data);
      setLoading(false);
    }
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      await submitProductReview({
        productId,
        userId: user.uid,
        customerName: user.displayName || user.email?.split("@")[0] || "Anonymous",
        rating,
        comment,
        status: "pending"
      });
      toast.success("Review submitted for approval!");
      setShowForm(false);
      setRating(5);
      setComment("");
    } catch (e) {
      toast.error("Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  return (
    <div className="mt-16 pb-8 border-t border-[#E8D7C8]/50 pt-12 md:pt-16">
      <h2 className="mb-6 md:mb-8 font-serif text-[26px] md:text-3xl text-[#3A2428]">Customer Reviews</h2>
      
      {loading ? (
        <div className="animate-pulse h-24 bg-[#FFF9FB] border border-[#E8D7C8]/50 rounded-2xl w-full" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="md:col-span-1">
            <div className="bg-[#FFF9FB] rounded-2xl p-6 text-center border border-[#E8D7C8] shadow-sm">
              <div className="text-4xl font-serif text-[#3A2428] mb-2">{averageRating}</div>
              <div className="flex justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`h-4 w-4 ${star <= Number(averageRating) ? 'fill-[#B8955E] text-[#B8955E]' : 'text-[#E8D7C8]'}`} />
                ))}
              </div>
              <div className="text-sm text-[#8F817B] mb-6">Based on {reviews.length} reviews</div>
              
              {user ? (
                <button 
                  onClick={() => setShowForm(!showForm)} 
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#E8D7C8] bg-white px-5 py-2.5 text-sm font-semibold text-[#3A2428] transition-all hover:border-[#B8955E] active:scale-[0.98]"
                >
                  Write a Review
                </button>
              ) : (
                <p className="text-xs text-[#8F817B]">Log in to write a review</p>
              )}
            </div>
            
            {showForm && (
              <form onSubmit={handleSubmit} className="mt-4 bg-[#FFF9FB] border border-[#E8D7C8] rounded-2xl p-5 shadow-sm">
                <h4 className="font-medium text-[#3A2428] mb-3 text-sm">Write your review</h4>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button type="button" key={star} onClick={() => setRating(star)}>
                      <Star className={`h-5 w-5 ${star <= rating ? 'fill-[#B8955E] text-[#B8955E]' : 'text-[#E8D7C8]'}`} />
                    </button>
                  ))}
                </div>
                <textarea 
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full text-sm border border-[#E8D7C8] rounded-xl p-3 focus:ring-1 focus:ring-[#B8955E] focus:border-[#B8955E] bg-white outline-none min-h-[100px] mb-4 text-[#3A2428] placeholder:text-[#8F817B]/60"
                />
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full rounded-xl bg-gradient-to-r from-[#B8955E] to-[#E3C9A3] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}
          </div>
          
          <div className="md:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-12 text-[#8F817B] border border-dashed border-[#E8D7C8] rounded-[24px] bg-[#FFF9FB]/50">
                No reviews yet. Be the first to share your thoughts!
              </div>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="bg-[#FFF9FB] border border-[#E8D7C8]/50 rounded-[24px] p-6 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-10 w-10 rounded-full bg-[#E8D7C8]/40 flex items-center justify-center text-[#B8955E]">
                      <UserCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#3A2428]">{review.customerName}</div>
                      <div className="text-[11px] text-[#8F817B] tracking-wide mt-0.5">
                        {new Date(review.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`h-4 w-4 ${star <= review.rating ? 'fill-[#B8955E] text-[#B8955E]' : 'text-[#E8D7C8]'}`} />
                    ))}
                  </div>
                  <p className="text-[13px] text-[#3A2428]/90 leading-relaxed">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
