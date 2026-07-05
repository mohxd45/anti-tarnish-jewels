"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { ProductCard } from "@/components/ProductCard";
import { Heart, Minus, Plus, ShoppingBag, ShieldCheck, Truck, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function ProductDetailsClient({ product: p, initialSimilar }: { product: Product, initialSimilar: Product[] }) {
  const { addToCart } = useCart();
  const { addToWishlist: addWishlist, removeFromWishlist: removeWishlist, items: wishlist } = useWishlist();

  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

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
            <div className="glass bg-white/80 shadow-sm border border-goldBeige mb-4 overflow-hidden rounded-3xl">
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
              {isSale && <span className="rounded-full bg-beige0 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Sale</span>}
              <span className="anti-tarnish-badge">Anti-Tarnish</span>
            </div>
            <p className="mb-2 text-xs uppercase tracking-widest text-stoneGray">{(p.categorySlug || p.category || "").replace("-", " ")}</p>
            <h1 className="mb-4 font-serif text-3xl text-charcoalBrown md:text-4xl">{p.name}</h1>
            
            <div className="mb-6 flex items-baseline gap-3">
              {isSale ? (
                <>
                  <span className="text-3xl font-bold text-charcoalBrown">₹{p.salePrice}</span>
                  <span className="text-lg text-stoneGray line-through">₹{p.regularPrice}</span>
                  <span className="rounded-full bg-beige/50 px-2 py-0.5 text-xs font-semibold text-stoneGray">
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
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-9 w-9 items-center justify-center rounded-lg text-charcoalBrown hover:bg-beige/50" aria-label="Decrease">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-semibold text-charcoalBrown">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(p.stock || 10, q + 1))} className="flex h-9 w-9 items-center justify-center rounded-lg text-charcoalBrown hover:bg-beige/50" aria-label="Increase">
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
          </div>
        </div>

        {/* Related */}
        {initialSimilar && initialSimilar.length > 0 && (
          <div className="mt-16 pb-16">
            <h2 className="mb-6 font-serif text-2xl text-charcoalBrown md:text-3xl">You may also like</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {initialSimilar.map((prod) => <ProductCard key={prod.id} product={prod} />)}
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
