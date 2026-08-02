import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/types";

interface HomepageProductSliderProps {
  title: string;
  subtitle?: string;
  ctaTo: string;
  products: Product[];
  bgColorClass?: string;
  isSpecial?: boolean;
}

export function HomepageProductSlider({
  title,
  subtitle,
  ctaTo,
  products,
  bgColorClass = "bg-[#FFF9FB]",
  isSpecial = false,
}: HomepageProductSliderProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className={`w-full overflow-hidden ${bgColorClass} ${isSpecial ? 'border-y border-[#B8955E]/20 relative shadow-sm z-10' : ''}`}>
      {isSpecial && (
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay" />
      )}
      
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8 lg:py-10 relative z-10">
        <div className="mb-4 md:mb-6 flex flex-row items-end justify-between gap-3 border-b border-[#B8955E]/15 pb-2 md:pb-3">
          <div className="min-w-0 flex-grow">
            <h2 className="mb-1 font-serif text-2xl md:text-3xl lg:text-4xl text-[#3A2428] tracking-tight flex items-center gap-2">
              {isSpecial && <span className="text-[#B8955E] text-xl md:text-3xl">✦</span>}
              {title}
            </h2>
            {subtitle && (
              <p className="text-[11px] md:text-sm text-[#3A2428]/70 font-medium tracking-wide">{subtitle}</p>
            )}
          </div>
          <Link href={ctaTo} className="group flex items-center text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-[#B8955E] hover:text-[#3A2428] transition-colors whitespace-nowrap mb-1">
            <span>View All</span>
            <span className="ml-1 block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
        
        {/* Improved slider container with smooth scroll snapping and balanced padding */}
        <div className="flex overflow-x-auto gap-3 sm:gap-4 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-6 lg:gap-8 snap-x snap-mandatory scrollbar-hide [&::-webkit-scrollbar]:hidden pb-4 -mx-4 px-4 md:mx-0 md:px-0">
          {products.map((p) => (
            <div key={p.id} className="min-w-[46vw] max-w-[46vw] sm:min-w-[32vw] sm:max-w-[32vw] md:min-w-0 md:max-w-none snap-start md:snap-align-none shrink-0">
              <ProductCard product={p} variant="compact" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
