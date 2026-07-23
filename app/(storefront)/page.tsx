import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getProducts, getReviews, getSiteContent, getSiteSettings, getAnnouncements } from "@/lib/firestore";
import { HomepageFlashSaleBanner } from "@/components/storefront/HomepageFlashSaleBanner";
import { AnnouncementTicker } from "@/components/storefront/AnnouncementTicker";
import { CategoryBar } from "@/components/storefront/CategoryBar";

export const metadata = {
  title: "LONA JEWELS | Fashion Jewellery & Hair Accessories",
  description: "Shop trendy, budget-friendly fashion jewellery, Korean design pieces, earrings, rings, necklaces, bracelets, and stylish hair accessories at LONA JEWELS.",
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
  // Always point to Collections (Categories) as requested
  let heroCtaLink = "/collections";

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
      
      <div className="flex flex-col w-full">
        <div id="categories" className="block lg:hidden relative z-30 w-full">
          <CategoryBar />
        </div>

        <div className="relative z-20 w-full overflow-hidden">
          <AnnouncementTicker className="text-xs tracking-wide" />
        </div>

        <div className="relative z-20 w-full">
          <HomepageFlashSaleBanner settings={announcements} />
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



      <section className="mx-auto max-w-7xl px-4 py-8 md:py-16 w-full overflow-hidden">
        <SectionHeader title="Bestsellers" subtitle="Most loved by our customers" ctaTo="/shop" />
        <div className="flex overflow-x-auto gap-3 sm:gap-4 md:grid md:grid-cols-3 md:gap-6 lg:grid-cols-4 snap-x snap-mandatory scrollbar-hide [&::-webkit-scrollbar]:hidden pb-4">
          {bestsellers.map((p) => (
            <div key={p.id} className="min-w-[45vw] max-w-[45vw] snap-start shrink-0 md:min-w-0 md:max-w-none">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:py-16 w-full bg-gradient-to-b from-[#FFF0F5]/30 to-transparent overflow-hidden">
        <SectionHeader title="New Arrivals" subtitle="Fresh additions to our collection" ctaTo="/shop" />
        <div className="flex overflow-x-auto gap-3 sm:gap-4 md:grid md:grid-cols-3 md:gap-6 lg:grid-cols-4 snap-x snap-mandatory scrollbar-hide [&::-webkit-scrollbar]:hidden pb-4">
          {newArrivals.map((p) => (
            <div key={p.id} className="min-w-[45vw] max-w-[45vw] snap-start shrink-0 md:min-w-0 md:max-w-none">
              <ProductCard product={p} />
            </div>
          ))}
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
    <div className="mb-6 md:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 border-b border-[#B8955E]/15 pb-4">
      <div className="min-w-0 flex-grow">
        <h2 className="mb-1.5 font-serif text-3xl md:text-5xl text-[#3A2428] tracking-tight">{title}</h2>
        <p className="text-[13px] md:text-base text-[#3A2428]/60 font-medium">{subtitle}</p>
      </div>
      <Link href={ctaTo} className="group inline-flex items-center text-xs md:text-sm font-semibold uppercase tracking-widest text-[#B8955E] hover:text-[#3A2428] transition-colors whitespace-nowrap self-start sm:self-end mb-1">
        <span>View All</span>
        <span className="ml-2 block transition-transform group-hover:translate-x-1">→</span>
      </Link>
    </div>
  );
}

