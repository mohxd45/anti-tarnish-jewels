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

  const images = p.images && p.images.length > 0 ? p.images : ["/placeholder.png"];
  const isWishlisted = wishlist.some(item => item.id === p.id);

  const handleAddToCart = () => {
    addToCart(p, qty);
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
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Gallery */}
          <div>
            <div className="bg-white/95 backdrop-blur-sm shadow-sm border border-stone-200 mb-4 overflow-hidden rounded-3xl">
              <img
                src={images[activeImg]}
                alt={p.name}
                className="h-96 w-full object-cover md:h-[500px]"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((src: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`aspect-square overflow-hidden rounded-xl transition ${i === activeImg ? "opacity-100 ring-2 ring-[color:var(--color-gold)]" : "opacity-60 hover:opacity-100"}`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              {p.tags?.[0] && <span className="rounded-full bg-pink-900 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">{p.tags[0]}</span>}
              {p.isBestSeller && <span className="clay-badge px-3 py-1 text-[10px] font-bold uppercase tracking-wide">Bestseller</span>}
              {isSale && <span className="rounded-full bg-stone-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Sale</span>}
              <span className="anti-tarnish-badge">Anti-Tarnish</span>
            </div>
            <p className="mb-2 text-xs uppercase tracking-widest text-stoneGray">{(p.categorySlug || p.category || "").replace("-", " ")}</p>
            <h1 className="mb-4 font-serif text-3xl text-charcoalBrown md:text-4xl">{p.name}</h1>
            
            <div className="mb-6 flex items-baseline gap-3">
              {isSale ? (
                <>
                  <span className="text-3xl font-bold text-charcoalBrown">₹{p.salePrice}</span>
                  <span className="text-lg text-stoneGray line-through">₹{p.regularPrice}</span>
                  <span className="rounded-full bg-stone-50/50 px-2 py-0.5 text-xs font-semibold text-stoneGray">
                    {Math.round(((p.regularPrice! - p.salePrice) / p.regularPrice!) * 100)}% off
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-charcoalBrown">₹{p.salePrice}</span>
              )}
            </div>
            
            <p className="mb-6 text-sm leading-relaxed text-stoneGray">
              {p.description || "Discover waterproof, sweatproof, and life-proof luxury pieces designed for your everyday elegance."}
            </p>

            <div className="mb-6 flex items-center gap-4">
              <div className="glass flex items-center gap-1 rounded-xl p-1">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-9 w-9 items-center justify-center rounded-lg text-charcoalBrown hover:bg-stone-50/50" aria-label="Decrease">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-semibold text-charcoalBrown">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(p.stock || 10, q + 1))} className="flex h-9 w-9 items-center justify-center rounded-lg text-charcoalBrown hover:bg-stone-50/50" aria-label="Increase">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-xs text-stoneGray">{p.stock || "In"} stock</span>
            </div>

            <div className="mb-8 flex flex-col gap-3 sm:flex-row">
              <button 
                onClick={handleAddToCart}
                className="btn-primary-gold w-full flex-1 py-4 text-sm sm:text-base"
              >
                <ShoppingBag className="h-5 w-5" />
                <span className="whitespace-nowrap">Add to Cart</span>
              </button>
              <button 
                onClick={toggleWishlist}
                className={`btn-liquid w-full sm:w-auto sm:px-5 ${isWishlisted ? "text-red-500" : ""}`}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
                <span>Wishlist</span>
              </button>
            </div>

            <div className="glass rounded-2xl p-5">
              <h4 className="mb-3 font-serif text-lg text-charcoalBrown">Care instructions</h4>
              <ul className="space-y-1 text-sm text-stoneGray">
                <li>• Wipe with a soft dry cloth after use.</li>
                <li>• Avoid direct contact with perfume or lotion.</li>
                <li>• Store in the provided pouch to preserve shine.</li>
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
          <div className="mt-16 pb-8">
            <h2 className="mb-6 font-serif text-2xl text-charcoalBrown md:text-3xl">You may also like</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {initialSimilar.map((prod) => <ProductCard key={prod.id} product={prod} />)}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        {recentlyViewed && recentlyViewed.length > 0 && (
          <div className="mt-8 pb-16 border-t border-stone-200 pt-12">
            <h2 className="mb-6 font-serif text-2xl text-charcoalBrown md:text-3xl">Recently Viewed</h2>
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
    <div className="trust-badge !p-3">
      <div className="mb-1 flex justify-center text-stoneGray">{icon}</div>
      <p className="text-xs font-semibold text-charcoalBrown">{label}</p>
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
    <div className="mt-10">
      <h3 className="mb-4 font-serif text-xl text-charcoalBrown">Frequently Asked Questions</h3>
      <div className="divide-y divide-stone-200 border-t border-b border-stone-200">
        {faqs.map((faq, i) => (
          <div key={i} className="py-4">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between text-left focus:outline-none"
            >
              <span className="font-medium text-charcoalBrown text-sm">{faq.question}</span>
              <span className="ml-4 text-stoneGray">
                {openIndex === i ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? "max-h-96 mt-4 opacity-100" : "max-h-0 opacity-0"}`}>
              <p className="text-sm text-stoneGray leading-relaxed">{faq.answer}</p>
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
    <div className="mt-16 pb-8 border-t border-stone-200 pt-16">
      <h2 className="mb-8 font-serif text-2xl text-charcoalBrown md:text-3xl">Customer Reviews</h2>
      
      {loading ? (
        <div className="animate-pulse h-24 bg-stone-100 rounded-2xl w-full" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-stone-50 rounded-2xl p-6 text-center border border-stone-100">
              <div className="text-4xl font-serif text-charcoalBrown mb-2">{averageRating}</div>
              <div className="flex justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`h-4 w-4 ${star <= Number(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-stone-300'}`} />
                ))}
              </div>
              <div className="text-sm text-stoneGray mb-6">Based on {reviews.length} reviews</div>
              
              {user ? (
                <button 
                  onClick={() => setShowForm(!showForm)} 
                  className="btn-liquid w-full text-sm py-2.5"
                >
                  Write a Review
                </button>
              ) : (
                <p className="text-xs text-stoneGray">Log in to write a review</p>
              )}
            </div>
            
            {showForm && (
              <form onSubmit={handleSubmit} className="mt-4 bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
                <h4 className="font-medium text-charcoalBrown mb-3 text-sm">Write your review</h4>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button type="button" key={star} onClick={() => setRating(star)}>
                      <Star className={`h-5 w-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-stone-300'}`} />
                    </button>
                  ))}
                </div>
                <textarea 
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full text-sm border border-stone-200 rounded-xl p-3 focus:ring-1 focus:ring-champagne focus:border-champagne outline-none min-h-[100px] mb-3"
                />
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="btn-primary-gold w-full text-sm py-2 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}
          </div>
          
          <div className="md:col-span-2 space-y-6">
            {reviews.length === 0 ? (
              <div className="text-center py-12 text-stoneGray border border-dashed border-stone-200 rounded-2xl">
                No reviews yet. Be the first to share your thoughts!
              </div>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="border-b border-stone-100 pb-6 last:border-0">
                  <div className="flex items-center gap-3 mb-2">
                    <UserCircle className="h-8 w-8 text-stone-300" />
                    <div>
                      <div className="font-medium text-sm text-charcoalBrown">{review.customerName}</div>
                      <div className="text-xs text-stoneGray">
                        {new Date(review.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`h-3 w-3 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-stone-300'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-stoneGray leading-relaxed">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
