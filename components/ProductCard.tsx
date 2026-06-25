"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star, Check, Sparkles, Droplets, Shield } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useState } from "react";
import { getOptimizedImageUrl } from "@/lib/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { TiltCard } from "./ui/TiltCard";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const wishlist = useWishlist();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  const hasDiscount = product.salePrice < product.regularPrice;
  const imageUrl = getOptimizedImageUrl(product.thumbnail || product.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop", 400);

  return (
    <TiltCard className="group relative" max={10}>
      <div className="shine relative overflow-hidden rounded-3xl glass p-3 transition-shadow hover:shadow-[var(--shadow-glow)]">
        <Link href={`/product/${product.slug}`} className="block">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <Image 
              src={imageUrl} 
              alt={product.name} 
              fill 
              sizes="(max-w-640px) 50vw, (max-w-1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110" 
              style={{ transform: "translateZ(40px)" }}
            />
            {/* badges top-left */}
            <div className="absolute left-3 top-3 flex flex-col gap-1.5">
              {product.isBestSeller && <span className="rounded-full bg-ink/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur">Bestseller</span>}
              {product.isNewArrival && !product.isBestSeller && <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-ink backdrop-blur">New</span>}
              {product.discountPercentage > 0 && <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white" style={{ background: "var(--gradient-gold)" }}>{product.discountPercentage}% OFF</span>}
            </div>
            
            {/* wishlist top-right */}
            <button
              aria-label="Wishlist"
              onClick={(e) => { e.preventDefault(); wishlist.toggleWishlist(product); }}
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full glass text-ink/70 transition hover:text-[var(--rose-gold)] z-20"
            >
              <Heart className={`h-4 w-4 ${wishlist.isWishlisted(product.id) ? "fill-[var(--rose-gold)] text-[var(--rose-gold)]" : ""}`} />
            </button>
            
            {/* trust badges bottom */}
            <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-1.5 z-10">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 text-[10px] text-ink/75 backdrop-blur">
                <Shield className="h-3 w-3 text-[var(--rose-gold)]" /> Anti-tarnish
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 text-[10px] text-ink/75 backdrop-blur">
                <Droplets className="h-3 w-3 text-[var(--rose-gold)]" /> Waterproof
              </span>
            </div>
          </div>
        </Link>

        <div className="flex items-end justify-between gap-3 px-2 pb-1 pt-4">
          <div className="min-w-0">
            <Link href={`/product/${product.slug}`} className="block truncate font-display text-lg text-ink hover:text-[var(--rose-gold)]">
              {product.name}
            </Link>
            <p className="text-sm text-ink/60 mt-1">
              {formatPrice(product.salePrice)}
              {hasDiscount && <span className="ml-2 text-xs text-ink/40 line-through">{formatPrice(product.regularPrice)}</span>}
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="shrink-0 overflow-hidden rounded-full px-4 py-2 text-xs font-medium text-white transition-transform hover:-translate-y-0.5 z-20"
            style={{ background: "var(--gradient-gold)" }}
          >
            <span className="inline-flex items-center gap-1.5">
              {added ? (<><Sparkles className="h-3.5 w-3.5" /> Added</>) : (<><ShoppingBag className="h-3.5 w-3.5" /> Add</>)}
            </span>
          </button>
        </div>
      </div>
    </TiltCard>
  );
}
