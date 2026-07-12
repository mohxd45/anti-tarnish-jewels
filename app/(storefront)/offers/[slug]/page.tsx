import { getBannerBySlug } from "@/lib/firestore";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Tag } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const banner = await getBannerBySlug(slug);

  if (!banner || (banner.active === false && banner.isActive === false)) {
    return {
      title: "Offer Not Found | LONA JEWELS",
      description: "This offer could not be found or has expired."
    };
  }

  return {
    title: `${banner.pageTitle || banner.title} | Offers`,
    description: banner.pageDescription || banner.subtitle || "Exclusive offer from LONA JEWELS",
    openGraph: {
      images: [banner.imageUrl],
    },
  };
}

export default async function OfferPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const banner = await getBannerBySlug(slug);

  // Consider an offer inactive if both active AND isActive are explicitly false
  const isInactive = banner && (banner.active === false || banner.isActive === false);

  if (!banner || isInactive) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center pt-32 px-6">
        <div className="bg-white/40 glass p-12 rounded-[2rem] text-center max-w-lg mx-auto shadow-sm">
          <Tag className="h-12 w-12 text-[var(--rose-gold)] mx-auto mb-6 opacity-80" />
          <h1 className="font-display text-4xl text-ink mb-4">Offer Not Found</h1>
          <p className="text-ink/70 mb-8 leading-relaxed">
            This offer may have expired, or the link is incorrect. Don't worry, we have many more beautiful collections for you to explore.
          </p>
          <Link href="/shop" className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-full">
            Explore Collections <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Determine CTA destination
  let destinationUrl = "/shop";
  if (banner.linkUrl) destinationUrl = banner.linkUrl;
  else if (banner.link) destinationUrl = banner.link; // fallback to legacy
  else if (banner.categorySlug) destinationUrl = `/shop?category=${encodeURIComponent(banner.categorySlug)}`;
  else if (banner.productSlug) destinationUrl = `/product/${banner.productSlug}`;

  const ctaText = banner.ctaText || banner.buttonText || "Shop the Offer";

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background/50">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        {/* Hero Image Section */}
        <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-[2rem] overflow-hidden mb-12 shadow-[var(--shadow-soft)] group">
          <div className="absolute inset-0 bg-[var(--gradient-gold)] p-px rounded-[2rem] z-10 opacity-50" />
          <img 
            src={banner.imageUrl} 
            alt={banner.title} 
            className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
          
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 z-20 text-white">
            {banner.subtitle && (
              <p className="text-sm md:text-base uppercase tracking-[0.3em] text-white/80 mb-3 font-medium">
                {banner.subtitle}
              </p>
            )}
            <h1 className="font-display text-4xl md:text-6xl max-w-3xl leading-tight text-shadow-sm">
              {banner.pageTitle || banner.title}
            </h1>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid md:grid-cols-[1fr_350px] gap-12 items-start">
          
          {/* Main Description */}
          <div className="prose prose-lg prose-ink max-w-none">
            {banner.pageDescription ? (
              <div className="text-ink/80 leading-relaxed font-light whitespace-pre-wrap">
                {banner.pageDescription}
              </div>
            ) : (
              <p className="text-xl text-ink/80 leading-relaxed font-light">
                Discover our exclusive {banner.title} collection, curated specifically for you.
              </p>
            )}

            {banner.offerDetails && (
              <div className="mt-12 glass p-8 rounded-[2rem] bg-[var(--champagne)]/30 border border-white/40">
                <h3 className="font-display text-2xl text-ink mb-4">Offer Details</h3>
                <div className="text-ink/80 whitespace-pre-wrap leading-relaxed text-sm">
                  {banner.offerDetails}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Sidebar */}
          <div className="glass p-8 rounded-[2rem] sticky top-32 shadow-sm">
            <h3 className="font-display text-2xl mb-6">Ready to Shop?</h3>
            
            {(banner.startDate || banner.endDate) && (
              <div className="mb-6 pb-6 border-b border-ink/10 space-y-2">
                {banner.startDate && (
                  <p className="text-xs text-ink/70 flex justify-between">
                    <span>Starts:</span> <span className="font-medium text-ink">{new Date(banner.startDate).toLocaleDateString()}</span>
                  </p>
                )}
                {banner.endDate && (
                  <p className="text-xs text-ink/70 flex justify-between">
                    <span>Ends:</span> <span className="font-medium text-[var(--dusty-rose)]">{new Date(banner.endDate).toLocaleDateString()}</span>
                  </p>
                )}
              </div>
            )}

            <Link href={destinationUrl} className="btn-primary w-full flex justify-center items-center gap-2 py-4 rounded-full text-base font-medium shadow-md hover:shadow-lg transition-all mb-4">
              {ctaText} <ArrowRight className="h-4 w-4" />
            </Link>

            {banner.terms && (
              <div className="mt-6 pt-6 border-t border-ink/10">
                <h4 className="text-xs uppercase tracking-wider text-ink/50 mb-2 font-semibold">Terms & Conditions</h4>
                <p className="text-[10px] text-ink/60 leading-relaxed whitespace-pre-wrap">
                  {banner.terms}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
