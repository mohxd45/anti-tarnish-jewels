"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LONA_CATEGORIES } from "@/lib/categories";

export function CategoryBar() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category")?.toLowerCase().trim() || "all";

  return (
    <div className="w-full bg-white/50 backdrop-blur-md border-b border-stone-100 shadow-sm block lg:hidden pb-3">
      <div className="mx-4 mt-2 bg-gradient-to-r from-[#FFF5F8] to-[#FFF9E6] border border-[#E9C8A1]/40 rounded-xl shadow-[0_2px_12px_rgba(184,149,94,0.06)] overflow-hidden">
        <div className="flex gap-2.5 overflow-x-auto px-3 py-2.5 scrollbar-hide snap-x snap-mandatory [&::-webkit-scrollbar]:hidden items-center">
          {LONA_CATEGORIES.map((cat) => {
            const isActive = 
              (cat.slug === "all" && (currentCategory === "" || currentCategory === "all" || currentCategory === "all jewellery")) || 
              currentCategory === cat.slug;
              
            const href = cat.slug === "all" ? `/shop` : `/shop?category=${cat.slug}`;

            return (
              <Link 
                key={cat.slug} 
                href={href}
                className={`flex items-center justify-center px-4 h-[34px] rounded-lg transition-all duration-300 snap-start shrink-0 border ${
                  isActive 
                    ? "bg-gradient-to-r from-[#B8955E] to-[#D4AF37] border-transparent text-white shadow-[0_2px_8px_rgba(184,149,94,0.25)]" 
                    : "bg-white/80 border-[#E9C8A1]/50 text-stone-700 hover:bg-white hover:border-[#B8955E] hover:text-[#B8955E]"
                }`}
              >
                <span className={`text-[13px] whitespace-nowrap tracking-wide ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
