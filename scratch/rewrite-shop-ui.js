const fs = require('fs');

const shopContent = `"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { getProducts, getCategories } from "@/lib/firestore";
import { Product, Category } from "@/types";
import { Filter, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "All";
  
  const [categories, setCategories] = useState<any[]>([
    { slug: "All", name: "All Jewellery", blurb: "Discover our complete collection of anti-tarnish pieces." },
    { slug: "Sale", name: "Sale", blurb: "Forever shine, gentler price." }
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
        
        const active = Array.isArray(allProds) ? allProds.filter(p => p.status === "published" || p.status === "active") : [];
        
        if (allCats && allCats.length > 0) {
          const formattedCats = allCats.filter(c => c.isActive !== false).map(c => ({
            slug: c.slug,
            name: c.name,
            blurb: c.description || "Explore our collection.",
          }));
          setCategories([
            { slug: "All", name: "All Jewellery", blurb: "Discover our complete collection of anti-tarnish pieces." },
            ...formattedCats,
            { slug: "Sale", name: "Sale", blurb: "Forever shine, gentler price." }
          ]);
        }

        // Filter robustly by category slug, category name, or category id
        if (categoryParam === "All") {
          setProducts(active);
        } else if (categoryParam === "Sale") {
          setProducts(active.filter(p => p.compareAtPrice && p.compareAtPrice > p.price));
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

  return (
    <div className="bg-[var(--noir)] min-h-screen">
      <div className="bg-[var(--charcoal)] pt-24 pb-12 px-4 border-b border-white/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="font-display text-4xl md:text-5xl text-[var(--ink)] mb-3">{activeCategory.name}</h1>
            <p className="text-[var(--stoneGray)]">{activeCategory.blurb}</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat, i) => (
              <Link
                key={i}
                href={\`/shop?category=\${cat.slug}\`}
                className={\`px-4 py-2 rounded-full text-sm font-medium transition-colors \${
                  categoryParam.toLowerCase() === cat.slug.toLowerCase()
                    ? "bg-[var(--ink)] text-white shadow-md"
                    : "bg-white/50 text-[var(--stoneGray)] hover:bg-[var(--pink-100)] hover:text-[var(--ink)] border border-[var(--pink-200)]"
                }\`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <p className="text-[var(--stoneGray)] text-sm font-medium">{products.length} Products</p>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--charcoal)] border border-[var(--pink-200)] rounded-lg text-[var(--ink)] text-sm font-medium hover:bg-[var(--pink-100)] transition-colors">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--charcoal)] border border-[var(--pink-200)] rounded-lg text-[var(--ink)] text-sm font-medium hover:bg-[var(--pink-100)] transition-colors">
              <SlidersHorizontal className="w-4 h-4" /> Sort
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-[var(--pink-100)] animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-[var(--pink-100)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-[var(--stoneGray)]" />
            </div>
            <h3 className="font-display text-2xl text-[var(--ink)] mb-2">No products found</h3>
            <p className="text-[var(--stoneGray)] mb-6">We couldn't find any products in this category.</p>
            <Link href="/shop?category=All" className="btn-liquid">View All Jewellery</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--noir)] flex items-center justify-center"><div className="w-8 h-8 border-4 border-[var(--gold)] border-t-transparent rounded-full animate-spin"></div></div>}>
      <ShopContent />
    </Suspense>
  );
}
`;

fs.writeFileSync('app/shop/page.tsx', shopContent);
