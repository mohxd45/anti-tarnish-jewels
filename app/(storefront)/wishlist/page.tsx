"use client";

import { ProductCard } from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import Link from "next/link";
import { Heart } from "lucide-react";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";

export default function WishlistPage() {
  const { items } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] bg-[#FFF0F5] px-4 py-20 pb-40 flex items-center justify-center">
        <EmptyStateCard 
          icon={Heart} 
          text="Your Wishlist is Empty" 
          subtext="Save your favorite anti-tarnish pieces here for later."
        >
          <Link href="/shop" className="mt-4 inline-flex items-center justify-center rounded-full bg-[#B8955E] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#A38250] shadow-sm tracking-wide">
            Explore Collection
          </Link>
        </EmptyStateCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF0F5] pb-32">
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:pt-16 pb-8">
        <div className="bg-[#FFF9FB] shadow-[0_8px_24px_rgba(58,36,40,0.04)] border border-[#E8D7C8]/50 rounded-[2rem] p-8 text-center sm:text-left sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#3A2428]">Your Wishlist</h1>
            <p className="mt-2 text-[#3A2428]/70 text-sm sm:text-base">{items.length} item{items.length === 1 ? "" : "s"} saved for later</p>
          </div>
          <div className="hidden sm:block">
            <Heart className="h-10 w-10 text-[#B8955E]/20" />
          </div>
        </div>
      </div>
      
      <div className="mx-auto max-w-7xl px-4 pb-24">
        {/* If only 1 item, prevent it from getting overly huge, otherwise use grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {items.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </div>
  );
}
