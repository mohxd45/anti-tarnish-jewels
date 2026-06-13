"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useState } from "react";
import { getOptimizedImageUrl } from "@/lib/firestore";

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
    <article className="group overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] border border-goldBeige/60 bg-warmwhite shadow-sm flex flex-col justify-between h-full transition-all duration-300 sm:hover:-translate-y-1 hover:border-champagne/40">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-ivory w-full">
        <Image 
          src={imageUrl} 
          alt={product.name} 
          fill 
          sizes="(max-w-640px) 50vw, (max-w-1024px) 33vw, 25vw"
          className="object-cover transition duration-700 group-hover:scale-105" 
        />
        <div className="absolute left-2 top-2 sm:left-3 sm:top-3 flex gap-1.5 flex-wrap">
          {product.isNewArrival && <span className="rounded-full bg-dustyRose px-2.5 py-0.5 text-[9px] sm:text-xs font-semibold text-white">New</span>}
          {product.isBestSeller && <span className="rounded-full bg-champagne px-2.5 py-0.5 text-[9px] sm:text-xs font-semibold text-charcoalBrown">Best</span>}
        </div>
        {product.discountPercentage > 0 && (
          <span className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 rounded-full bg-dustyRose px-2.5 py-0.5 text-[9px] sm:text-xs text-white font-semibold tracking-wider">
            {product.discountPercentage}% OFF
          </span>
        )}
      </Link>

      <div className="p-2.5 sm:p-4 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-start justify-between gap-1">
            <Link 
              href={`/product/${product.slug}`} 
              className="font-semibold text-charcoalBrown hover:text-champagne text-xs sm:text-sm leading-snug line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] transition-colors"
            >
              {product.name}
            </Link>
            <button 
              onClick={() => wishlist.toggleWishlist(product)} 
              className="rounded-full border border-goldBeige/60 p-1.5 sm:p-2 shrink-0 hover:bg-champagne/10 transition-colors"
              aria-label="Add to Wishlist"
            >
              <Heart className={`h-3 w-3 sm:h-[17px] sm:w-[17px] ${wishlist.isWishlisted(product.id) ? "fill-dustyRose text-dustyRose" : "text-champagne"}`} />
            </button>
          </div>
          
          <div className="mt-1 flex items-center gap-1 text-[10px] sm:text-xs text-champagne">
            <Star size={11} className="fill-champagne" /> 
            <span>{product.rating || 5}</span> 
            <span className="text-stoneGray/60">({product.reviewCount || 0})</span>
          </div>
        </div>

        <div className="mt-2.5">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xs sm:text-lg font-bold text-brandGoldDeep">{formatPrice(product.salePrice)}</span>
            {hasDiscount && (
              <span className="text-[9px] sm:text-xs text-stoneGray/60 line-through">{formatPrice(product.regularPrice)}</span>
            )}
          </div>
          
          <button 
            onClick={handleAdd} 
            className="mt-2.5 w-full rounded-full bg-champagne py-1.5 sm:py-2.5 text-[10px] sm:text-xs font-semibold text-charcoalBrown hover:bg-dustyRose hover:text-white transition-all shadow-sm"
          >
            {added ? "Added ✓" : (
              <span className="flex items-center justify-center gap-1">
                <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> 
                Add to Cart
              </span>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
