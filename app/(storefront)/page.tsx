import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getProducts, getReviews, getSiteContent, getSiteSettings, getAnnouncements } from "@/lib/firestore";
import { Truck, RotateCcw, ShieldCheck, Lock } from "lucide-react";
import { HomepageFlashSaleBanner } from "@/components/storefront/HomepageFlashSaleBanner";
import { AnnouncementTicker } from "@/components/storefront/AnnouncementTicker";
import { CategoryBar } from "@/components/storefront/CategoryBar";

export const metadata = {
  title: "LONA JEWELS | Premium Anti-Tarnish Jewellery",
  description: "Shop premium anti-tarnish jewellery with long-lasting shine, water-resistant finish, and skin-friendly designs.",
};

export default async function HomePage() {
  const [products, reviews, content, settings, announcements] = await Promise.all([
    getProducts(),
    getReviews(),
    getSiteContent("home"),
    getSiteSettings(),
    getAnnouncements()
  ]);

  const bestsellers = products.filter(p => p.isBestSeller || (p.rating && p.rating >= 4.5)).slice(0, 8);
  const newArrivals = products.sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()).slice(0, 8);

  // Fallback reviews
  const safeReviews = reviews.length > 0 ? reviews : [
    { id: '1', name: "Priya S.", initial: "P", color: "#FBCFE8", text: "Absolutely stunning pieces! I've been wearing my necklace daily, even in the shower, and it hasn't lost its shine." },
    { id: '2', name: "Ananya M.", initial: "A", color: "#FCE7F3", text: "The quality is unmatched. These earrings look exactly like real solid gold but for a fraction of the price." },
    { id: '3', name: "Neha R.", initial: "N", color: "#F9A8D4", text: "Fast delivery and beautiful packaging. The rings are true to size and so elegant." }
  ];

  let heroSmallTitle = content?.heroSmallTitle || "UPGRADE YOUR DAILY GLAM 💖";
  let heroMainHeading = (content?.heroMainHeading || content?.heroTitle) || "SUMMER SALE";
  let heroSubtitle = content?.heroSubtitle || "Verified quality jewellery for every occasion.";
  let heroCtaText = content?.heroCtaText || "Shop The Collection";
  const heroCtaLink = content?.heroCtaLink || "/shop";

  // Force fix spelling error
  heroSmallTitle = heroSmallTitle.replace(/SUMMER SELL/gi, "SUMMER SALE");
  heroMainHeading = heroMainHeading.replace(/SUMMER SELL/gi, "SUMMER SALE");
  heroSubtitle = heroSubtitle.replace(/SUMMER SELL/gi, "SUMMER SALE");

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .global-announcement-ticker { display: none !important; }
        }
      `}</style>
      
      <div className="-mt-[48px] lg:mt-0 flex flex-col w-full">
        <div className="block md:hidden relative z-20 w-full overflow-hidden">
          <AnnouncementTicker className="relative w-full h-[44px]" />
        </div>

        <div className="block md:hidden relative z-20 w-full">
          <HomepageFlashSaleBanner settings={announcements} />
        </div>

        <div className="relative z-30 w-full">
          <CategoryBar />
        </div>
      </div>

      <section className="relative flex min-h-[560px] md:min-h-[85vh] items-center justify-center overflow-hidden w-full">
        <div className="absolute inset-0 z-0">
          <img
            src="/lona-hero-bg.png"
            alt="LONA JEWELS Collection"
            className="h-full w-full object-cover opacity-90 md:opacity-100"
          />
          {/* Soft dark/rose overlay for premium feel and text readability */}
          <div
            className="absolute inset-0 bg-[#3A2428]/30 md:bg-transparent"
          />
          <div
            className="absolute inset-0 hidden md:block"
            style={{ background: "linear-gradient(180deg, rgba(253,242,248,0.8) 0%, rgba(252,231,243,0.6) 50%, rgba(250,240,230,0.95) 100%)" }}
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-0 pt-8 md:pt-0">
          <div className="mb-6 md:mb-10 text-center flex flex-col items-center">
            <p className="mb-3 md:mb-4 text-xs sm:text-sm font-semibold uppercase tracking-widest text-white/90 md:text-stoneGray drop-shadow-sm md:drop-shadow-none">
              {heroSmallTitle}
            </p>
            <h1 className="mb-4 md:mb-6 font-serif text-5xl leading-[1.1] md:text-7xl lg:text-8xl text-white md:text-charcoalBrown drop-shadow-md md:drop-shadow-none">
              {heroMainHeading}
            </h1>
            <p className="mx-auto mb-8 max-w-lg text-base md:text-xl text-white/90 md:text-stoneGray drop-shadow-sm md:drop-shadow-none font-medium md:font-normal">
              {heroSubtitle}
            </p>
            <div className="w-full sm:w-auto px-4 sm:px-0">
              <Link href={heroCtaLink} className="flex items-center justify-center w-full sm:w-auto px-8 h-14 bg-[#B8955E] text-white font-medium rounded-full shadow-[0_8px_20px_rgba(184,149,94,0.3)] hover:bg-[#A38250] hover:shadow-[0_12px_24px_rgba(184,149,94,0.4)] transition-all text-base tracking-wide">
                {heroCtaText}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="hidden md:block">
        <HomepageFlashSaleBanner settings={announcements} />
      </div>



      <section className="mx-auto max-w-7xl px-4 py-6 md:py-12 w-full overflow-hidden">
        <SectionHeader title="Bestsellers" subtitle="Most loved by our customers" ctaTo="/shop" />
        <div className="flex overflow-x-auto gap-4 md:grid md:grid-cols-3 md:gap-6 lg:grid-cols-4 snap-x snap-mandatory scrollbar-hide [&::-webkit-scrollbar]:hidden pb-4">
          {bestsellers.map((p) => (
            <div key={p.id} className="min-w-[44vw] max-w-[44vw] snap-start shrink-0 sm:min-w-[220px] sm:max-w-[220px]">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 md:py-12 w-full overflow-hidden">
        <SectionHeader title="New Arrivals" subtitle="Fresh additions to our collection" ctaTo="/shop" />
        <div className="flex overflow-x-auto gap-4 md:grid md:grid-cols-3 md:gap-6 lg:grid-cols-4 snap-x snap-mandatory scrollbar-hide [&::-webkit-scrollbar]:hidden pb-4">
          {newArrivals.map((p) => (
            <div key={p.id} className="min-w-[44vw] max-w-[44vw] snap-start shrink-0 sm:min-w-[220px] sm:max-w-[220px]">
              <ProductCard product={p} />
            </div>
          ))}
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
        <div className="flex overflow-x-auto gap-4 md:grid md:grid-cols-3 md:gap-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden pb-4">
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


function Trust({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="glass-premium p-3 md:p-6 rounded-2xl flex flex-col items-center border border-white/80 justify-center text-center shadow-sm transition hover:bg-white hover:-translate-y-1 hover:shadow-md h-full bg-[#FAF9F6]">
      <div className="mb-1 md:mb-4 flex justify-center text-[color:var(--color-gold)]">{icon}</div>
      <h4 className="text-[12px] sm:text-base font-semibold text-[color:var(--color-espresso)] uppercase tracking-wider leading-tight">{title}</h4>
      <p className="mt-0.5 md:mt-2 text-[10px] md:text-sm text-[color:var(--color-muted-text)] leading-tight">{sub}</p>
    </div>
  );
}
