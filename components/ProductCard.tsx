"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "sonner";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

export function ProductCard({ product, variant = "default" }: { product: Product; variant?: "default" | "compact" }) {
  const isCompact = variant === "compact";
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToWishlist: addWishlist, removeFromWishlist: removeWishlist, items: wishlist } = useWishlist();
  
  const isWishlisted = wishlist.some(item => item.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    if (product.isBundle) {
      router.push(`/product/${product.slug || product.id}`);
      return;
    }
    if (product.selectedSizeRequired || product.selectedColorRequired) {
      router.push(`/product/${product.slug || product.id}`);
      return;
    }
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

  const productUrl = `/product/${product.slug || product.id}`;
  const buttonText = (product.isBundle && product.bundleType === "mix_and_match") 
    ? "Build Bundle" 
    : (product.selectedSizeRequired || product.selectedColorRequired) 
      ? "Select Options" 
      : (product.isBundle ? "View Bundle" : "Add to Cart");

  return (
    <div className={`group flex flex-col w-full bg-[#FFF9FB] border border-[#B8955E]/10 transition-all ${isCompact ? 'rounded-xl p-1.5 shadow-[0_2px_8px_rgba(58,36,40,0.04)] hover:shadow-[0_4px_12px_rgba(184,149,94,0.08)]' : 'rounded-2xl p-2 sm:p-2.5 shadow-[0_2px_12px_rgba(58,36,40,0.03)] hover:shadow-[0_4px_16px_rgba(184,149,94,0.1)]'}`}>
      <Link
        href={productUrl}
        className={`relative w-full overflow-hidden bg-[#FFF0F5]/50 block ${isCompact ? 'aspect-square sm:aspect-[4/5] rounded-lg mb-2' : 'aspect-[4/5] rounded-xl mb-3'}`}
      >
        <OptimizedImage
          src={product.images?.[0] || (product as any).image || (product as any).imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        {badge && (
          <span className={`absolute left-2 top-2 rounded-full font-bold uppercase tracking-wide shadow-sm ${badge.cls} ${isCompact ? 'px-1.5 py-0.5 text-[8px] sm:text-[9px]' : 'px-2.5 py-0.5 text-[9px] sm:text-[10px]'}`}>
            {badge.label}
          </span>
        )}
        <button
          aria-label="Add to wishlist"
          className={`absolute flex items-center justify-center rounded-full transition-transform hover:scale-110 bg-white/80 backdrop-blur-md border border-[#B8955E]/20 shadow-sm ${isWishlisted ? 'text-red-500' : 'text-[#3A2428] hover:text-[#B8955E]'} ${isCompact ? 'right-1.5 top-1.5 h-6 w-6' : 'right-2 top-2 h-7 w-7'}`}
          onClick={toggleWishlist}
        >
          <Heart className={`${isWishlisted ? 'fill-current text-red-500' : ''} ${isCompact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
        </button>
      </Link>
      <div className={`flex flex-col flex-grow ${isCompact ? 'px-0.5' : 'px-1'}`}>
        <p className={`font-bold uppercase tracking-widest text-[#B8955E] line-clamp-1 ${isCompact ? 'text-[9px] mb-0.5' : 'text-[10px] sm:text-xs mb-1'}`}>
          {(product.categorySlug || product.category || "").replace("-", " ")}
        </p>
        <Link
          href={productUrl}
          className={`line-clamp-2 font-semibold text-[#3A2428] hover:text-[#B8955E] leading-snug flex-grow transition-colors ${isCompact ? 'text-[11px] sm:text-xs mb-1 h-[32px] sm:h-[36px]' : 'text-[13px] sm:text-sm mb-2 h-[36px] sm:h-[40px]'}`}
        >
          {product.name}
        </Link>
        <div className={`flex items-center ${isCompact ? 'gap-1.5 mb-2' : 'gap-2 mb-3'}`}>
          {isSale ? (
            <>
              <span className={`font-bold text-[#3A2428] ${isCompact ? 'text-[11px] sm:text-xs' : 'text-sm sm:text-base'}`}>₹{product.salePrice}</span>
              <span className={`text-[#3A2428]/50 line-through ${isCompact ? 'text-[9px] sm:text-[10px]' : 'text-[11px] sm:text-xs'}`}>₹{product.regularPrice}</span>
            </>
          ) : (
            <span className={`font-bold text-[#3A2428] ${isCompact ? 'text-[11px] sm:text-xs' : 'text-sm sm:text-base'}`}>₹{product.salePrice}</span>
          )}
        </div>
        <button
          className={`w-full font-medium flex items-center justify-center rounded-xl bg-gradient-to-r from-[#B8955E] to-[#D4AF37] text-white transition-all active:scale-[0.98] ${isCompact ? 'py-1.5 sm:py-2 text-[10px] sm:text-[11px] gap-1 shadow-[0_2px_6px_rgba(184,149,94,0.2)] hover:shadow-[0_3px_10px_rgba(184,149,94,0.3)]' : 'py-2 sm:py-2.5 text-xs sm:text-sm gap-1.5 shadow-[0_2px_8px_rgba(184,149,94,0.3)] hover:shadow-[0_4px_12px_rgba(184,149,94,0.4)]'}`}
          onClick={handleAddToCart}
        >
          <ShoppingBag className={isCompact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
          <span>{buttonText}</span>
        </button>
      </div>
    </div>
  );
}
