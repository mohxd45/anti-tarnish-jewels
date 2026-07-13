"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LONA_CATEGORIES } from "@/lib/categories";

export function CategoryBar() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category")?.toLowerCase().trim() || "all";

  return (
    <div className="sticky top-[64px] z-40 bg-[#FFF9FB] border-b border-[#E8D7C8] shadow-[0_2px_10px_rgba(58,36,40,0.02)] block md:hidden w-full overflow-hidden">
      <div className="flex gap-2 overflow-x-auto px-4 py-2.5 scrollbar-hide snap-x snap-mandatory [&::-webkit-scrollbar]:hidden items-center">
        {LONA_CATEGORIES.map((cat) => {
          // If the slug is 'all', the current category could be 'all' or empty string.
          // Otherwise, we strictly compare slugs.
          const isActive = 
            (cat.slug === "all" && (currentCategory === "" || currentCategory === "all" || currentCategory === "all jewellery")) || 
            currentCategory === cat.slug;
            
          const href = cat.slug === "all" ? `/shop` : `/shop?category=${cat.slug}`;

          return (
            <Link 
              key={cat.slug} 
              href={href}
              className={`flex items-center justify-center px-3.5 h-[32px] rounded-full transition-all duration-300 snap-start shrink-0 border ${
                isActive 
                  ? "bg-gradient-to-r from-[#B8955E] to-[#D4AF37] border-transparent text-white shadow-[0_2px_8px_rgba(184,149,94,0.25)]" 
                  : "bg-white/40 border-[#B8955E]/15 text-[#3A2428] hover:bg-white hover:border-[#B8955E]/30"
              }`}
            >
              <span className={`text-[13px] whitespace-nowrap tracking-wide ${isActive ? 'font-medium' : 'font-normal'}`}>
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
