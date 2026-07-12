"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { addToWishlist: addWishlist, removeFromWishlist: removeWishlist, items: wishlist } = useWishlist();
  
  const isWishlisted = wishlist.some(item => item.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    addToCart(product, 1);
    toast.success("Added to cart!");
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); 
    if (isWishlisted) {
      removeWishlist(product.id);
      toast.success("Removed from wishlist");
    } else {
      addWishlist(product);
      toast.success("Added to wishlist!");
    }
  };

  const isSale = product.regularPrice && product.regularPrice > product.salePrice;
  
  const badge =
    isSale ? { label: "Sale", cls: "bg-[#FFF0F5] text-[#B8955E] border border-[#B8955E]/30" } :
    product.isBestSeller ? { label: "Bestseller", cls: "bg-[#FFF9FB] text-[#3A2428] border border-[#B8955E]/20" } :
    product.tags?.[0] ? { label: product.tags[0], cls: "bg-[#3A2428] text-white" } :
    null;

  return (
    <div className="group flex flex-col w-full bg-[#FFF9FB] rounded-2xl p-2 sm:p-2.5 shadow-[0_2px_12px_rgba(58,36,40,0.03)] border border-[#B8955E]/10 transition-all hover:shadow-[0_4px_16px_rgba(184,149,94,0.1)]">
      <Link
        href={`/product/${product.slug || product.id}`}
        className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-[#FFF0F5]/50 mb-3 block"
      >
        <img
          src={product.images?.[0] || (product as any).image || (product as any).imageUrl || "/product-stack.jpg"}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        {badge && (
          <span className={`absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide shadow-sm ${badge.cls}`}>
            {badge.label}
          </span>
        )}
        <button
          aria-label="Add to wishlist"
          className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full transition-transform hover:scale-110 bg-white/80 backdrop-blur-md border border-[#B8955E]/20 shadow-sm ${isWishlisted ? 'text-red-500' : 'text-[#3A2428] hover:text-[#B8955E]'}`}
          onClick={toggleWishlist}
        >
          <Heart className={`h-3.5 w-3.5 ${isWishlisted ? 'fill-current text-red-500' : ''}`} />
        </button>
      </Link>
      <div className="flex flex-col flex-grow px-1">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#B8955E] mb-1 line-clamp-1">
          {(product.categorySlug || product.category || "").replace("-", " ")}
        </p>
        <Link
          href={`/product/${product.slug || product.id}`}
          className="line-clamp-2 text-[13px] sm:text-sm font-semibold text-[#3A2428] hover:text-[#B8955E] leading-snug mb-2 flex-grow h-[36px] sm:h-[40px] transition-colors"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-2 mb-3">
          {isSale ? (
            <>
              <span className="text-sm sm:text-base font-bold text-[#3A2428]">₹{product.salePrice}</span>
              <span className="text-[11px] sm:text-xs text-[#3A2428]/50 line-through">₹{product.regularPrice}</span>
            </>
          ) : (
            <span className="text-sm sm:text-base font-bold text-[#3A2428]">₹{product.salePrice}</span>
          )}
        </div>
        <button
          className="w-full text-xs sm:text-sm font-medium py-2 sm:py-2.5 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#B8955E] to-[#D4AF37] text-white shadow-[0_2px_8px_rgba(184,149,94,0.3)] hover:shadow-[0_4px_12px_rgba(184,149,94,0.4)] transition-all active:scale-[0.98]"
          onClick={handleAddToCart}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
