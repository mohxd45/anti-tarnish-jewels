"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { getProducts, getCategories } from "@/lib/firestore";
import { Product } from "@/types";
import Link from "next/link";
import { Filter, SlidersHorizontal } from "lucide-react";

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  
  const [categories, setCategories] = useState<any[]>([
    { slug: "all", name: "All Jewellery", blurb: "Explore our complete collection" }
  ]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [allProds, allCats] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        
        const active = Array.isArray(allProds) ? allProds.filter(p => p.isActive !== false) : [];
        
        if (allCats && allCats.length > 0) {
          const formattedCats = allCats.filter(c => c.isActive !== false).map(c => ({
            slug: c.slug || c.name.toLowerCase().replace(/\s+/g, '-'),
            name: c.name,
            blurb: c.description || "Explore our collection",
          }));
          setCategories([
            { slug: "all", name: "All", blurb: "Explore our complete collection" },
            ...formattedCats,
            { slug: "sale", name: "Sale", blurb: "Forever shine, gentler price." }
          ]);
        }

        // Filter robustly by category slug, category name, or category id
        if (categoryParam.toLowerCase() === "all") {
          setProducts(active);
        } else if (categoryParam.toLowerCase() === "sale") {
          setProducts(active.filter(p => p.regularPrice && p.regularPrice > p.salePrice));
        } else {
          setProducts(active.filter(p => {
            const catStr = String(p.category || "").toLowerCase();
            const paramStr = categoryParam.toLowerCase();
            return catStr === paramStr || 
                   String(p.categoryId || "").toLowerCase() === paramStr ||
                   String(p.categorySlug || "").toLowerCase() === paramStr;
          }));
        }
      } catch (err) {
        console.error("Failed to load shop:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [categoryParam]);

  const activeCategory = categories.find(c => c.slug.toLowerCase() === categoryParam.toLowerCase()) || categories[0];
  const displayTitle = activeCategory.name === "All" ? "All Jewellery" : activeCategory.name;

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <h1 className="font-serif text-4xl text-charcoalBrown md:text-5xl">{displayTitle}</h1>
        <p className="mt-2 text-stoneGray">{activeCategory.blurb}</p>
      </div>

      <div className="mx-auto mt-6 max-w-7xl px-4">
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat, i) => {
            const isActive = categoryParam.toLowerCase() === cat.slug.toLowerCase();
            return (
              <Link
                key={i}
                href={`/shop?category=${cat.slug}`}
                className={isActive ? "btn-primary-gold text-sm" : "btn-liquid text-sm"}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        <div className="flex justify-between items-center mb-6">
          <p className="text-stoneGray text-sm font-medium">{products.length} Products</p>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#FAF9F6]/95 backdrop-blur-sm shadow-sm border border-stone-200 rounded-2xl">
              <Filter className="w-3 h-3" /> Filter
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#FAF9F6]/95 backdrop-blur-sm shadow-sm border border-stone-200 rounded-2xl">
              <SlidersHorizontal className="w-3 h-3" /> Sort
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-stone-50/30 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-[#FAF9F6]/95 backdrop-blur-sm shadow-sm border border-stone-200 rounded-2xl">
            No products found. <Link href="/shop?category=all" className="text-stoneGray underline">View all</Link>
          </div>
        )}
      </div>
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-stone-200/50 border-t-champagne rounded-full animate-spin"></div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
