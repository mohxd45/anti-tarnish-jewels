const fs = require('fs');

const pageContent = `"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { getProducts, getCategories, getBanners } from "@/lib/firestore";
import { Product } from "@/types";
import { ArrowRight, Sparkles, Droplets, Shield, Gem } from "lucide-react";

export default function Home() {
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [heroBanners, setHeroBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prods, cats, bans] = await Promise.all([
          getProducts(),
          getCategories(),
          getBanners()
        ]);
        
        // Products
        const published = prods.filter(p => p.status === "published" || p.status === "active");
        setBestsellers(published.slice(0, 4));
        setNewArrivals(published.slice(4, 8));

        // Categories
        if (cats && cats.length > 0) {
          setCategories(cats.filter(c => c.isActive !== false));
        }

        // Hero Banners
        if (bans && bans.length > 0) {
          const floating = bans.filter(b => b.placement === "hero" || b.placement === "hero-floating").slice(0, 3);
          setHeroBanners(floating);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const resolveBannerLink = (banner: any) => {
    if (banner.linkType === 'external' && banner.link) return banner.link;
    if (banner.linkType === 'category' && banner.categoryId) return \`/shop?category=\${banner.categoryId}\`;
    if (banner.linkType === 'product' && banner.productId) return \`/product/\${banner.productId}\`;
    if (banner.linkType === 'banner-page' && banner.slug) return \`/offers/\${banner.slug}\`;
    return '/shop';
  };

  return (
    <div className="bg-[var(--noir)] min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Visuals */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-[var(--pink-200)] rounded-full mix-blend-multiply filter blur-3xl opacity-50 float-anim"></div>
          <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-[var(--gold-light)] rounded-full mix-blend-multiply filter blur-3xl opacity-30 float-reverse"></div>
        </div>

        {/* Decorative Rings */}
        <div className="deco-ring w-96 h-96 border-[1px] border-[var(--gold)] rounded-full top-[10%] -left-20"></div>
        <div className="deco-ring w-[500px] h-[500px] border-[1px] border-[var(--rose)] rounded-full -bottom-40 -right-20"></div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16 md:mt-0">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full glass border-[var(--gold)]">
            <span className="text-[var(--gold-dark)] text-sm font-semibold tracking-widest uppercase">Premium Anti-Tarnish Jewellery</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-[var(--ink)] leading-[1.1] mb-6 drop-shadow-sm font-medium">
            Radiance That <br/><span className="italic text-[var(--rose)] font-light">Lasts Forever</span>
          </h1>
          <p className="text-[var(--stoneGray)] text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium">
            Discover waterproof, sweatproof, and life-proof luxury pieces designed for your everyday elegance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/shop" className="btn-primary w-full sm:w-auto text-lg shadow-glow">
              Explore Collection
            </Link>
          </div>
        </div>

        {/* Floating Hero Cards */}
        {heroBanners.length > 0 && (
          <div className="hidden lg:block absolute inset-0 pointer-events-none z-20">
            {heroBanners.map((banner, idx) => (
              <Link 
                key={banner.id}
                href={resolveBannerLink(banner)}
                className={\`hero-float-card pointer-events-auto shadow-glass \${
                  idx === 0 ? "right-[15%] top-[20%] w-48 float-anim" :
                  idx === 1 ? "left-[12%] top-[35%] w-56 float-reverse" :
                  "right-[10%] bottom-[20%] w-60 float-slow"
                }\`}
              >
                <div className="glass-dark p-3 pb-4 border-[var(--glass-border)]">
                  <div className="aspect-[4/5] rounded-xl overflow-hidden mb-3">
                    <Image src={banner.imageUrl || '/product-ring.jpg'} alt={banner.title} width={300} height={400} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-display text-lg text-[var(--ink)] font-semibold mb-1 text-center line-clamp-1">{banner.title}</h3>
                  {banner.subtitle && <p className="text-[var(--stoneGray)] text-xs text-center uppercase tracking-wider">{banner.subtitle}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Categories Bento Grid */}
      <section id="categories" className="py-20 md:py-32 bg-[var(--charcoal)] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-display text-4xl md:text-5xl text-[var(--ink)] font-medium mb-4">Shop by Category</h2>
              <p className="text-[var(--stoneGray)] max-w-xl">Curated collections for every occasion.</p>
            </div>
            <Link href="/shop" className="hidden md:flex items-center gap-2 text-[var(--rose)] hover:text-[var(--ink)] font-semibold transition-colors">
              View All <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 auto-rows-[200px] sm:auto-rows-[250px] md:auto-rows-[300px]">
            {categories.slice(0, 5).map((cat, i) => (
              <Link 
                key={cat.id} 
                href={\`/shop?category=\${cat.slug}\`}
                className={\`category-card block shadow-sm \${i === 0 ? "col-span-2 row-span-2 lg:col-span-2 lg:row-span-2" : i === 3 ? "col-span-2 lg:col-span-2" : ""}\`}
              >
                <Image src={cat.imageUrl || cat.bannerUrl || "/product-stack.jpg"} alt={cat.name} width={600} height={600} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 z-10">
                  <h3 className="font-display text-2xl md:text-3xl text-white font-medium drop-shadow-md">{cat.name}</h3>
                  <span className="inline-flex items-center gap-2 text-white/90 text-sm mt-2 font-medium">Explore <ArrowRight className="w-4 h-4" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-20 bg-[var(--noir)] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl text-[var(--ink)] font-medium mb-4">Bestsellers</h2>
            <p className="text-[var(--stoneGray)]">Most loved by our radiant community.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {loading ? (
              [...Array(4)].map((_, i) => <div key={i} className="aspect-[4/5] bg-[var(--pink-100)] animate-pulse rounded-2xl" />)
            ) : (
              bestsellers.map(product => <ProductCard key={product.id} product={product} />)
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-[var(--noir)] relative overflow-hidden">
        <div className="absolute inset-0 velvet-bg opacity-30 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="trust-badge glass-dark">
              <div className="w-16 h-16 rounded-full bg-[var(--gold-light)] flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Shield className="w-8 h-8 text-[var(--ink)]" />
              </div>
              <h3 className="font-display text-2xl text-[var(--ink)] font-semibold mb-3">Anti-Tarnish Guarantee</h3>
              <p className="text-[var(--stoneGray)] leading-relaxed">Our advanced coating ensures your jewelry stays radiant, never turning your skin green.</p>
            </div>
            
            <div className="trust-badge glass-dark translate-y-0 md:translate-y-8">
              <div className="w-16 h-16 rounded-full bg-[var(--pink-200)] flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Droplets className="w-8 h-8 text-[var(--ink)]" />
              </div>
              <h3 className="font-display text-2xl text-[var(--ink)] font-semibold mb-3">Water & Sweat Proof</h3>
              <p className="text-[var(--stoneGray)] leading-relaxed">Wear it in the shower, at the gym, or in the pool. Crafted for your active lifestyle.</p>
            </div>
            
            <div className="trust-badge glass-dark">
              <div className="w-16 h-16 rounded-full bg-[var(--gold-light)] flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Gem className="w-8 h-8 text-[var(--ink)]" />
              </div>
              <h3 className="font-display text-2xl text-[var(--ink)] font-semibold mb-3">Hypoallergenic</h3>
              <p className="text-[var(--stoneGray)] leading-relaxed">Nickel-free, lead-free materials that are gentle and safe for even the most sensitive skin.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
`;

fs.writeFileSync('app/page.tsx', pageContent);
