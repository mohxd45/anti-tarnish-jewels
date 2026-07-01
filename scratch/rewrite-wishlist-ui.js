const fs = require('fs');

const wishlistContent = `"use client";

import { ProductCard } from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";

export default function WishlistPage() {
  const { items } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="bg-[var(--noir)] pt-32 pb-16 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-24 h-24 bg-[var(--charcoal)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-[var(--pink-200)]">
            <Heart className="w-10 h-10 text-[var(--stoneGray)]" />
          </div>
          <h1 className="font-display text-4xl text-[var(--ink)] mb-4">Your Wishlist is Empty</h1>
          <p className="text-[var(--stoneGray)] mb-8">Save your favorite anti-tarnish pieces here for later.</p>
          <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
            Explore Collection <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--noir)] pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="font-display text-4xl md:text-5xl text-[var(--ink)] mb-8 text-center md:text-left">Your Wishlist</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {items.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('app/wishlist/page.tsx', wishlistContent);
