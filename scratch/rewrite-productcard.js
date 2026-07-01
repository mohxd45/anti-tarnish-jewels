const fs = require('fs');

const cardContent = `"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "react-hot-toast";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { dispatch: cartDispatch } = useCart();
  const { addItem: addWishlist, removeItem: removeWishlist, items: wishlist } = useWishlist();
  
  const isWishlisted = wishlist.some(item => item.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail
    cartDispatch({ type: "ADD_ITEM", payload: { product, quantity: 1 } });
    toast.success("Added to cart!");
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating
    if (isWishlisted) {
      removeWishlist(product.id);
      toast.success("Removed from wishlist");
    } else {
      addWishlist(product);
      toast.success("Added to wishlist!");
    }
  };

  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <Link href={\`/product/\${product.slug || product.id}\`} className="block">
      <div className="product-card group relative bg-[var(--charcoal)] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {product.tag && (
            <span className="bg-[var(--gold)] text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full shadow-sm uppercase tracking-wider">
              {product.tag}
            </span>
          )}
          {discount > 0 && !product.tag && (
            <span className="bg-[var(--rose)] text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full shadow-sm">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={toggleWishlist}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/50 backdrop-blur-sm text-[var(--rose)] hover:bg-white hover:text-red-500 transition-colors"
        >
          <Heart className={\`w-4 h-4 sm:w-5 sm:h-5 \${isWishlisted ? "fill-current text-red-500" : ""}\`} />
        </button>

        {/* Image */}
        <div className="aspect-[4/5] overflow-hidden bg-[var(--ivory)]">
          <Image 
            src={product.images[0]} 
            alt={product.name} 
            width={400}
            height={500}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 text-center bg-[var(--charcoal)]">
          <p className="text-[var(--gold-dark)] text-[10px] sm:text-xs font-semibold tracking-wider uppercase mb-1 line-clamp-1">
            {product.category}
          </p>
          <h3 className="font-display text-base sm:text-lg text-[var(--ink)] font-semibold mb-2 line-clamp-1">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-[var(--ink)] font-bold text-sm sm:text-base">₹{product.price}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-[var(--stoneGray)] text-xs sm:text-sm line-through">₹{product.compareAtPrice}</span>
            )}
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="w-full btn-primary py-2.5 sm:py-3 rounded-xl opacity-90 group-hover:opacity-100 flex items-center justify-center gap-2 text-sm"
          >
            <ShoppingBag className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}
`;

fs.writeFileSync('components/ProductCard.tsx', cardContent);
