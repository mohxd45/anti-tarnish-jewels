"use client";

import { ProductCard } from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";

export default function WishlistPage() {
  const { items } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="glass mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full text-pink-300">
          <Heart className="h-10 w-10" />
        </div>
        <h1 className="mb-4 font-serif text-3xl text-pink-900 md:text-4xl">Your Wishlist is Empty</h1>
        <p className="mb-8 text-pink-700">Save your favorite anti-tarnish pieces here for later.</p>
        <Link href="/shop" className="btn-primary-gold inline-flex items-center gap-2">
          Explore Collection <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <h1 className="font-serif text-4xl text-pink-900 md:text-5xl text-center md:text-left">Your Wishlist</h1>
        <p className="mt-2 text-pink-600 text-center md:text-left">{items.length} item{items.length === 1 ? "" : "s"} saved for later</p>
      </div>
      <div className="mx-auto mt-6 max-w-7xl px-4 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {items.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </>
  );
}
