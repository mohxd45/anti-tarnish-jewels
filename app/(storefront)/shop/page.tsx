"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { getProducts, getCategories } from "@/lib/firestore";
import { Product } from "@/types";
import Link from "next/link";
import { Filter, SlidersHorizontal, X } from "lucide-react";
import { LONA_CATEGORIES } from "@/lib/categories";

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  
  const [categories, setCategories] = useState<any[]>(LONA_CATEGORIES);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [sortBy, setSortBy] = useState("featured");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [displayCount, setDisplayCount] = useState(12);

  // Filters State
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [availability, setAvailability] = useState<"all" | "in-stock" | "out-of-stock">("all");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

  const sortOptions = [
    { label: "Featured", value: "featured" },
    { label: "Newest", value: "newest" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
    { label: "Best Selling", value: "best-selling" }
  ];

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [allProds] = await Promise.all([
          getProducts()
        ]);
        
        const active = Array.isArray(allProds) ? allProds.filter(p => p.isActive !== false) : [];
        const highestPrice = active.length > 0 ? Math.max(...active.map(p => p.salePrice || p.regularPrice || 0)) : 10000;
        setMaxPrice(highestPrice);
        setPriceRange([0, highestPrice]);

        // Filter robustly by category slug, category name, or category id
        const cleanParam = categoryParam.toLowerCase().trim();
        if (cleanParam === "all" || cleanParam === "all jewellery" || cleanParam === "") {
          setProducts(active);
        } else if (cleanParam === "sale") {
          setProducts(active.filter(p => p.regularPrice && p.regularPrice > p.salePrice));
        } else {
          setProducts(active.filter(p => {
            const catStr = String(p.category || "").toLowerCase().trim();
            const catSlugStr = String(p.categorySlug || "").toLowerCase().trim();
            return catStr === cleanParam || catSlugStr === cleanParam;
          }));
        }
      } catch (err) {
        console.error("Failed to load shop:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
    setDisplayCount(12); // Reset count when category changes
    // Reset filters
    setAvailability("all");
    setSelectedMaterial("");
    setSelectedColor("");
    // (price range resets when products load)
  }, [categoryParam]);

  const activeCategory = categories.find(c => c.slug.toLowerCase() === categoryParam.toLowerCase().trim()) || categories[0];
  const displayTitle = activeCategory.name;

  const availableMaterials = Array.from(new Set(products.map(p => p.material).filter(Boolean))) as string[];
  const availableColors = Array.from(new Set(products.map(p => p.color).filter(Boolean))) as string[];

  const activeFiltersCount = (availability !== "all" ? 1 : 0) + (selectedMaterial ? 1 : 0) + (selectedColor ? 1 : 0) + (priceRange[1] < maxPrice ? 1 : 0);

  const filteredProducts = products.filter(p => {
    const price = p.salePrice || p.regularPrice || 0;
    if (price > priceRange[1]) return false;
    if (availability === "in-stock" && (p.stock || 0) <= 0) return false;
    if (availability === "out-of-stock" && (p.stock || 0) > 0) return false;
    if (selectedMaterial && p.material !== selectedMaterial) return false;
    if (selectedColor && p.color !== selectedColor) return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.salePrice - b.salePrice;
    if (sortBy === "price-desc") return b.salePrice - a.salePrice;
    if (sortBy === "newest") {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    if (sortBy === "best-selling") {
      const aScore = a.isBestSeller ? 1 : 0;
      const bScore = b.isBestSeller ? 1 : 0;
      if (bScore !== aScore) return bScore - aScore;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    return 0; // featured defaults to original order
  });

  const displayedProducts = sortedProducts.slice(0, displayCount);

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <h1 className="font-serif text-4xl text-charcoalBrown md:text-5xl">{displayTitle}</h1>
        <p className="mt-2 text-stoneGray">{activeCategory.blurb}</p>
      </div>

      <div className="mx-auto mt-6 max-w-7xl px-4">
        <div className="mb-6 flex overflow-x-auto gap-2 pb-2 scrollbar-hide snap-x [&::-webkit-scrollbar]:hidden">
          {categories.map((cat, i) => {
            const cleanParam = categoryParam.toLowerCase().trim();
            const isActive = 
              (cat.slug === "all" && (cleanParam === "" || cleanParam === "all" || cleanParam === "all jewellery")) || 
              cleanParam === cat.slug;
            
            return (
              <Link
                key={i}
                href={cat.slug === "all" ? "/shop" : `/shop?category=${cat.slug}`}
                className={`snap-start shrink-0 px-4 py-1.5 rounded-full text-sm transition-colors border ${
                  isActive 
                    ? "bg-[#3A2428] text-white border-transparent shadow-sm font-medium" 
                    : "bg-white text-[#8F817B] border-[#E8D7C8] hover:border-[#3A2428] hover:text-[#3A2428]"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        <div className="flex justify-between items-center mb-6">
          <p className="text-stoneGray text-sm font-medium">{filteredProducts.length} Products</p>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFilterMenu(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#FAF9F6]/95 backdrop-blur-sm shadow-sm border border-stone-200 rounded-2xl text-sm transition hover:bg-white"
            >
              <Filter className="w-3 h-3" /> Filter {activeFiltersCount > 0 && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-champagne text-[10px] font-bold text-white">{activeFiltersCount}</span>}
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#FAF9F6]/95 backdrop-blur-sm shadow-sm border border-stone-200 rounded-2xl text-sm transition hover:bg-white"
              >
                <SlidersHorizontal className="w-3 h-3" /> {sortOptions.find(o => o.value === sortBy)?.label || "Sort"}
              </button>
              
              {showSortMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowSortMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-stone-200 bg-white shadow-xl z-20 py-2">
                    {sortOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortBy(opt.value);
                          setShowSortMenu(false);
                          setDisplayCount(12);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm transition hover:bg-stone-50 ${sortBy === opt.value ? 'font-semibold text-charcoalBrown bg-stone-50/50' : 'text-stoneGray'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-stone-50/30 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : displayedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {displayedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {filteredProducts.length > displayCount && (
              <div className="mt-12 flex justify-center">
                <button 
                  onClick={() => setDisplayCount(prev => prev + 12)}
                  className="btn-liquid px-8 py-3 shadow-sm hover:shadow-md"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-[#FAF9F6]/95 backdrop-blur-sm shadow-sm border border-stone-200 rounded-2xl">
            No products found. <Link href="/shop?category=all" className="text-stoneGray underline">View all</Link>
          </div>
        )}
      </div>

      {/* Filter Drawer */}
      {showFilterMenu && (
        <div 
          className="fixed inset-0 z-[150] bg-stone-900/40 backdrop-blur-sm transition-opacity" 
          onClick={() => setShowFilterMenu(false)}
        />
      )}
      <div 
        className={`fixed left-0 top-0 z-[160] h-screen w-[85%] max-w-[320px] bg-[#FAF9F6] shadow-2xl transition-transform duration-300 overflow-y-auto ${showFilterMenu ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-2xl text-charcoalBrown">Filters</h2>
            <button onClick={() => setShowFilterMenu(false)} className="rounded-full p-2 text-stoneGray hover:bg-stone-200/50 hover:text-charcoalBrown transition">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-8">
            {/* Category */}
            {categories.length > 1 && (
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stoneGray">Category</h3>
                <div className="flex flex-col gap-2">
                  {categories.map(c => {
                    const isActive = categoryParam.toLowerCase() === c.slug.toLowerCase();
                    return (
                      <Link 
                        key={c.slug} 
                        href={`/shop?category=${c.slug}`}
                        onClick={() => setShowFilterMenu(false)}
                        className={`text-sm transition ${isActive ? 'font-semibold text-charcoalBrown' : 'text-stoneGray hover:text-charcoalBrown'}`}
                      >
                        {c.name}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Availability */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stoneGray">Availability</h3>
              <div className="flex flex-col gap-3">
                {[
                  { label: "All", value: "all" },
                  { label: "In Stock", value: "in-stock" },
                  { label: "Out of Stock", value: "out-of-stock" }
                ].map(opt => (
                  <label key={opt.value} className="flex cursor-pointer items-center gap-3">
                    <div className="relative flex items-center">
                      <input 
                        type="radio" 
                        name="availability"
                        value={opt.value}
                        checked={availability === opt.value} 
                        onChange={(e) => { setAvailability(e.target.value as any); setDisplayCount(12); }}
                        className="h-5 w-5 appearance-none rounded-full border border-stone-300 bg-white checked:border-4 checked:border-champagne transition-all"
                      />
                    </div>
                    <span className="text-sm font-medium text-charcoalBrown">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stoneGray flex justify-between">
                <span>Price</span>
                <span className="text-charcoalBrown lowercase normal-case">Up to ₹{priceRange[1]}</span>
              </h3>
              <input 
                type="range" 
                min="0" 
                max={maxPrice} 
                step={maxPrice > 1000 ? 500 : 100} 
                value={priceRange[1]} 
                onChange={(e) => { setPriceRange([0, parseInt(e.target.value)]); setDisplayCount(12); }}
                className="w-full accent-champagne"
              />
            </div>

            {/* Material */}
            {availableMaterials.length > 0 && (
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stoneGray">Material</h3>
                <div className="flex flex-wrap gap-2">
                  {availableMaterials.map(m => (
                    <button 
                      key={m} 
                      onClick={() => { setSelectedMaterial(m === selectedMaterial ? "" : m); setDisplayCount(12); }} 
                      className={`rounded-xl border px-4 py-2 text-sm transition ${m === selectedMaterial ? 'border-champagne bg-champagne/10 text-charcoalBrown font-semibold' : 'border-stone-200 bg-white text-stoneGray hover:border-stone-300'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color */}
            {availableColors.length > 0 && (
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stoneGray">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map(c => (
                    <button 
                      key={c} 
                      onClick={() => { setSelectedColor(c === selectedColor ? "" : c); setDisplayCount(12); }} 
                      className={`rounded-xl border px-4 py-2 text-sm transition ${c === selectedColor ? 'border-champagne bg-champagne/10 text-charcoalBrown font-semibold' : 'border-stone-200 bg-white text-stoneGray hover:border-stone-300'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-stone-200 pt-6">
            <button 
              onClick={() => { 
                setAvailability("all"); 
                setPriceRange([0, maxPrice]); 
                setSelectedMaterial(""); 
                setSelectedColor(""); 
                setDisplayCount(12); 
              }} 
              className="btn-liquid w-full py-3 text-sm"
            >
              Clear All Filters
            </button>
          </div>
        </div>
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
