import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getProducts, getBanners, getCategories, getReviews, getSiteContent, getSiteSettings } from "@/lib/firestore";
import { Sparkles, Droplets, Gem, Truck, RotateCcw, ShieldCheck, Lock } from "lucide-react";

export const metadata = {
  title: "Anti Tarnish Jewels — Premium Anti-Tarnish Jewellery",
  description: "Timeless elegance in anti-tarnish jewellery. Shop rings, earrings, necklaces & bracelets crafted for everyday luxury.",
};

export default async function HomePage() {
  const [products, banners, categories, reviews, content, settings] = await Promise.all([
    getProducts(),
    getBanners(),
    getCategories(),
    getReviews(),
    getSiteContent("home"),
    getSiteSettings()
  ]);

  const bestsellers = products.filter(p => p.isBestSeller || (p.rating && p.rating >= 4.5)).slice(0, 8);
  const newArrivals = products.sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()).slice(0, 8);
  const heroBanners = banners.filter((b) => b.placement === "hero-banner" && b.active);
  const promoBanners = banners.filter((b) => b.placement === "homepage-banner" && b.active);

  // Fallback banners if none exist in firestore
  const safeHeroBanners = heroBanners.length >= 3 ? heroBanners : [
    { id: '1', title: 'Rings', subtitle: 'Timeless elegance', imageUrl: '/product-ring.jpg', placement: "hero-banner" as const, createdAt: "", updatedAt: "" },
    { id: '2', title: 'Earrings', subtitle: 'Radiant shine', imageUrl: '/product-earrings.jpg', placement: "hero-banner" as const, createdAt: "", updatedAt: "" },
    { id: '3', title: 'Necklaces', subtitle: 'Everyday luxury', imageUrl: '/product-necklace.jpg', placement: "hero-banner" as const, createdAt: "", updatedAt: "" },
  ];

  // Fallback categories if empty
  const safeCategories = categories.length >= 5 ? categories : [
    { name: "Rings", slug: "rings", image: "/product-ring.jpg" },
    { name: "Earrings", slug: "earrings", image: "/product-earrings.jpg" },
    { name: "Necklaces", slug: "necklaces", image: "/product-necklace.jpg" },
    { name: "Bracelets", slug: "bracelets", image: "/product-bracelet.jpg" },
    { name: "Daily Wear", slug: "daily-wear", image: "/hero-showroom.jpg" },
  ];

  const catRing = safeCategories.find(c => c.slug.toLowerCase().includes('ring')) || safeCategories[0];
  const catEar = safeCategories.find(c => c.slug.toLowerCase().includes('earring')) || safeCategories[1];
  const catNeck = safeCategories.find(c => c.slug.toLowerCase().includes('necklace')) || safeCategories[2];
  const catBrac = safeCategories.find(c => c.slug.toLowerCase().includes('bracelet')) || safeCategories[3];
  const catDaily = safeCategories.find(c => c.slug.toLowerCase().includes('daily')) || safeCategories[4];

  // Fallback reviews
  const safeReviews = reviews.length > 0 ? reviews : [
    { id: '1', name: "Priya S.", initial: "P", color: "#FBCFE8", text: "Absolutely stunning pieces! I've been wearing my necklace daily, even in the shower, and it hasn't lost its shine." },
    { id: '2', name: "Ananya M.", initial: "A", color: "#FCE7F3", text: "The quality is unmatched. These earrings look exactly like real solid gold but for a fraction of the price." },
    { id: '3', name: "Neha R.", initial: "N", color: "#F9A8D4", text: "Fast delivery and beautiful packaging. The rings are true to size and so elegant." }
  ];

  const heroSmallTitle = content?.heroSmallTitle || "Premium Anti-Tarnish Collection";
  const heroMainHeading = content?.heroMainHeading || content?.heroTitle || "Timeless Elegance";
  
  // Split title if possible, or just render it
  const titleWords = heroMainHeading.split(" ");
  const titleFirstPart = titleWords.length > 1 ? titleWords.slice(0, -1).join(" ") : heroMainHeading;
  const titleLastPart = titleWords.length > 1 ? titleWords[titleWords.length - 1] : "";

  const heroSubtitle = content?.heroSubtitle || "Discover jewellery that stays as radiant as you. Crafted with anti-tarnish technology for everyday luxury.";
  const heroCtaText = content?.heroCtaText || "Shop Collection";
  const heroCtaLink = content?.heroCtaLink || "/shop";
  const promotionalText = content?.promotionalText || "Discover our new premium collection.";

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-4">
        {/* soft floating decorations */}
        <div className="pointer-events-none absolute inset-0 select-none opacity-20">
        </div>

        <div className="absolute inset-0 z-0">
          <img
            src="/hero-showroom.jpg"
            alt=""
            className="h-full w-full object-cover opacity-20"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(253,242,248,0.8) 0%, rgba(252,231,243,0.6) 50%, rgba(250,240,230,0.95) 100%)" }}
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="mb-10 text-center">
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-stoneGray sm:text-sm">
              {heroSmallTitle}
            </p>
            <h1 className="mb-6 font-serif text-5xl leading-tight text-charcoalBrown md:text-7xl lg:text-8xl">
              {titleFirstPart}<br />
              <span className="gold-text italic">{titleLastPart}</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-base text-stoneGray md:text-xl">
              {heroSubtitle}
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <Link href={heroCtaLink} className="btn-primary-gold px-8 py-4 text-base md:text-lg shadow-xl shadow-pink-900/10 hover:shadow-pink-900/20">
                {heroCtaText}
              </Link>
              <Link href="/shop?category=daily-wear" className="btn-liquid px-8 py-4 text-base md:text-lg">
                Daily Wear
              </Link>
            </div>
            
            <div className="mt-8 flex justify-center">
              <div className="glass-premium flex items-center gap-3 rounded-full px-5 py-2 shadow-sm border border-white/60 mx-auto max-w-max">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-beige/50 text-stoneGray text-xs">✨</span>
                <p className="text-sm font-medium text-pink-950">{promotionalText} <Link href="/sale" className="underline hover:text-stoneGray font-semibold ml-1">Shop Sale</Link></p>
              </div>
            </div>
          </div>

          {/* Mobile Hero Cards (Compact) */}
          <div className="mt-10 grid grid-cols-3 gap-2 sm:gap-3 md:hidden">
            {safeHeroBanners.slice(0, 3).map((b, i) => (
              <Link
                key={b.id || i}
                href={`/shop?category=${b.title?.toLowerCase()}`}
                className={`relative h-36 sm:h-44 overflow-hidden rounded-2xl shadow-sm border border-white/40 transition hover:-translate-y-1 ${
                  i === 1 ? "-translate-y-2" : ""
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-pink-950/90 via-pink-900/20 to-transparent z-10" />
                <img src={b.imageUrl || (b as any).image || "/product-stack.jpg"} alt={b.title} className="h-full w-full absolute inset-0 object-cover" />
                <div className="relative z-20 h-full w-full flex flex-col justify-end p-2.5 sm:p-3">
                  <h3 className="font-serif text-sm sm:text-base text-white drop-shadow-md leading-tight">{b.title}</h3>
                  <p className="text-[10px] sm:text-xs text-pink-100 drop-shadow-md leading-tight mt-0.5 opacity-90">{b.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* floating hero cards — visible from md up so mobile stays clean */}
          <div className="relative mt-4 hidden h-72 md:block lg:h-96">
            {safeHeroBanners.slice(0, 3).map((b, i) => {
              const positions = [
                { top: "0%", left: "6%", width: "220px", anim: "float-anim" },
                { top: "18%", left: "36%", width: "240px", anim: "float-slow" },
                { top: "8%", right: "6%", width: "220px", anim: "float-reverse" },
              ] as const;
              const pos = positions[i];
              const style: React.CSSProperties = {
                top: pos.top,
                width: pos.width,
                ...(("left" in pos) ? { left: pos.left } : { right: pos.right }),
              };
              return (
                <Link
                  key={b.id || i}
                  href={`/shop?category=${b.title?.toLowerCase()}`}
                  className={`absolute cursor-pointer overflow-hidden rounded-2xl shadow-sm border border-white/40 transition hover:z-10 hover:-translate-y-2 hover:scale-105 hover:shadow-md ${pos.anim}`}
                  style={style}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2C2121]/80 via-[#2C2121]/20 to-transparent z-10" />
                  <img src={b.imageUrl || (b as any).image || "/product-stack.jpg"} alt={b.title} className="h-full w-full absolute inset-0 object-cover" />
                  <div className="relative z-20 h-full w-full flex flex-col justify-end p-4">
                    <h3 className="font-serif text-lg text-white drop-shadow-md">{b.title}</h3>
                    <p className="text-xs text-pink-100 drop-shadow-md">{b.subtitle}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* SHOP BY CATEGORY (bento) */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="mb-3 font-serif text-3xl text-charcoalBrown md:text-5xl">Shop by Category</h2>
          <p className="text-stoneGray">Find your perfect piece</p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4">
          <CategoryTile category={catRing} className="col-span-1 h-48 sm:h-64 md:h-80" featured />
          <CategoryTile category={catEar} className="col-span-1 h-48 sm:h-64 md:h-80" />
          <CategoryTile category={catNeck} className="col-span-1 h-48 sm:h-64 md:h-80" />
          <CategoryTile category={catBrac} className="col-span-1 h-48 sm:h-64 md:h-80" />
          <CategoryTile category={catDaily} className="col-span-2 md:col-span-4 lg:col-span-1 h-48 sm:h-64 md:h-80" />
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeader title="Bestsellers" subtitle="Most loved by our customers" ctaTo="/shop" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {bestsellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* WHY ANTI-TARNISH */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="glass-premium border border-white/60 rounded-3xl p-6 md:p-12">
          <div className="mb-10 text-center">
            <h2 className="mb-3 font-serif text-3xl text-charcoalBrown md:text-5xl">Why Anti-Tarnish?</h2>
            <p className="mx-auto max-w-2xl text-stoneGray">
              Our jewellery is crafted with advanced anti-tarnish technology so your favourite pieces stay radiant for years.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            <Benefit icon={<Sparkles className="h-8 w-8" />} title="Long-Lasting Shine" text="Maintains its brilliance for years without polishing." />
            <Benefit icon={<Droplets className="h-8 w-8" />} title="Water Resistant" text="Wear it in the shower, pool or rain without worry." />
            <Benefit icon={<Gem className="h-8 w-8" />} title="Hypoallergenic" text="Safe for sensitive skin — nickel-free formula." />
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeader title="New Arrivals" subtitle="Fresh additions to our collection" ctaTo="/shop" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="mb-3 font-serif text-3xl text-charcoalBrown md:text-5xl">Loved by Thousands</h2>
          <div className="mb-1 flex items-center justify-center gap-2">
            <span className="text-2xl" style={{ color: "#D4AF37" }}>★★★★★</span>
            <span className="font-semibold text-stoneGray">4.9/5</span>
          </div>
          <p className="text-stoneGray">Based on 2,847 reviews</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {safeReviews.slice(0, 3).map((r) => (
            <div key={r.id} className="glass-premium rounded-2xl p-6 border border-white/60">
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full font-bold text-white"
                  style={{ background: r.color || "#FBCFE8" }}
                >{r.initial || r.name?.charAt(0) || "U"}</div>
                <div>
                  <h4 className="font-semibold text-charcoalBrown">{r.name}</h4>
                  <div className="text-sm" style={{ color: "#D4AF37" }}>★★★★★</div>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-stoneGray">"{r.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <Trust icon={<Truck className="h-6 w-6" />} title="Free Delivery" sub="Above ₹999" />
          <Trust icon={<RotateCcw className="h-6 w-6" />} title="7-Day Returns" sub="Easy exchange" />
          <Trust icon={<ShieldCheck className="h-6 w-6" />} title="Anti-Tarnish" sub="Verified quality" />
          <Trust icon={<Lock className="h-6 w-6" />} title="Secure Payment" sub="COD available" />
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="glass-premium border border-white/60 mx-auto max-w-3xl rounded-3xl p-8 text-center md:p-12">
          <h2 className="mb-3 font-serif text-3xl text-charcoalBrown md:text-4xl">Join our list</h2>
          <p className="mb-6 text-stoneGray">Get 10% off your first order and early access to new drops.</p>
          <form
            className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              placeholder="your@email.com"
              className="neo-input w-full px-4 py-3 text-sm"
              required
            />
            <button type="submit" className="btn-primary-gold px-6">Subscribe</button>
          </form>
        </div>
      </section>
    </>
  );
}

function SectionHeader({ title, subtitle, ctaTo }: { title: string; subtitle: string; ctaTo: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="mb-1 font-serif text-3xl text-charcoalBrown md:text-5xl">{title}</h2>
        <p className="text-sm text-stoneGray md:text-base">{subtitle}</p>
      </div>
      <Link href={ctaTo} className="btn-liquid hidden md:inline-flex">View All</Link>
    </div>
  );
}

function CategoryTile({
  category, className, featured = false,
}: { category: any; className?: string; featured?: boolean }) {
  if (!category) return null;
  
  // Provide beautiful fallback images based on category name if none exists in Firestore
  const fallbackImages: Record<string, string> = {
    ring: "/product-ring.jpg",
    earring: "/product-earrings.jpg",
    necklace: "/product-necklace.jpg",
    bracelet: "/product-bracelet.jpg",
    bangle: "/product-bracelet.jpg",
    daily: "/hero-showroom.jpg",
    bridal: "/product-stack.jpg",
  };

  let imageSrc = category.image || category.imageUrl;
  if (!imageSrc) {
    const nameLower = (category.name || "").toLowerCase();
    const matchedKey = Object.keys(fallbackImages).find(k => nameLower.includes(k));
    imageSrc = matchedKey ? fallbackImages[matchedKey] : "/hero-showroom.jpg";
  }

  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className={`category-card relative block cursor-pointer overflow-hidden rounded-2xl ${className ?? ""}`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[#2C2121]/80 via-[#2C2121]/20 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-90" />
      <img src={imageSrc} alt={category.name} className="h-full w-full absolute inset-0 object-cover transition-transform duration-700 hover:scale-105" />
      <div className="absolute bottom-3 left-4 z-10 text-white">
        <h3 className={`relative z-20 font-serif drop-shadow-md ${featured ? "text-xl sm:text-2xl md:text-3xl" : "text-lg sm:text-xl"}`}>{category.name}</h3>
        <p className="relative z-20 text-xs opacity-90 drop-shadow-md">Explore collection</p>
      </div>
    </Link>
  );
}

function Benefit({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="glass-premium rounded-2xl p-6 border border-white/60 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-beige text-[color:var(--color-gold)]">{icon}</div>
      <h3 className="mb-2 font-serif text-xl text-[color:var(--color-espresso)]">{title}</h3>
      <p className="text-sm text-[color:var(--color-muted-text)] leading-relaxed">{text}</p>
    </div>
  );
}

function Trust({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="glass-premium p-5 rounded-2xl flex flex-col items-center border border-white/60 justify-center text-center shadow-sm transition hover:bg-white hover:-translate-y-1 hover:shadow-md">
      <div className="mb-3 flex justify-center text-[color:var(--color-gold)]">{icon}</div>
      <h4 className="text-[13px] sm:text-sm font-semibold text-[color:var(--color-espresso)] uppercase tracking-wider">{title}</h4>
      <p className="mt-1 text-xs text-[color:var(--color-muted-text)]">{sub}</p>
    </div>
  );
}
