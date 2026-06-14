"use client";

import { ProductGrid } from "@/components/ProductGrid";
import { getProducts } from "@/lib/firestore";
import { Product } from "@/types";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ShopContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "All";
  const search = searchParams.get("search") || "";
  const price = searchParams.get("price") || "All";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const all = await getProducts();
        const active = Array.isArray(all) ? all.filter(p => p.isActive !== false) : [];
        setProducts(active);
      } catch (err) {
        console.error("Error loading shop products:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-col justify-between gap-5 md:flex-row md:items-end animate-pulse">
          <div className="space-y-2">
            <div className="h-4 w-40 skeleton rounded" />
            <div className="h-10 w-64 skeleton rounded" />
          </div>
          <div className="h-10 w-48 skeleton rounded-full" />
        </div>
        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 h-[600px] skeleton rounded-3xl shrink-0" />
          <div className="flex-1 space-y-8">
            <div className="grid gap-3 sm:gap-5 [grid-template-columns:repeat(auto-fill,minmax(160px,1fr))]">
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="border border-goldBeige/60 bg-warmwhite rounded-[1.5rem] p-3 space-y-3 shadow-sm">
                  <div className="aspect-[4/5] w-full skeleton rounded-xl" />
                  <div className="h-4 w-3/4 skeleton rounded" />
                  <div className="h-4 w-1/2 skeleton rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProductGrid
      products={products}
      title={category !== "All" ? category : "All Products"}
      initialCategory={category}
      initialSearch={search}
      initialPrice={price}
    />
  );
}

const ShopFallback = () => (
  <ProductGrid
    products={[]}
    title="All Products"
    initialCategory="All"
    initialSearch=""
    initialPrice="All"
  />
);

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopFallback />}>
      <ShopContent />
    </Suspense>
  );
}
