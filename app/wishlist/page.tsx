"use client";

import { ProductCard } from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import Link from "next/link";

export default function WishlistPage() {
  const { items } = useWishlist();

  if (!items.length) {
    return (
      <section className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-4xl font-serif font-semibold text-champagne">Wishlist is empty</h1>
        <p className="mt-4 text-stoneGray">Save your favourite items here.</p>
        <Link href="/shop" className="mt-6 inline-block rounded-full bg-champagne px-6 py-3 font-semibold text-charcoalBrown hover:opacity-90 transition-all">Explore Catalog</Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 pb-32">
      <h1 className="text-4xl font-serif font-semibold text-charcoalBrown">Wishlist</h1>
      <div className="mt-8 grid grid-cols-1 min-[320px]:grid-cols-2 min-[540px]:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
        {items.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
