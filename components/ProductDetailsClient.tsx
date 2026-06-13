"use client";

import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Heart, ShoppingBag, Star, ShieldCheck, RotateCcw, Truck, Minus, Plus, Loader } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useEffect, useState, useMemo } from "react";
import { getProductsFromCacheOnly, getProductBySlug, getSimilarProducts, getOptimizedImageUrl } from "@/lib/firestore";
import { Product } from "@/types";

export function ProductDetailsClient({ product, initialSimilar }: { product: Product, initialSimilar: Product[] }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const wishlist = useWishlist();

  // Local state
  const [similarProducts, setSimilarProducts] = useState<Product[]>(initialSimilar);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [recentlyViewedSlugs, setRecentlyViewedSlugs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"specs" | "care" | "shipping">("specs");

  useEffect(() => {
    // Load recently viewed list from cache only (avoiding Firestore hit)
    const list = getProductsFromCacheOnly();
    setProductsList(list);
  }, []);

  useEffect(() => {
    if (!product) return;
    if (typeof window === "undefined") return;

    // Save and read recently viewed slugs
    let slugs: string[] = [];
    try {
      const saved = localStorage.getItem("atj-recently-viewed");
      slugs = saved ? JSON.parse(saved) : [];
    } catch {
      slugs = [];
    }

    // Remove current product if already exists to move it to the front
    slugs = slugs.filter((s) => s !== product.slug);
    // Add current product at the front
    slugs.unshift(product.slug);
    // Cap at 8 items
    const cappedSlugs = slugs.slice(0, 8);

    try {
      localStorage.setItem("atj-recently-viewed", JSON.stringify(cappedSlugs));
    } catch {
      // Storage quota exceeded — ignore silently
    }
    
    // Set other recently viewed slugs (excluding current one)
    setRecentlyViewedSlugs(cappedSlugs.filter((s) => s !== product.slug));
  }, [product]);

  // Similar Products (filter by same category, excluding current product)
  const similar = useMemo(() => {
    return similarProducts;
  }, [similarProducts]);

  // Recently Viewed products list
  const recentlyViewed = useMemo(() => {
    return productsList.filter((p) => recentlyViewedSlugs.includes(p.slug));
  }, [recentlyViewedSlugs, productsList]);

  const decreaseQty = () => setQuantity((prev) => Math.max(1, prev - 1));
  const increaseQty = () => {
    if (!product) return;
    setQuantity((prev) => Math.min(product.stock, prev + 1));
  };

  // Loading and Not Found states are handled by Server Component now.

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:py-12 pb-40 lg:pb-12 overflow-hidden">
      {/* Hidden context for WhatsApp button */}
      <div id="whatsapp-product-context" data-product-name={product.name} className="hidden" />
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Left Column: Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="rounded-[2.5rem] border border-goldBeige/60 bg-warmwhite p-4 shadow-jewel">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-ivory">
              <Image
                src={getOptimizedImageUrl(product.images?.[activeImage] || product.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop", 850)}
                alt={product.name}
                fill
                priority
                className="object-cover"
                sizes="(max-w-7xl) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Thumbnails list */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border transition-all ${
                    idx === activeImage ? "border-champagne scale-105 shadow-jewel" : "border-goldBeige hover:border-champagne"
                  }`}
                >
                  <Image src={getOptimizedImageUrl(img, 150)} alt={`${product.name} thumbnail ${idx}`} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Content and buy actions */}
        <div>
          {/* Breadcrumb info */}
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-champagne font-semibold">
            <span>{product.category}</span>
            {product.brand && (
              <>
                <span className="h-1 w-1 rounded-full bg-champagne/50" />
                <span>{product.brand}</span>
              </>
            )}
          </div>

          <h1 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-serif font-semibold tracking-wide text-charcoalBrown leading-tight break-words">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="mt-4 flex items-center gap-2 text-champagne">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={i < Math.floor(product.rating || 5) ? "fill-champagne text-champagne" : "text-champagne/30"}
                  size={16}
                />
              ))}
            </div>
            <span className="text-sm font-semibold">{product.rating || 5}</span>
            <span className="text-xs text-stoneGray/60">({product.reviewCount || 0} reviews)</span>
          </div>

          {/* Jewellery Attributes Badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            {product.waterproof && (
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-[11px] px-3 py-1 rounded-full font-semibold border border-emerald-500/20">
                💧 Waterproof
              </span>
            )}
            {product.antiTarnish && (
              <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 text-[11px] px-3 py-1 rounded-full font-semibold border border-amber-500/20">
                ✨ Anti-Tarnish
              </span>
            )}
            {product.badges && product.badges.map(b => (
              <span key={b} className="bg-champagne/10 text-champagne text-[11px] px-3 py-1 rounded-full font-semibold border border-champagne/20">
                {b}
              </span>
            ))}
          </div>

          {/* Pricing */}
          <div className="mt-6 flex flex-wrap items-baseline gap-2 sm:gap-4">
            <span className="text-2xl sm:text-3xl font-serif font-semibold text-charcoalBrown break-all sm:break-normal">{formatPrice(product.salePrice)}</span>
            {product.salePrice < product.regularPrice && (
              <>
                <span className="text-base sm:text-lg text-stoneGray/60 line-through mb-0.5 break-all sm:break-normal">{formatPrice(product.regularPrice)}</span>
                <span className="rounded-full bg-dustyRose px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider shrink-0 mt-1 sm:mt-0">
                  {product.discountPercentage}% OFF
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="mt-6 text-sm md:text-base leading-7 text-charcoalBrown/75 font-sans">
            {product.description}
          </p>

          {/* Status highlight badges */}
          <div className="mt-6 grid gap-4 grid-cols-2 md:grid-cols-3 text-xs text-charcoalBrown/75 border-y border-goldBeige/40 py-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-champagne" size={16} />
              <span>Premium Quality Polish</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="text-champagne" size={16} />
              <span>7 Days Easy Return / Exchange</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="text-champagne" size={16} />
              <span>Free Delivery Over ₹999</span>
            </div>
          </div>

          {/* Options (Color / Material / Occasion / Size) */}
          <div className="mt-6 grid grid-cols-1 min-[320px]:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-sm border-b border-goldBeige/25 pb-6">
            {product.color && (
              <div>
                <span className="text-stoneGray block text-xs">Color:</span>
                <span className="font-semibold text-charcoalBrown">{product.color}</span>
              </div>
            )}
            {product.material && (
              <div>
                <span className="text-stoneGray block text-xs">Material:</span>
                <span className="font-semibold text-charcoalBrown">{product.material}</span>
              </div>
            )}
            {product.occasion && (
              <div>
                <span className="text-stoneGray block text-xs">Occasion:</span>
                <span className="font-semibold text-charcoalBrown">{product.occasion}</span>
              </div>
            )}
            {product.size && (
              <div>
                <span className="text-stoneGray block text-xs">Size:</span>
                <span className="font-semibold text-charcoalBrown">{product.size}</span>
              </div>
            )}
            <div>
              <span className="text-stoneGray block text-xs">Availability:</span>
              <span className={`font-semibold ${product.stock > 0 ? "text-emerald-600" : "text-dustyRose"}`}>
                {product.stock > 0 ? `In Stock (${product.stock} left)` : "Out of Stock"}
              </span>
            </div>
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <span className="text-sm text-stoneGray font-medium">Quantity:</span>
              <div className="flex items-center border border-goldBeige bg-warmwhite rounded-full overflow-hidden shrink-0">
                <button
                  onClick={decreaseQty}
                  className="px-3 sm:px-4 py-2 hover:bg-champagne/10 text-champagne transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="px-2 sm:px-4 text-charcoalBrown text-sm font-semibold min-w-[2rem] text-center">{quantity}</span>
                <button
                  onClick={increaseQty}
                  className="px-3 sm:px-4 py-2 hover:bg-champagne/10 text-champagne transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => {
                addToCart(product, quantity);
                alert("Product added to cart!");
              }}
              disabled={product.stock === 0}
              className="rounded-full bg-champagne px-8 py-4 font-semibold text-charcoalBrown hover:bg-champagne/90 hover:shadow-champagne/10 transition-all flex items-center gap-2.5 shadow-jewel disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag size={18} />
              Add to Cart
            </button>

            <button
              onClick={() => {
                wishlist.toggleWishlist(product);
              }}
              className="rounded-full border border-goldBeige px-8 py-4 font-semibold text-champagne hover:bg-champagne/10 transition-all flex items-center gap-2.5"
            >
              <Heart size={18} className={wishlist.isWishlisted(product.id) ? "fill-champagne text-champagne" : ""} />
              Wishlist
            </button>

            <Link
              href="/checkout"
              onClick={() => {
                if (product.stock > 0) addToCart(product, quantity);
              }}
              className={`rounded-full border border-dustyRose bg-dustyRose/10 px-8 py-4 font-semibold text-dustyRose hover:bg-dustyRose hover:text-white text-center flex items-center justify-center transition-all ${
                product.stock === 0 ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Buy Now
            </Link>
          </div>

          {/* Specification Tabs */}
          <div className="mt-10 rounded-[1.5rem] border border-goldBeige/60 bg-warmwhite p-5 shadow-sm text-sm">
            <div className="flex border-b border-goldBeige/30 pb-3 gap-6 font-medium text-xs uppercase tracking-wider">
              <button
                onClick={() => setActiveTab("specs")}
                className={`pb-1 transition-all ${
                  activeTab === "specs" ? "text-champagne border-b-2 border-champagne" : "text-stoneGray hover:text-charcoalBrown"
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab("care")}
                className={`pb-1 transition-all ${
                  activeTab === "care" ? "text-champagne border-b-2 border-champagne" : "text-stoneGray hover:text-charcoalBrown"
                }`}
              >
                Jewellery Care
              </button>
              <button
                onClick={() => setActiveTab("shipping")}
                className={`pb-1 transition-all ${
                  activeTab === "shipping" ? "text-champagne border-b-2 border-champagne" : "text-stoneGray hover:text-charcoalBrown"
                }`}
              >
                Shipping & Returns
              </button>
            </div>

            <div className="mt-4 text-charcoalBrown/75 leading-relaxed font-sans">
              {activeTab === "specs" && (
                <div className="grid gap-3">
                  {product.specifications && typeof product.specifications === "object" ? (
                    Array.isArray(product.specifications) ? (
                      <ul className="list-disc list-inside space-y-1.5">
                        {product.specifications.map((spec, idx) => (
                          <li key={idx}>{String(spec || "")}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="grid gap-2">
                        {Object.entries(product.specifications).map(([key, val]) => (
                          <div key={key} className="grid grid-cols-1 sm:grid-cols-[150px_1fr] border-b border-goldBeige/20 pb-2 text-xs md:text-sm gap-1 sm:gap-4">
                            <span className="font-semibold text-champagne/80">{key}</span>
                            <span className="text-charcoalBrown/90">{String(val || "")}</span>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="grid gap-2">
                      <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] border-b border-goldBeige/20 pb-2 text-xs md:text-sm gap-1 sm:gap-4">
                        <span className="font-semibold text-champagne/80">Material</span>
                        <span className="text-charcoalBrown/90">{product.material || "Premium Alloy"}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] border-b border-goldBeige/20 pb-2 text-xs md:text-sm gap-1 sm:gap-4">
                        <span className="font-semibold text-champagne/80">Color</span>
                        <span className="text-charcoalBrown/90">{product.color || "Gold / Silver / Rose Gold"}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] border-b border-goldBeige/20 pb-2 text-xs md:text-sm gap-1 sm:gap-4">
                        <span className="font-semibold text-champagne/80">Occasion</span>
                        <span className="text-charcoalBrown/90">{product.occasion || "Daily / Office / Festive Wear"}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "care" && (
                <div className="space-y-3 text-xs md:text-sm">
                  <p className="text-charcoalBrown/90 leading-relaxed">
                    {product.careInstructions || (
                      "To keep your anti-tarnish jewellery shining bright: Wipe gently with a soft cloth after each wear. Avoid direct contact with harsh perfumes, sanitizers, or chemicals. Store in an airtight pouch or box when not in use. While waterproof, rinse with fresh water and dry thoroughly if exposed to chlorine or saltwater."
                    )}
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 mt-3 text-stoneGray/80 text-[11px] md:text-xs">
                    <li>Gently wipe with dry microfiber cloth after wearing.</li>
                    <li>Avoid direct exposure to alcohol sprays, perfumes, and body mist.</li>
                    <li>Store separately inside airtight packets or cases to avoid scratches.</li>
                  </ul>
                </div>
              )}

              {activeTab === "shipping" && (
                <div className="space-y-3 text-xs md:text-sm">
                  <p>
                    <strong className="text-champagne">Standard Delivery:</strong> Dispatched within 24-48 hours. Delivered in 3-6 business days depending on location. Free shipping applies to cart totals above ₹999.
                  </p>
                  <p>
                    <strong className="text-champagne">Return & Exchange:</strong> We offer a hassle-free 7-day return and exchange policy for unused items in original jewellery packaging.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      <div className="mt-20">
        <h2 className="mb-6 text-2xl md:text-3xl font-serif font-semibold tracking-wide text-charcoalBrown">Similar Products</h2>
        <div className="grid grid-cols-1 min-[320px]:grid-cols-2 min-[540px]:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
          {similar.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 0 && (
        <div className="mt-20 border-t border-goldBeige/40 pt-16 mb-8">
          <h2 className="mb-6 text-2xl md:text-3xl font-serif font-semibold tracking-wide text-charcoalBrown">Recently Viewed</h2>
          <div className="grid grid-cols-1 min-[320px]:grid-cols-2 min-[540px]:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
            {recentlyViewed.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Customer Reviews Section */}
      <div className="mt-20 border-t border-goldBeige/40 pt-16">
        <h2 className="mb-6 text-2xl md:text-3xl font-serif font-semibold tracking-wide text-charcoalBrown">Customer Reviews</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { name: "Sanya P.", rating: 5, date: "3 days ago", comment: "Absolutely lovely! The finish is extremely premium, and it hasn't tarnished at all even after wearing it to work every day." },
            { name: "Rahul D.", rating: 5, date: "1 week ago", comment: "Bought this as a gift and she loved it. The packaging was luxury grade and delivery was fast!" },
            { name: "Meera K.", rating: 4.8, date: "2 weeks ago", comment: "Beautiful minimal design. It is very comfortable to wear for long hours. Will buy again!" }
          ].map((rev, idx) => (
            <div key={idx} className="rounded-3xl border border-goldBeige/60 bg-warmwhite p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-charcoalBrown">{rev.name}</span>
                <span className="text-[10px] text-stoneGray/60">{rev.date}</span>
              </div>
              <div className="flex text-champagne text-xs gap-0.5 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className={i < Math.floor(rev.rating) ? "fill-champagne" : "text-champagne/30"} />
                ))}
              </div>
              <p className="mt-3 text-xs text-charcoalBrown/75 leading-relaxed italic">“{rev.comment}”</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Sticky Actions Bar */}
      {product.stock > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-goldBeige bg-ivory/95 px-3 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] backdrop-blur-xl flex flex-wrap items-center justify-between gap-2 lg:hidden shadow-[0_-8px_30px_rgba(47,42,38,0.06)]">
          <div className="flex flex-col min-w-[30%] max-w-[45%] pr-1">
            <span className="text-[9px] uppercase tracking-wider text-stoneGray truncate block">{product.name}</span>
            <span className="text-sm sm:text-base font-serif font-bold text-charcoalBrown truncate block">{formatPrice(product.salePrice)}</span>
          </div>
          <div className="flex gap-1.5 sm:gap-2 shrink-0 flex-1 justify-end">
            <button
              onClick={() => {
                addToCart(product, quantity);
                alert("Product added to cart!");
              }}
              className="rounded-full bg-champagne px-2.5 min-[360px]:px-3.5 py-2 text-xs font-semibold text-charcoalBrown hover:bg-champagne/90 flex items-center gap-1 sm:gap-1.5 shadow-sm"
            >
              <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
              <span>Add</span>
            </button>
            <Link
              href="/checkout"
              onClick={() => {
                addToCart(product, quantity);
              }}
              className="rounded-full bg-dustyRose px-3 min-[360px]:px-4 py-2 text-xs font-semibold text-white hover:bg-dustyRose/90 text-center whitespace-nowrap"
            >
              Buy Now
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
