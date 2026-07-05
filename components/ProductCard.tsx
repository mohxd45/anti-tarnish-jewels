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
    isSale ? { label: "Sale", cls: "bg-beige0 text-white" } :
    product.isBestSeller ? { label: "Bestseller", cls: "clay-badge px-3 py-1 text-charcoalBrown" } :
    product.tags?.[0] ? { label: product.tags[0], cls: "bg-pink-900 text-white" } :
    null;

  return (
    <div className="glass-premium card-hover hover-tilt group flex flex-col overflow-hidden rounded-2xl shine-sweep">
      <Link
        href={`/product/${product.slug || product.id}`}
        className="relative block aspect-square overflow-hidden"
      >
        <img
          src={product.images?.[0] || (product as any).image || (product as any).imageUrl || "/product-stack.jpg"}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {badge && (
          <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${badge.cls}`}>
            {badge.label}
          </span>
        )}
        <button
          aria-label="Add to wishlist"
          className={`glass absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full transition hover:text-stoneGray ${isWishlisted ? 'text-red-500' : 'text-stoneGray'}`}
          onClick={toggleWishlist}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-stoneGray">
          {(product.categorySlug || product.category || "").replace("-", " ")}
        </p>
        <Link
          href={`/product/${product.slug || product.id}`}
          className="line-clamp-2 font-serif text-sm text-pink-950 hover:text-charcoalBrown sm:text-base font-medium"
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          {isSale ? (
            <>
              <span className="text-base font-bold text-charcoalBrown">₹{product.salePrice}</span>
              <span className="text-xs text-stoneGray line-through">₹{product.regularPrice}</span>
            </>
          ) : (
            <span className="text-base font-bold text-charcoalBrown">₹{product.salePrice}</span>
          )}
        </div>
        <button
          className="btn-primary-gold mt-2 w-full text-xs sm:text-sm flex items-center justify-center gap-2"
          onClick={handleAddToCart}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
