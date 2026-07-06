"use client";

import { ProductCard } from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";

export default function WishlistPage() {
  const { items } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20">
        <EmptyStateCard 
          icon={Heart} 
          text="Your Wishlist is Empty" 
          subtext="Save your favorite anti-tarnish pieces here for later."
        >
          <Link href="/shop" className="mt-4 inline-flex items-center gap-2 rounded-full bg-charcoalBrown px-6 py-3 font-semibold text-white transition hover:bg-charcoalBrown/90 shadow-sm">
            Explore Collection
          </Link>
        </EmptyStateCard>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-12 md:pt-16">
        <div className="bg-[#FAF9F6]/95 backdrop-blur-sm shadow-sm border border-stone-200 rounded-2xl">
          <h1 className="font-serif text-3xl md:text-4xl text-charcoalBrown text-center md:text-left">Your Wishlist</h1>
          <p className="mt-2 text-stoneGray text-center md:text-left">{items.length} item{items.length === 1 ? "" : "s"} saved for later</p>
        </div>
      </div>
      
      <div className="mx-auto max-w-7xl px-4 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {items.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </>
  );
}
