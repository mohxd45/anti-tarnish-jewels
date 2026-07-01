import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getProducts, getBanners, getCategories, getReviews } from "@/lib/firestore";
import { Sparkles, Droplets, Gem, Truck, RotateCcw, ShieldCheck, Lock } from "lucide-react";

export const metadata = {
  title: "Anti Tarnish Jewels — Premium Anti-Tarnish Jewellery",
  description: "Timeless elegance in anti-tarnish jewellery. Shop rings, earrings, necklaces & bracelets crafted for everyday luxury.",
};

export default async function HomePage() {
  const [products, banners, categories, reviews] = await Promise.all([
    getProducts(),
    getBanners(),
    getCategories(),
    getReviews(),
  ]);

  const bestsellers = products.filter(p => p.isBestSeller || (p.rating && p.rating >= 4.5)).slice(0, 8);
  const newArrivals = products.sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()).slice(0, 8);
  const heroBanners = banners.filter((b) => b.placement === "hero" && b.active);

  // Fallback banners if none exist in firestore
  const safeHeroBanners = heroBanners.length >= 3 ? heroBanners : [
    { id: '1', title: 'Rings', subtitle: 'Timeless elegance', imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f66126e28?w=500', placement: "hero" as const, createdAt: "", updatedAt: "" },
    { id: '2', title: 'Earrings', subtitle: 'Radiant shine', imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500', placement: "hero" as const, createdAt: "", updatedAt: "" },
    { id: '3', title: 'Necklaces', subtitle: 'Everyday luxury', imageUrl: 'https://images.unsplash.com/photo-1599643478524-fb66f70362f6?w=500', placement: "hero" as const, createdAt: "", updatedAt: "" },
  ];

  // Fallback categories if empty
  const safeCategories = categories.length >= 5 ? categories : [
    { name: "Rings", slug: "rings", image: "https://images.unsplash.com/photo-1605100804763-247f66126e28?w=800" },
    { name: "Earrings", slug: "earrings", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800" },
    { name: "Necklaces", slug: "necklaces", image: "https://images.unsplash.com/photo-1599643478524-fb66f70362f6?w=800" },
    { name: "Bracelets", slug: "bracelets", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800" },
    { name: "Daily Wear", slug: "daily-wear", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800" },
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

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-4">
        {/* soft floating decorations */}
        <div className="pointer-events-none absolute inset-0 select-none opacity-20">
          <span className="float-anim absolute left-[5%] top-[10%] text-6xl">💍</span>
          <span className="float-slow absolute right-[8%] top-[18%] text-5xl">✨</span>
          <span className="float-reverse absolute bottom-[28%] left-[10%] text-5xl">💎</span>
          <span className="float-anim absolute bottom-[18%] right-[6%] text-6xl">👑</span>
        </div>

        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920"
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
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-pink-600 sm:text-sm">
              Premium Anti-Tarnish Collection
            </p>
            <h1 className="mb-6 font-serif text-5xl leading-tight text-pink-900 md:text-7xl lg:text-8xl">
              Timeless<br />
              <span className="gold-text italic">Elegance</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-base text-pink-700 md:text-xl">
              Discover jewellery that stays as radiant as you. Crafted with anti-tarnish technology for everyday luxury.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <Link href="/shop" className="btn-primary-gold px-8 py-4 text-base md:text-lg">
                Shop Collection
              </Link>
              <Link href="/shop?category=daily-wear" className="btn-liquid px-8 py-4 text-base md:text-lg">
                Daily Wear
              </Link>
            </div>
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
                  className={`glass-dark absolute cursor-pointer rounded-2xl p-3 transition hover:z-10 hover:-translate-y-2 hover:scale-105 ${pos.anim}`}
                  style={style}
                >
                  <img src={b.imageUrl} alt={b.title} className="mb-3 h-32 w-full rounded-xl object-cover" />
                  <h3 className="font-serif text-lg text-pink-900">{b.title}</h3>
                  <p className="text-xs text-pink-600">{b.subtitle}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* SHOP BY CATEGORY (bento) */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="mb-3 font-serif text-3xl text-pink-900 md:text-5xl">Shop by Category</h2>
          <p className="text-pink-600">Find your perfect piece</p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <CategoryTile category={catRing} className="col-span-2 row-span-2 h-64 md:h-80" featured />
          <CategoryTile category={catEar} className="h-40" />
          <CategoryTile category={catNeck} className="h-40" />
          <CategoryTile category={catBrac} className="h-40" />
          <CategoryTile category={catDaily} className="h-40" />
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
        <div className="glass-dark rounded-3xl p-6 md:p-12">
          <div className="mb-10 text-center">
            <h2 className="mb-3 font-serif text-3xl text-pink-900 md:text-5xl">Why Anti-Tarnish?</h2>
            <p className="mx-auto max-w-2xl text-pink-600">
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
          <h2 className="mb-3 font-serif text-3xl text-pink-900 md:text-5xl">Loved by Thousands</h2>
          <div className="mb-1 flex items-center justify-center gap-2">
            <span className="text-2xl" style={{ color: "#D4AF37" }}>★★★★★</span>
            <span className="font-semibold text-pink-700">4.9/5</span>
          </div>
          <p className="text-pink-600">Based on 2,847 reviews</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {safeReviews.slice(0, 3).map((r) => (
            <div key={r.id} className="glass rounded-2xl p-6">
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full font-bold text-white"
                  style={{ background: r.color || "#FBCFE8" }}
                >{r.initial || r.name?.charAt(0) || "U"}</div>
                <div>
                  <h4 className="font-semibold text-pink-900">{r.name}</h4>
                  <div className="text-sm" style={{ color: "#D4AF37" }}>★★★★★</div>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-pink-700">"{r.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <Trust icon={<Truck className="h-6 w-6" />} title="Free Delivery" sub="Above ₹999" />
          <Trust icon={<RotateCcw className="h-6 w-6" />} title="7-Day Returns" sub="Easy exchange" />
          <Trust icon={<ShieldCheck className="h-6 w-6" />} title="Anti-Tarnish" sub="Lifetime guarantee" />
          <Trust icon={<Lock className="h-6 w-6" />} title="Secure Payment" sub="COD available" />
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="glass-dark mx-auto max-w-3xl rounded-3xl p-8 text-center md:p-12">
          <h2 className="mb-3 font-serif text-3xl text-pink-900 md:text-4xl">Join our list</h2>
          <p className="mb-6 text-pink-600">Get 10% off your first order and early access to new drops.</p>
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
        <h2 className="mb-1 font-serif text-3xl text-pink-900 md:text-5xl">{title}</h2>
        <p className="text-sm text-pink-600 md:text-base">{subtitle}</p>
      </div>
      <Link href={ctaTo} className="btn-liquid hidden md:inline-flex">View All</Link>
    </div>
  );
}

function CategoryTile({
  category, className, featured = false,
}: { category: any; className?: string; featured?: boolean }) {
  if (!category) return null;
  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className={`category-card block cursor-pointer ${className ?? ""}`}
    >
      <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
      <div className="absolute bottom-3 left-4 z-10 text-white">
        <h3 className={`font-serif ${featured ? "text-2xl md:text-3xl" : "text-xl"}`}>{category.name}</h3>
        <p className="text-xs opacity-90">Explore collection</p>
      </div>
    </Link>
  );
}

function Benefit({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="trust-badge">
      <div className="mb-3 flex justify-center text-pink-600">{icon}</div>
      <h3 className="mb-2 font-serif text-xl text-pink-900">{title}</h3>
      <p className="text-sm text-pink-700">{text}</p>
    </div>
  );
}

function Trust({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="trust-badge">
      <div className="mb-2 flex justify-center text-pink-600">{icon}</div>
      <h4 className="text-sm font-semibold text-pink-900">{title}</h4>
      <p className="text-xs text-pink-600">{sub}</p>
    </div>
  );
}
