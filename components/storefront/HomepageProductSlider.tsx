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
      
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-16 lg:py-20 relative z-10">
        <div className="mb-8 md:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 border-b border-[#B8955E]/15 pb-4 md:pb-6">
          <div className="min-w-0 flex-grow">
            <h2 className="mb-2 font-serif text-3xl md:text-4xl lg:text-5xl text-[#3A2428] tracking-tight flex items-center gap-2">
              {isSpecial && <span className="text-[#B8955E] text-2xl md:text-4xl">✦</span>}
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm md:text-base text-[#3A2428]/70 font-medium tracking-wide">{subtitle}</p>
            )}
          </div>
          <Link href={ctaTo} className="group inline-flex items-center text-[11px] md:text-sm font-bold uppercase tracking-[0.2em] text-[#B8955E] hover:text-[#3A2428] transition-colors whitespace-nowrap self-start sm:self-end mb-1 md:mb-2">
            <span>View All</span>
            <span className="ml-2 block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
        
        {/* Improved slider container with smooth scroll snapping and balanced padding */}
        <div className="flex overflow-x-auto gap-4 sm:gap-5 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-6 lg:gap-8 snap-x snap-mandatory scrollbar-hide [&::-webkit-scrollbar]:hidden pb-6 -mx-4 px-4 md:mx-0 md:px-0">
          {products.map((p) => (
            <div key={p.id} className="min-w-[55vw] max-w-[55vw] sm:min-w-[40vw] sm:max-w-[40vw] md:min-w-0 md:max-w-none snap-center md:snap-align-none shrink-0">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
