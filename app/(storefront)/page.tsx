import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getProducts, getBanners, getCategories, getReviews, getSiteContent, getSiteSettings, getAnnouncements } from "@/lib/firestore";
import { Sparkles, Droplets, Gem, Truck, RotateCcw, ShieldCheck, Lock } from "lucide-react";
import { HomepageFlashSaleBanner } from "@/components/storefront/HomepageFlashSaleBanner";
import { AnnouncementTicker } from "@/components/storefront/AnnouncementTicker";

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

  const safePromoBanners = promoBanners.length > 0 ? promoBanners : [
    { id: 'p1', title: 'Premium Anti-Tarnish', subtitle: 'Discover the new collection', imageUrl: '/hero-showroom.jpg', placement: "homepage-banner" as const, createdAt: "", updatedAt: "", link: "/shop" }
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

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .global-announcement-ticker { display: none !important; }
        }
      `}</style>
      
      <div className="-mt-12 md:mt-0">
        <div className="block md:hidden">
          <HomepageFlashSaleBanner settings={announcements} />
        </div>

        <div className="block md:hidden w-full overflow-x-auto [&::-webkit-scrollbar]:hidden py-3 px-4 bg-white border-b border-stone-100">
          <div className="flex gap-2 min-w-max">
            <Link href="/shop" className="px-4 py-1.5 rounded-full border border-stone-200 text-[11px] font-medium text-stone-700 whitespace-nowrap hover:bg-stone-50">All Jewelry</Link>
            <Link href="/shop?category=earrings" className="px-4 py-1.5 rounded-full border border-stone-200 text-[11px] font-medium text-stone-700 whitespace-nowrap hover:bg-stone-50">Earrings</Link>
            <Link href="/shop?category=necklaces" className="px-4 py-1.5 rounded-full border border-stone-200 text-[11px] font-medium text-stone-700 whitespace-nowrap hover:bg-stone-50">Necklaces</Link>
            <Link href="/shop?category=rings" className="px-4 py-1.5 rounded-full border border-stone-200 text-[11px] font-medium text-stone-700 whitespace-nowrap hover:bg-stone-50">Rings</Link>
            <Link href="/shop?category=bracelets" className="px-4 py-1.5 rounded-full border border-stone-200 text-[11px] font-medium text-stone-700 whitespace-nowrap hover:bg-stone-50">Bracelets</Link>
          </div>
        </div>

        <div className="block md:hidden">
          <AnnouncementTicker className="relative z-40 w-full" />
        </div>
      </div>

      <section className="relative flex min-h-[70vh] md:min-h-[85vh] items-center justify-center overflow-hidden px-4">
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
          <div className="mb-6 md:mb-10 text-center">
            <p className="mb-2 md:mb-4 text-[10px] md:text-xs font-medium uppercase tracking-widest text-stoneGray sm:text-sm">
              {heroSmallTitle}
            </p>
            <h1 className="mb-3 md:mb-6 font-serif text-4xl leading-tight text-charcoalBrown md:text-7xl lg:text-8xl">
              {titleFirstPart}<br />
              <span className="gold-text italic">{titleLastPart}</span>
            </h1>
            <p className="mx-auto mb-6 md:mb-8 max-w-2xl text-xs sm:text-sm text-stoneGray md:text-xl px-4 md:px-0">
              {heroSubtitle}
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4 px-4 md:px-0">
              <Link href={heroCtaLink} className="btn-primary-gold px-6 md:px-8 py-3 md:py-4 text-sm md:text-lg shadow-xl shadow-pink-900/10 hover:shadow-pink-900/20">
                {heroCtaText}
              </Link>
            </div>
          </div>

          <div className="mt-6 md:mt-10 md:hidden w-full overflow-hidden">
            <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden -mx-4 px-4 pb-4">
              {safeHeroBanners.map((b, i) => (
                <div key={b.id || i} className="min-w-[85vw] sm:min-w-[70vw] snap-center shrink-0">
                  <Link
                    href={`/shop?category=${b.title?.toLowerCase()}`}
                    className="relative block w-full overflow-hidden rounded-2xl shadow-sm border border-stone-200/50 aspect-[16/10]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-950/90 via-pink-900/20 to-transparent z-10" />
                    <img src={b.imageUrl || (b as any).image || "/product-stack.jpg"} alt={b.title} className="h-full w-full absolute inset-0 object-cover" />
                    <div className="relative z-20 h-full w-full flex flex-col justify-end p-4 sm:p-6">
                      <h3 className="font-serif text-xl sm:text-2xl text-white drop-shadow-md leading-tight">{b.title}</h3>
                      <p className="text-xs sm:text-sm text-stone-100 drop-shadow-md leading-tight mt-1 opacity-90">{b.subtitle}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

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

      <div className="hidden md:block">
        <HomepageFlashSaleBanner settings={announcements} />
      </div>

      <section className="mx-auto max-w-7xl py-6 md:py-12 w-full overflow-hidden">
        <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden px-4 pb-2">
          {safePromoBanners.map((b, i) => (
            <div key={b.id || i} className="min-w-[90vw] sm:min-w-[70vw] md:min-w-[50vw] lg:min-w-[40vw] snap-center shrink-0">
              <Link
                href={(b as any).link || `/shop`}
                className="relative block w-full overflow-hidden rounded-2xl aspect-[16/10] md:aspect-[21/9] shadow-sm border border-stone-100 transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-charcoalBrown/90 via-charcoalBrown/20 to-transparent z-10" />
                <img src={b.imageUrl || (b as any).image || "/hero-showroom.jpg"} alt={b.title} className="h-full w-full absolute inset-0 object-cover" />
                <div className="relative z-20 h-full w-full flex flex-col justify-end p-5 md:p-8">
                  <h3 className="font-serif text-2xl md:text-3xl text-white drop-shadow-md mb-1">{b.title}</h3>
                  <p className="text-sm md:text-base text-stone-100 drop-shadow-md opacity-90">{b.subtitle}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:py-16">
        <div className="mb-5 md:mb-10 text-center">
          <h2 className="mb-1 md:mb-3 font-serif text-2xl md:text-5xl text-charcoalBrown">Shop by Category</h2>
          <p className="text-sm md:text-base text-stoneGray">Find your perfect piece</p>
        </div>
        <div className="grid grid-cols-3 gap-3 md:gap-4 md:grid-cols-5">
          <CategoryTile category={catRing} />
          <CategoryTile category={catEar} />
          <CategoryTile category={catNeck} />
          <CategoryTile category={catBrac} />
          <CategoryTile category={catDaily} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 md:py-12 w-full overflow-hidden">
        <SectionHeader title="Bestsellers" subtitle="Most loved by our customers" ctaTo="/shop" />
        <div className="flex overflow-x-auto gap-4 md:grid md:grid-cols-3 md:gap-6 lg:grid-cols-4 snap-x snap-mandatory scrollbar-hide [&::-webkit-scrollbar]:hidden -mx-4 px-4 pb-4">
          {bestsellers.map((p) => (
            <div key={p.id} className="min-w-[44vw] max-w-[44vw] snap-start shrink-0 sm:min-w-[220px] sm:max-w-[220px]">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 md:py-12 w-full overflow-hidden">
        <SectionHeader title="New Arrivals" subtitle="Fresh additions to our collection" ctaTo="/shop" />
        <div className="flex overflow-x-auto gap-4 md:grid md:grid-cols-3 md:gap-6 lg:grid-cols-4 snap-x snap-mandatory scrollbar-hide [&::-webkit-scrollbar]:hidden -mx-4 px-4 pb-4">
          {newArrivals.map((p) => (
            <div key={p.id} className="min-w-[44vw] max-w-[44vw] snap-start shrink-0 sm:min-w-[220px] sm:max-w-[220px]">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:py-16">
        <div className="glass-premium border border-stone-200/60 rounded-2xl md:rounded-3xl p-6 md:p-12 shadow-sm bg-white/50">
          <div className="mb-6 md:mb-10 text-center">
            <h2 className="mb-2 md:mb-3 font-serif text-2xl md:text-5xl text-charcoalBrown">Why Anti-Tarnish?</h2>
            <p className="mx-auto max-w-2xl text-sm md:text-base text-stoneGray">
              Our jewellery is crafted with advanced anti-tarnish technology so your favourite pieces stay radiant for years.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            <Benefit icon={<Sparkles className="h-5 w-5 md:h-8 md:w-8" />} title="Long-Lasting Shine" text="Keeps its beautiful shine for longer." />
            <Benefit icon={<Droplets className="h-5 w-5 md:h-8 md:w-8" />} title="Water-Resistant" text="Handles light water exposure." />
            <Benefit icon={<Gem className="h-5 w-5 md:h-8 md:w-8" />} title="Hypoallergenic" text="Skin-friendly for everyday wear." />
            <Benefit icon={<ShieldCheck className="h-5 w-5 md:h-8 md:w-8" />} title="Tarnish-Resistant" text="Protective coating against fading." />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="mb-6 md:mb-10 text-center">
          <h2 className="mb-2 md:mb-3 font-serif text-2xl md:text-4xl text-charcoalBrown">Why Shop With Us?</h2>
          <p className="mx-auto max-w-2xl text-sm md:text-base text-stoneGray">
            Enjoy a seamless and secure shopping experience with every order.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <Trust icon={<Truck className="h-6 w-6 md:h-8 md:w-8" />} title="Free Delivery" sub="On orders above ₹999" />
          <Trust icon={<RotateCcw className="h-6 w-6 md:h-8 md:w-8" />} title="7-Day Return" sub="Easy return & exchange" />
          <Trust icon={<Lock className="h-6 w-6 md:h-8 md:w-8" />} title="Secure Payment" sub="Safe checkout experience" />
          <Trust icon={<ShieldCheck className="h-6 w-6 md:h-8 md:w-8" />} title="Verified Quality" sub="Quality checked products" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:py-16 w-full overflow-hidden">
        <div className="mb-6 md:mb-10 text-center">
          <h2 className="mb-1 md:mb-3 font-serif text-2xl md:text-5xl text-charcoalBrown">Loved by Thousands</h2>
          <div className="mb-1 flex items-center justify-center gap-2">
            <span className="text-lg md:text-2xl" style={{ color: "#D4AF37" }}>★★★★★</span>
            <span className="text-sm md:text-base font-semibold text-stoneGray">4.9/5</span>
          </div>
        </div>
        <div className="flex overflow-x-auto gap-4 md:grid md:grid-cols-3 md:gap-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden -mx-4 px-4 pb-4">
          {safeReviews.slice(0, 3).map((r) => (
            <div key={r.id} className="min-w-[85vw] sm:min-w-[60vw] md:min-w-0 snap-start glass-premium rounded-2xl p-5 md:p-8 border border-white/60 shrink-0 shadow-sm">
              <div className="mb-4 md:mb-6 flex items-center gap-4">
                <div
                  className="flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-full font-bold text-white text-base md:text-lg"
                  style={{ background: r.color || "#FBCFE8" }}
                >{r.initial || r.name?.charAt(0) || "U"}</div>
                <div>
                  <h4 className="text-base md:text-lg font-semibold text-charcoalBrown">{r.name}</h4>
                  <div className="text-sm md:text-base" style={{ color: "#D4AF37" }}>★★★★★</div>
                </div>
              </div>
              <p className="text-sm md:text-base leading-relaxed text-stoneGray">"{r.text}"</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:py-16">
        <div className="glass-premium border border-stone-200/60 mx-auto max-w-3xl rounded-3xl p-8 md:p-12 text-center shadow-sm">
          <h2 className="mb-2 md:mb-3 font-serif text-2xl md:text-4xl text-charcoalBrown">Join our list</h2>
          <p className="mb-6 md:mb-8 text-sm md:text-base text-stoneGray">Get 10% off your first order and early access to new drops.</p>
          <form
            className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              placeholder="your@email.com"
              className="neo-input w-full px-4 py-3 md:py-3.5 text-sm"
              required
            />
            <button type="submit" className="btn-primary-gold px-8 py-3 md:py-3.5 text-sm whitespace-nowrap">Subscribe</button>
          </form>
        </div>
      </section>
    </>
  );
}

function SectionHeader({ title, subtitle, ctaTo }: { title: string; subtitle: string; ctaTo: string }) {
  return (
    <div className="mb-5 md:mb-8 flex flex-row items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="mb-1 font-serif text-2xl md:text-5xl text-charcoalBrown">{title}</h2>
        <p className="text-xs text-stoneGray md:text-base hidden sm:block">{subtitle}</p>
      </div>
      <Link href={ctaTo} className="text-sm font-semibold underline text-stoneGray hover:text-charcoalBrown whitespace-nowrap md:btn-liquid md:no-underline md:inline-flex">View All</Link>
    </div>
  );
}

function CategoryTile({
  category, className, featured = false,
}: { category: any; className?: string; featured?: boolean }) {
  if (!category) return null;
  
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
      className={`group flex flex-col items-center gap-2 cursor-pointer ${className ?? ""}`}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-neutral-100 shadow-sm border border-stone-100">
        <img src={imageSrc} alt={category.name} className="h-full w-full absolute inset-0 object-cover transition-transform duration-700 group-hover:scale-105" />
      </div>
      <h3 className="font-serif text-[12px] md:text-sm text-center text-charcoalBrown leading-tight group-hover:text-pink-900 transition-colors">{category.name}</h3>
    </Link>
  );
}

function Benefit({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="glass-premium rounded-2xl p-4 md:p-8 border border-white/80 text-center flex flex-col items-center shadow-sm transition hover:-translate-y-1 hover:shadow-md h-full bg-[#FAF9F6]">
      <div className="mb-2 md:mb-4 inline-flex h-10 w-10 md:h-16 md:w-16 items-center justify-center rounded-full bg-stone-50 text-[color:var(--color-gold)]">{icon}</div>
      <h3 className="mb-1 md:mb-3 font-serif text-[13px] md:text-xl text-[color:var(--color-espresso)] leading-tight">{title}</h3>
      <p className="text-[11px] md:text-sm text-[color:var(--color-muted-text)] leading-relaxed">{text}</p>
    </div>
  );
}

function Trust({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="glass-premium p-3 md:p-6 rounded-2xl flex flex-col items-center border border-white/80 justify-center text-center shadow-sm transition hover:bg-white hover:-translate-y-1 hover:shadow-md h-full bg-[#FAF9F6]">
      <div className="mb-1 md:mb-4 flex justify-center text-[color:var(--color-gold)]">{icon}</div>
      <h4 className="text-[12px] sm:text-base font-semibold text-[color:var(--color-espresso)] uppercase tracking-wider leading-tight">{title}</h4>
      <p className="mt-0.5 md:mt-2 text-[10px] md:text-sm text-[color:var(--color-muted-text)] leading-tight">{sub}</p>
    </div>
  );
}
