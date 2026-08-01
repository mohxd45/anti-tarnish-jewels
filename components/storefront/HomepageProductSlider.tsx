import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/types";

interface HomepageProductSliderProps {
  title: string;
  subtitle?: string;
  ctaTo: string;
  products: Product[];
  bgColorClass?: string;
}

export function HomepageProductSlider({
  title,
  subtitle,
  ctaTo,
  products,
  bgColorClass = "bg-transparent"
}: HomepageProductSliderProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className={`w-full overflow-hidden ${bgColorClass}`}>
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-16">
        <div className="mb-6 md:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 border-b border-[#B8955E]/15 pb-4">
          <div className="min-w-0 flex-grow">
            <h2 className="mb-1.5 font-serif text-3xl md:text-5xl text-[#3A2428] tracking-tight">{title}</h2>
            {subtitle && (
              <p className="text-[13px] md:text-base text-[#3A2428]/60 font-medium">{subtitle}</p>
            )}
          </div>
          <Link href={ctaTo} className="group inline-flex items-center text-xs md:text-sm font-semibold uppercase tracking-widest text-[#B8955E] hover:text-[#3A2428] transition-colors whitespace-nowrap self-start sm:self-end mb-1">
            <span>View All</span>
            <span className="ml-2 block transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
        
        <div className="flex overflow-x-auto gap-3 sm:gap-4 md:grid md:grid-cols-3 md:gap-6 lg:grid-cols-4 snap-x snap-mandatory scrollbar-hide [&::-webkit-scrollbar]:hidden pb-4">
          {products.map((p) => (
            <div key={p.id} className="min-w-[45vw] max-w-[45vw] snap-start shrink-0 md:min-w-0 md:max-w-none">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
