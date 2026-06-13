"use client";

import { ProductGrid } from "@/components/ProductGrid";
import { getProducts } from "@/lib/firestore";
import { Product } from "@/types";
import { useEffect, useState } from "react";

export default function SalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const all = await getProducts();
        setProducts(all.filter((p) => p.discountPercentage >= 50));
      } catch (err) {
        console.error("Error loading sale products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <span className="animate-pulse tracking-widest text-lg font-serif text-champagne">
          Loading Sale Items...
        </span>
      </div>
    );
  }

  return <ProductGrid products={products} title="Sale" />;
}
