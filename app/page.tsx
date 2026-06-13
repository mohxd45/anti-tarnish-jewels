"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { HeroSlider } from "@/components/HeroSlider";
import { 
  getHomepageSections, 
  getHomepageProducts, 
  getCategories, 
  getReviews, 
  getSiteContent,
  getOptimizedImageUrl
} from "@/lib/firestore";
import { Product, Category, HomepageSection } from "@/types";
import { ArrowRight, Gift, ShieldCheck, Sparkles, Truck, Star } from "lucide-react";
import { TrustBadges } from "@/components/TrustBadges";
import { sampleProducts } from "@/data/products";

// Fallback data for bulletproof homepage rendering
const fallbackCategories: Category[] = [
  { id: "c1", name: "Earrings", slug: "earrings", priority: 1, isActive: true, subcategories: [] },
  { id: "c2", name: "Rings", slug: "rings", priority: 2, isActive: true, subcategories: [] },
  { id: "c3", name: "Necklaces", slug: "necklaces", priority: 3, isActive: true, subcategories: [] },
  { id: "c4", name: "Bracelets", slug: "bracelets", priority: 4, isActive: true, subcategories: [] }
];

const fallbackReviews = [
  { id: "r1", name: "Ananya S.", rating: 5, comment: "Absolutely love the rings! I wear them daily in water and they haven't tarnished at all." },
  { id: "r2", name: "Priya M.", rating: 5, comment: "Elegant packaging and very fast delivery. The necklace looks so premium." },
  { id: "r3", name: "Kajal D.", rating: 5, comment: "Perfect for office wear. Lightweight, tarnish-free, and very elegant." }
];

// Module-level caches
let cachedSections: HomepageSection[] | null = null;
let cachedProducts: Product[] | null = null;
let cachedCategories: Category[] | null = null;
let cachedReviews: any[] | null = null;
let cachedHomeCopy: any | null = null;
let isInitialLoad = true;

export default function HomePage() {
  const [mounted, setMounted] = useState(() => {
    if (typeof window !== "undefined" && !isInitialLoad && cachedSections && cachedSections.length > 0) {
      return true;
    }
    return false;
  });
  const [sections, setSections] = useState<HomepageSection[]>(cachedSections || []);
  const [products, setProducts] = useState<Product[]>(cachedProducts || sampleProducts);
  const [categories, setCategories] = useState<Category[]>(cachedCategories || fallbackCategories);
  const [reviews, setReviews] = useState<any[]>(cachedReviews || fallbackReviews);
  const [homeCopy, setHomeCopy] = useState(cachedHomeCopy || {
    heroTitle: "",
    heroSubtitle: "",
    heroCtaText: "",
    footerText: ""
  });

  useEffect(() => {
    isInitialLoad = false;
    setMounted(true);
    loadData();
  }, []);

  async function loadData() {
    try {
      if (cachedSections && cachedProducts && cachedCategories && cachedReviews && cachedHomeCopy) {
        return;
      }

      const [activeSections, allProds, allCats, allReviews, copy] = await Promise.all([
        getHomepageSections(),
        getHomepageProducts(),
        getCategories(),
        getReviews(),
        getSiteContent("home")
      ]);

      const sortedSections = [...activeSections]
        .filter((s) => s.isActive)
        .sort((a, b) => a.order - b.order);

      let filteredProducts = allProds.filter(p => p.isActive !== false);
      if (filteredProducts.length === 0) {
        filteredProducts = sampleProducts;
      }
      let filteredCategories = allCats.filter(c => c.isActive);
      if (filteredCategories.length === 0) {
        filteredCategories = fallbackCategories;
      }
      let filteredReviews = allReviews.filter(r => r.active !== false);
      if (filteredReviews.length === 0) {
        filteredReviews = fallbackReviews;
      }
      const copyData = copy ? {
        heroTitle: copy.heroTitle || "",
        heroSubtitle: copy.heroSubtitle || "",
        heroCtaText: copy.heroCtaText || "",
        footerText: copy.footerText || ""
      } : {
        heroTitle: "",
        heroSubtitle: "",
        heroCtaText: "",
        footerText: ""
      };

      cachedSections = sortedSections;
      cachedProducts = filteredProducts;
      cachedCategories = filteredCategories;
      cachedReviews = filteredReviews;
      cachedHomeCopy = copyData;

      setSections(sortedSections);
      setProducts(filteredProducts);
      setCategories(filteredCategories);
      setReviews(filteredReviews);
      setHomeCopy(copyData);
    } catch (err) {
      console.error("Error loading homepage data:", err);
    }
  }



  const renderSection = (section: HomepageSection) => {
    switch (section.type) {
      
      // FLASH DEALS SECTION
      case "flash-deals": {
        let flashProducts = products.filter(p => p.isFlashDeal);
        if (flashProducts.length === 0) {
          flashProducts = products.slice(0, 4);
        }
        if (flashProducts.length === 0) return null;
        return (
          <section key={section.id} className="mx-auto max-w-7xl px-4 py-12">
            <div className="mb-8">
              <span className="text-xs uppercase tracking-[0.4em] text-dustyRose font-semibold block animate-pulse">⚡ Limited Time Deals</span>
              <h2 className="mt-2 text-[clamp(1.5rem,4vw,2.25rem)] font-serif font-semibold text-charcoalBrown">{section.title}</h2>
            </div>
            <div className="grid grid-cols-1 min-[320px]:grid-cols-2 min-[540px]:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
              {flashProducts.slice(0, section.maxProducts || 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        );
      }

      // TRENDING PRODUCTS
      case "trending": {
        let trendingProducts = products.filter(p => p.isTrending);
        if (trendingProducts.length === 0) {
          trendingProducts = products.slice(0, 6);
        }
        if (trendingProducts.length === 0) return null;
        return (
          <section key={section.id} className="mx-auto max-w-7xl px-4 py-12">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <span className="text-xs uppercase tracking-[0.35em] text-champagne font-semibold block">🌟 Customer Favorites</span>
                <h2 className="mt-2 text-[clamp(1.5rem,4vw,2.25rem)] font-serif font-semibold text-charcoalBrown">{section.title}</h2>
              </div>
              <Link href="/shop" className="text-champagne text-sm hover:underline flex items-center gap-1.5 font-semibold">
                View Shop <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-1 min-[320px]:grid-cols-2 min-[540px]:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
              {trendingProducts.slice(0, section.maxProducts || 6).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        );
      }

      // NEW ARRIVALS
      case "new-arrivals": {
        let newProducts = products.filter(p => p.isNewArrival);
        if (newProducts.length === 0) {
          newProducts = products.slice(0, 4);
        }
        if (newProducts.length === 0) return null;
        return (
          <section key={section.id} className="mx-auto max-w-7xl px-4 py-12">
            <div className="mb-8">
              <span className="text-xs uppercase tracking-[0.35em] text-champagne font-semibold block">🏷️ Fresh Launch</span>
              <h2 className="mt-2 text-[clamp(1.5rem,4vw,2.25rem)] font-serif font-semibold text-charcoalBrown">{section.title}</h2>
            </div>
            <div className="grid grid-cols-1 min-[320px]:grid-cols-2 min-[540px]:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
              {newProducts.slice(0, section.maxProducts || 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        );
      }

      // BEST SELLERS
      case "best-sellers": {
        let sellerProducts = products.filter(p => p.isBestSeller);
        if (sellerProducts.length === 0) {
          sellerProducts = products.slice(0, 4);
        }
        if (sellerProducts.length === 0) return null;
        return (
          <section key={section.id} className="mx-auto max-w-7xl px-4 py-12">
            <div className="mb-8">
              <span className="text-xs uppercase tracking-[0.35em] text-champagne font-semibold block">✨ Top Sellers</span>
              <h2 className="mt-2 text-[clamp(1.5rem,4vw,2.25rem)] font-serif font-semibold text-charcoalBrown">{section.title}</h2>
            </div>
            <div className="grid grid-cols-1 min-[320px]:grid-cols-2 min-[540px]:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
              {sellerProducts.slice(0, section.maxProducts || 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        );
      }

      // DYNAMIC CATEGORY GRID
      case "category-grid": {
        let gridCats = categories;
        if (gridCats.length === 0) {
          gridCats = fallbackCategories;
        }
        if (gridCats.length === 0) return null;
        return (
          <section key={section.id} className="mx-auto max-w-7xl px-4 py-12">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <span className="text-xs uppercase tracking-[0.35em] text-champagne font-semibold block">Shop By Department</span>
                <h2 className="mt-2 text-[clamp(1.5rem,4vw,2.25rem)] font-serif font-semibold text-charcoalBrown">{section.title}</h2>
              </div>
              <Link href="/shop" className="text-champagne text-sm hover:underline flex items-center gap-1.5 font-semibold">
                Explore All <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-1 min-[320px]:grid-cols-2 min-[540px]:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {gridCats.slice(0, section.maxProducts || 8).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="group rounded-3xl border border-goldBeige/60 bg-warmwhite p-5 hover:-translate-y-1 hover:border-champagne/40 transition-all duration-300 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-champagne group-hover:text-champagne/80 transition-colors">{cat.name}</h3>
                  <p className="mt-2 text-[11px] text-stoneGray leading-relaxed">Explore premium quality items in {cat.name.toLowerCase()}.</p>
                </Link>
              ))}
            </div>
          </section>
        );
      }

      // CUSTOM FILTER CATEGORY
      case "custom-category": {
        const catName = section.categoryFilter;
        if (!catName) return null;
        let catProducts = products.filter(p => 
          p.category.toLowerCase() === catName.toLowerCase() ||
          (p.collection && p.collection.toLowerCase() === catName.toLowerCase()) ||
          (p.badges && p.badges.some(b => b.toLowerCase() === catName.toLowerCase()))
        );
        if (catProducts.length === 0) {
          catProducts = products.slice(0, 4);
        }
        if (catProducts.length === 0) return null;
        return (
          <section key={section.id} className="mx-auto max-w-7xl px-4 py-12">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <span className="text-xs uppercase tracking-[0.35em] text-champagne font-semibold block">Department Feature</span>
                <h2 className="mt-2 text-[clamp(1.5rem,4vw,2.25rem)] font-serif font-semibold text-charcoalBrown">{section.title || catName}</h2>
              </div>
              <Link href={`/shop?category=${encodeURIComponent(catName)}`} className="text-champagne text-sm hover:underline flex items-center gap-1.5 font-semibold">
                Browse More <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-1 min-[320px]:grid-cols-2 min-[540px]:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
              {catProducts.slice(0, section.maxProducts || 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        );
      }

      // BUDGET COLLECTIONS
      case "budget": {
        return (
          <section key={section.id} className="mx-auto max-w-7xl px-4 py-12">
            <div className="rounded-[2rem] border border-goldBeige/60 bg-beige p-6 md:p-12 shadow-jewel">
              <span className="text-xs uppercase tracking-[0.35em] text-champagne font-semibold block">Curated Price points</span>
              <h2 className="mt-2 text-[clamp(1.5rem,4vw,2.25rem)] font-serif font-semibold text-charcoalBrown">{section.title}</h2>
              
              <div className="mt-6 sm:mt-8 grid grid-cols-1 min-[480px]:grid-cols-3 gap-3 sm:gap-4">
                {[
                  ["Under ₹199", "under199"],
                  ["Under ₹499", "under499"],
                  ["Under ₹999", "under999"]
                ].map(([label, code]) => (
                  <Link
                    href={`/shop?price=${code}`}
                    key={label}
                    className="rounded-full border border-goldBeige bg-warmwhite px-4 py-3.5 text-center text-xs sm:text-sm font-semibold text-charcoalBrown hover:bg-champagne hover:-translate-y-0.5 transition-all shadow-md block"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      }

      // CUSTOMER REVIEWS
      case "reviews": {
        let reviewList = reviews;
        if (reviewList.length === 0) {
          reviewList = fallbackReviews;
        }
        if (reviewList.length === 0) return null;
        return (
          <section key={section.id} className="mx-auto max-w-7xl px-4 py-12 mb-6">
            <div className="mb-8 text-center">
              <span className="text-xs uppercase tracking-[0.35em] text-champagne font-semibold block">Customer Experiences</span>
              <h2 className="mt-2 text-[clamp(1.5rem,4vw,2.25rem)] font-serif font-semibold text-charcoalBrown">{section.title}</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {reviewList.slice(0, section.maxProducts || 3).map((r) => (
                <div key={r.id} className="rounded-3xl border border-goldBeige/60 bg-warmwhite p-6 shadow-jewel hover:border-champagne/45 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex text-champagne text-sm gap-0.5">
                      {Array.from({ length: r.rating || 5 }).map((_, i) => (
                        <Star key={i} size={14} className="fill-champagne" />
                      ))}
                    </div>
                    <p className="mt-4 text-charcoalBrown/75 leading-relaxed font-sans text-xs italic">“{r.comment}”</p>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between border-t border-goldBeige/30 pt-4">
                    <p className="text-xs font-semibold text-champagne">{r.name}</p>
                    <p className="text-[10px] text-stoneGray/60 uppercase tracking-wider">Verified Buyer</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      }

      // NEWSLETTER SIGNUP
      case "newsletter": {
        return (
          <section key={section.id} className="mx-auto max-w-3xl px-4 py-12 text-center">
            <div className="rounded-[2rem] border border-goldBeige/60 bg-beige p-6 sm:p-8 shadow-jewel">
              <h3 className="text-lg sm:text-xl font-serif font-semibold text-champagne">{section.title}</h3>
              <p className="mt-2 text-[11px] sm:text-xs text-stoneGray max-w-md mx-auto leading-5">Subscribe to our newsletter to receive exclusive discount notifications, VIP events, and product launch news.</p>
              <form 
                onSubmit={(e) => { e.preventDefault(); alert("Successfully joined!"); }}
                className="mt-6 flex max-w-md mx-auto overflow-hidden rounded-full border border-goldBeige bg-warmwhite"
              >
                <input 
                  required
                  type="email"
                  className="w-full bg-transparent px-4 py-3 text-xs outline-none text-charcoalBrown" 
                  placeholder="Email address" 
                />
                <button type="submit" className="bg-champagne px-5 text-xs font-semibold text-charcoalBrown hover:bg-champagne/90 transition-colors">Join</button>
              </form>
            </div>
          </section>
        );
      }

      // SOCIAL PROOF
      case "social-proof": {
        return (
          <section key={section.id} className="mx-auto max-w-7xl px-4 py-12 text-center">
            <span className="text-xs uppercase tracking-[0.35em] text-champagne font-semibold block">Our Certifications</span>
            <h2 className="mt-2 text-[clamp(1.25rem,3.5vw,1.75rem)] font-serif font-semibold text-charcoalBrown mb-8">{section.title}</h2>
            
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                [Truck, "Global Freight Shipping", "Fully insured secure door-to-door delivery worldwide"],
                [ShieldCheck, "100% Quality Authenticated", "Strict multi-point quality check inspections on all shipments"],
                [Gift, "Premium Bespoke Packaging", "Luxury gold foil boxes and premium custom cards included"],
                [Sparkles, "VIP Loyalty Program Rewards", "Earn cashback and early launch previews on purchases"]
              ].map(([Icon, title, text]) => (
                <div key={String(title)} className="rounded-3xl border border-goldBeige/40 bg-warmwhite/60 p-5 hover:bg-warmwhite transition-colors">
                  <Icon className="text-champagne mx-auto" size={24} />
                  <h3 className="mt-4 font-semibold text-charcoalBrown text-sm">{title as string}</h3>
                  <p className="mt-1.5 text-xs text-stoneGray/80 leading-5">{text as string}</p>
                </div>
              ))}
            </div>
          </section>
        );
      }

      default:
        return null;
    }
  };

  return (
    <>
      {/* Hero Banner Slider */}
      <HeroSlider />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Dynamic Sections Grid */}
      <div className="space-y-6">
        {sections.length > 0 ? (
          sections.map((section) => renderSection(section))
        ) : (
          // Default layout fallback if database is empty
          <>
            {renderSection({ id: "def-0", title: "New Arrivals", type: "new-arrivals", isActive: true, order: 0, maxProducts: 4 })}
            {renderSection({ id: "def-1", title: "Best Sellers", type: "best-sellers", isActive: true, order: 1, maxProducts: 4 })}
            {renderSection({ id: "def-2", title: "Explore Premium Categories", type: "category-grid", isActive: true, order: 2, maxProducts: 8 })}
            {renderSection({ id: "def-3", title: "Curated Collections, Smart Prices", type: "budget", isActive: true, order: 3, maxProducts: 4 })}
            {renderSection({ id: "def-4", title: "What Our Customers Say", type: "reviews", isActive: true, order: 4, maxProducts: 3 })}
          </>
        )}
      </div>
    </>
  );
}
