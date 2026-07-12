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
    isSale ? { label: "Sale", cls: "bg-stone-500 text-white" } :
    product.isBestSeller ? { label: "Bestseller", cls: "clay-badge px-3 py-1 text-charcoalBrown" } :
    product.tags?.[0] ? { label: product.tags[0], cls: "bg-pink-900 text-white" } :
    null;

  return (
    <div className="group flex flex-col w-full">
      <Link
        href={`/product/${product.slug || product.id}`}
        className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-neutral-100 shadow-sm border border-stone-100 mb-3 block"
      >
        <img
          src={product.images?.[0] || (product as any).image || (product as any).imageUrl || "/product-stack.jpg"}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {badge && (
          <span className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-sm ${badge.cls}`}>
            {badge.label}
          </span>
        )}
        <button
          aria-label="Add to wishlist"
          className={`glass absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full transition hover:scale-110 ${isWishlisted ? 'text-red-500' : 'text-stoneGray hover:text-charcoalBrown'}`}
          onClick={toggleWishlist}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current text-red-500' : ''}`} />
        </button>
      </Link>
      <div className="flex flex-col gap-1 px-1">
        <p className="text-[9px] font-medium uppercase tracking-wider text-stoneGray">
          {(product.categorySlug || product.category || "").replace("-", " ")}
        </p>
        <Link
          href={`/product/${product.slug || product.id}`}
          className="line-clamp-2 font-serif text-[13px] sm:text-sm text-pink-950 hover:text-charcoalBrown font-medium leading-tight h-[36px] sm:h-[40px]"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-2 mt-0.5">
          {isSale ? (
            <>
              <span className="text-sm sm:text-base font-bold text-charcoalBrown">₹{product.salePrice}</span>
              <span className="text-[10px] sm:text-xs text-stoneGray line-through">₹{product.regularPrice}</span>
            </>
          ) : (
            <span className="text-sm sm:text-base font-bold text-charcoalBrown">₹{product.salePrice}</span>
          )}
        </div>
        <button
          className="btn-primary-gold mt-2 w-full text-xs py-2 sm:py-2.5 flex items-center justify-center gap-1.5 rounded-xl"
          onClick={handleAddToCart}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
