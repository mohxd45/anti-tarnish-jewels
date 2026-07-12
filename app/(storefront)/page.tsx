import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getProducts, getBanners, getCategories, getReviews, getSiteContent, getSiteSettings, getAnnouncements } from "@/lib/firestore";
import { Sparkles, Droplets, Gem, Truck, RotateCcw, ShieldCheck, Lock } from "lucide-react";
import { HomepageFlashSaleBanner } from "@/components/storefront/HomepageFlashSaleBanner";

export const metadata = {
  title: "Anti Tarnish Jewels — Premium Anti-Tarnish Jewellery",
  description: "Timeless elegance in anti-tarnish jewellery. Shop rings, earrings, necklaces & bracelets crafted for everyday luxury.",
};

export default async function HomePage() {
  const [products, banners, categories, reviews, content, settings, announcements] = await Promise.all([
    getProducts(),
    getBanners(),
    getCategories(),
    getReviews(),
    getSiteContent("home"),
    getSiteSettings(),
    getAnnouncements()
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
      <section className="relative flex min-h-[80vh] md:min-h-[85vh] items-center justify-center overflow-hidden px-4">
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

        <div className="relative z-10 mx-auto w-full max-w-7xl pt-10 md:pt-0">
          <div className="mb-8 md:mb-10 text-center">
            <p className="mb-2 md:mb-4 text-[10px] md:text-xs font-medium uppercase tracking-widest text-stoneGray sm:text-sm">
              {heroSmallTitle}
            </p>
            <h1 className="mb-3 md:mb-6 font-serif text-4xl leading-tight text-charcoalBrown md:text-7xl lg:text-8xl">
              {titleFirstPart}<br />
              <span className="gold-text italic">{titleLastPart}</span>
            </h1>
            <p className="mx-auto mb-6 md:mb-8 max-w-2xl text-sm text-stoneGray md:text-xl px-4 md:px-0">
              {heroSubtitle}
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4 px-4 md:px-0">
              <Link href={heroCtaLink} className="btn-primary-gold px-6 md:px-8 py-3 md:py-4 text-sm md:text-lg shadow-xl shadow-pink-900/10 hover:shadow-pink-900/20">
                {heroCtaText}
              </Link>
              <Link href="/shop?category=daily-wear" className="btn-liquid px-6 md:px-8 py-3 md:py-4 text-sm md:text-lg">
                Daily Wear
              </Link>
            </div>
            
            <div className="mt-6 md:mt-8 flex justify-center">
              <div className="glass-premium flex items-center gap-2 md:gap-3 rounded-full px-4 py-2 md:px-5 md:py-2 shadow-sm border border-white/60 mx-auto max-w-max">
                <span className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-stone-50/50 text-stoneGray text-[10px] md:text-xs">✨</span>
                <p className="text-xs md:text-sm font-medium text-stone-900">{promotionalText} <Link href="/sale" className="underline hover:text-stoneGray font-semibold ml-1">Shop Sale</Link></p>
              </div>
            </div>
          </div>

          {/* Mobile Hero Cards (Compact) */}
          <div className="mt-6 md:mt-10 grid grid-cols-3 gap-2 sm:gap-3 md:hidden px-1">
            {safeHeroBanners.slice(0, 3).map((b, i) => (
              <Link
                key={b.id || i}
                href={`/shop?category=${b.title?.toLowerCase()}`}
                className={`relative h-28 sm:h-36 overflow-hidden rounded-xl shadow-sm border border-white/40 transition hover:-translate-y-1 ${
                  i === 1 ? "-translate-y-2" : ""
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-pink-950/90 via-pink-900/20 to-transparent z-10" />
                <img src={b.imageUrl || (b as any).image || "/product-stack.jpg"} alt={b.title} className="h-full w-full absolute inset-0 object-cover" />
                <div className="relative z-20 h-full w-full flex flex-col justify-end p-2 sm:p-2.5">
                  <h3 className="font-serif text-[13px] sm:text-sm text-white drop-shadow-md leading-tight">{b.title}</h3>
                  <p className="text-[9px] sm:text-[10px] text-stone-100 drop-shadow-md leading-tight mt-0.5 opacity-90 line-clamp-1">{b.subtitle}</p>
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
                    <p className="text-xs text-stone-100 drop-shadow-md">{b.subtitle}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FLASH SALE BANNER (below hero on both mobile and desktop) */}
      <HomepageFlashSaleBanner settings={announcements} />

      {/* SHOP BY CATEGORY (bento) */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:py-16">
        <div className="mb-6 md:mb-10 text-center">
          <h2 className="mb-1 md:mb-3 font-serif text-2xl md:text-5xl text-charcoalBrown">Shop by Category</h2>
          <p className="text-xs md:text-base text-stoneGray">Find your perfect piece</p>
        </div>
        <div className="grid grid-cols-2 gap-2 md:gap-4 md:grid-cols-4 lg:grid-cols-5">
          <CategoryTile category={catRing} className="col-span-1 h-36 sm:h-64 md:h-80" featured />
          <CategoryTile category={catEar} className="col-span-1 h-36 sm:h-64 md:h-80" />
          <CategoryTile category={catNeck} className="col-span-1 h-36 sm:h-64 md:h-80" />
          <CategoryTile category={catBrac} className="col-span-1 h-36 sm:h-64 md:h-80" />
          <CategoryTile category={catDaily} className="col-span-2 md:col-span-4 lg:col-span-1 h-36 sm:h-64 md:h-80" />
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <SectionHeader title="Bestsellers" subtitle="Most loved by our customers" ctaTo="/shop" />
        <div className="flex overflow-x-auto gap-3 md:grid md:grid-cols-3 md:gap-6 lg:grid-cols-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden -mx-4 px-4 md:mx-0 md:px-0 pb-4 md:pb-0">
          {bestsellers.map((p) => (
            <div key={p.id} className="min-w-[45vw] sm:min-w-[40vw] md:min-w-0 snap-start">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <SectionHeader title="New Arrivals" subtitle="Fresh additions to our collection" ctaTo="/shop" />
        <div className="flex overflow-x-auto gap-3 md:grid md:grid-cols-3 md:gap-6 lg:grid-cols-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden -mx-4 px-4 md:mx-0 md:px-0 pb-4 md:pb-0">
          {newArrivals.map((p) => (
            <div key={p.id} className="min-w-[45vw] sm:min-w-[40vw] md:min-w-0 snap-start">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      {/* WHY ANTI-TARNISH (Compact Strip on Mobile) */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:py-16">
        <div className="glass-premium border border-white/60 rounded-2xl md:rounded-3xl p-4 md:p-12">
          <div className="mb-4 md:mb-10 text-center">
            <h2 className="mb-1 md:mb-3 font-serif text-xl md:text-5xl text-charcoalBrown">Why Anti-Tarnish?</h2>
            <p className="mx-auto max-w-2xl text-[10px] md:text-base text-stoneGray hidden md:block">
              Our jewellery is crafted with advanced anti-tarnish technology so your favourite pieces stay radiant for years.
            </p>
          </div>
          {/* Mobile: 1 horizontal swipeable strip | Desktop: 1 row of 3 */}
          <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-2 md:gap-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
            <div className="min-w-[40vw] snap-start col-span-1">
              <Benefit icon={<Sparkles className="h-4 w-4 md:h-8 md:w-8" />} title="Long-Lasting Shine" text="Maintains brilliance." />
            </div>
            <div className="min-w-[40vw] snap-start col-span-1">
              <Benefit icon={<Droplets className="h-4 w-4 md:h-8 md:w-8" />} title="Water Resistant" text="Wear it in shower/pool." />
            </div>
            <div className="min-w-[40vw] snap-start col-span-1">
              <Benefit icon={<Gem className="h-4 w-4 md:h-8 md:w-8" />} title="Hypoallergenic" text="Nickel-free formula." />
            </div>
            <div className="min-w-[40vw] snap-start col-span-1 md:hidden">
              <Benefit icon={<ShieldCheck className="h-4 w-4" />} title="Verified Quality" text="Premium materials." />
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:py-16">
        <div className="mb-6 md:mb-10 text-center">
          <h2 className="mb-1 md:mb-3 font-serif text-2xl md:text-5xl text-charcoalBrown">Loved by Thousands</h2>
          <div className="mb-1 flex items-center justify-center gap-2">
            <span className="text-lg md:text-2xl" style={{ color: "#D4AF37" }}>★★★★★</span>
            <span className="text-xs md:text-base font-semibold text-stoneGray">4.9/5</span>
          </div>
        </div>
        {/* Mobile: horizontal scroll | Desktop: grid */}
        <div className="flex overflow-x-auto gap-3 md:grid md:grid-cols-3 md:gap-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden -mx-4 px-4 md:mx-0 md:px-0 pb-4 md:pb-0">
          {safeReviews.slice(0, 3).map((r) => (
            <div key={r.id} className="min-w-[75vw] sm:min-w-[60vw] md:min-w-0 snap-start glass-premium rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/60">
              <div className="mb-3 md:mb-4 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full font-bold text-white text-sm md:text-base"
                  style={{ background: r.color || "#FBCFE8" }}
                >{r.initial || r.name?.charAt(0) || "U"}</div>
                <div>
                  <h4 className="text-sm md:text-base font-semibold text-charcoalBrown">{r.name}</h4>
                  <div className="text-xs md:text-sm" style={{ color: "#D4AF37" }}>★★★★★</div>
                </div>
              </div>
              <p className="text-xs md:text-sm leading-relaxed text-stoneGray">"{r.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="grid grid-cols-2 gap-2 md:gap-4 md:grid-cols-4">
          <Trust icon={<Truck className="h-4 w-4 md:h-6 md:w-6" />} title="Free Delivery" sub="Above ₹999" />
          <Trust icon={<RotateCcw className="h-4 w-4 md:h-6 md:w-6" />} title="7-Day Returns" sub="Easy exchange" />
          <Trust icon={<ShieldCheck className="h-4 w-4 md:h-6 md:w-6" />} title="Anti-Tarnish" sub="Verified quality" />
          <Trust icon={<Lock className="h-4 w-4 md:h-6 md:w-6" />} title="Secure Payment" sub="COD available" />
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:py-16">
        <div className="glass-premium border border-white/60 mx-auto max-w-3xl rounded-2xl md:rounded-3xl p-6 md:p-12 text-center">
          <h2 className="mb-2 md:mb-3 font-serif text-2xl md:text-4xl text-charcoalBrown">Join our list</h2>
          <p className="mb-5 md:mb-6 text-xs md:text-base text-stoneGray">Get 10% off your first order and early access to new drops.</p>
          <form
            className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              placeholder="your@email.com"
              className="neo-input w-full px-4 py-2.5 md:py-3 text-sm"
              required
            />
            <button type="submit" className="btn-primary-gold px-6 py-2.5 md:py-3 text-sm">Subscribe</button>
          </form>
        </div>
      </section>
    </>
  );
}

function SectionHeader({ title, subtitle, ctaTo }: { title: string; subtitle: string; ctaTo: string }) {
  return (
    <div className="mb-4 md:mb-8 flex flex-row items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="mb-1 font-serif text-xl md:text-5xl text-charcoalBrown">{title}</h2>
        <p className="text-[10px] text-stoneGray md:text-base hidden sm:block">{subtitle}</p>
      </div>
      <Link href={ctaTo} className="text-xs md:text-sm font-semibold underline text-stoneGray hover:text-charcoalBrown whitespace-nowrap md:btn-liquid md:no-underline md:inline-flex">View All</Link>
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
      className={`category-card relative block cursor-pointer overflow-hidden rounded-xl md:rounded-2xl ${className ?? ""}`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[#2C2121]/80 via-[#2C2121]/20 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-90" />
      <img src={imageSrc} alt={category.name} className="h-full w-full absolute inset-0 object-cover transition-transform duration-700 hover:scale-105" />
      <div className="absolute bottom-2 left-2 md:bottom-3 md:left-4 z-10 text-white">
        <h3 className={`relative z-20 font-serif drop-shadow-md leading-tight ${featured ? "text-lg sm:text-2xl md:text-3xl" : "text-sm sm:text-xl"}`}>{category.name}</h3>
        <p className="relative z-20 text-[10px] md:text-xs opacity-90 drop-shadow-md mt-0.5 hidden sm:block">Explore</p>
      </div>
    </Link>
  );
}

function Benefit({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="glass-premium rounded-xl md:rounded-2xl p-3 md:p-6 border border-white/60 text-center flex flex-col items-center justify-center shadow-sm transition hover:-translate-y-1 hover:shadow-md h-full">
      <div className="mb-2 md:mb-4 inline-flex h-8 w-8 md:h-14 md:w-14 items-center justify-center rounded-full bg-stone-50 text-[color:var(--color-gold)]">{icon}</div>
      <h3 className="mb-1 md:mb-2 font-serif text-[11px] md:text-xl text-[color:var(--color-espresso)] leading-tight">{title}</h3>
      <p className="text-[9px] md:text-sm text-[color:var(--color-muted-text)] leading-tight hidden md:block">{text}</p>
    </div>
  );
}

function Trust({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="glass-premium p-3 md:p-5 rounded-xl md:rounded-2xl flex flex-col items-center border border-white/60 justify-center text-center shadow-sm transition hover:bg-white hover:-translate-y-1 hover:shadow-md h-full">
      <div className="mb-1.5 md:mb-3 flex justify-center text-[color:var(--color-gold)]">{icon}</div>
      <h4 className="text-[9px] sm:text-sm font-semibold text-[color:var(--color-espresso)] uppercase tracking-wider leading-tight">{title}</h4>
      <p className="mt-0.5 md:mt-1 text-[8px] md:text-xs text-[color:var(--color-muted-text)] leading-tight hidden sm:block">{sub}</p>
    </div>
  );
}
