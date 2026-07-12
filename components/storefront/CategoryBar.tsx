"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Sparkles, Sparkle, Link2, Circle, Gem, CircleDashed, Activity, Gift } from "lucide-react";

export function CategoryBar() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category")?.toLowerCase() || "";

  const categories = [
    { name: "All Jewellery", param: "", icon: Sparkles },
    { name: "Earrings", param: "earrings", icon: Sparkle },
    { name: "Necklaces", param: "necklaces", icon: Link2 },
    { name: "Rings", param: "rings", icon: Circle },
    { name: "Bracelets", param: "bracelets", icon: Gem },
    { name: "Bangles", param: "bangles", icon: CircleDashed },
    { name: "Anklets", param: "anklets", icon: Activity },
    { name: "Gift Sets", param: "gift-sets", icon: Gift },
  ];

  return (
    <div className="sticky top-[64px] z-40 bg-[#FFF9FB] border-b border-[#E8D7C8] shadow-[0_2px_10px_rgba(58,36,40,0.02)] block md:hidden w-full">
      <div className="flex gap-2 overflow-x-auto px-4 py-3.5 scrollbar-hide snap-x snap-mandatory [&::-webkit-scrollbar]:hidden items-center">
        {categories.map((cat) => {
          const isActive = currentCategory === cat.param;
          const href = cat.param ? `/shop?category=${cat.param}` : `/shop`;
          const Icon = cat.icon;

          return (
            <Link 
              key={cat.name} 
              href={href}
              className={`flex items-center justify-center gap-1.5 px-3.5 h-[38px] rounded-full transition-all duration-300 snap-start shrink-0 border ${
                isActive 
                  ? "bg-gradient-to-r from-[#B8955E] to-[#D4AF37] border-transparent text-white shadow-[0_2px_8px_rgba(184,149,94,0.25)]" 
                  : "bg-white/40 border-[#B8955E]/15 text-[#3A2428] hover:bg-white hover:border-[#B8955E]/30"
              }`}
            >
              <Icon className={`w-[14px] h-[14px] shrink-0 ${isActive ? "text-white" : "text-[#B8955E]/80"}`} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className={`text-sm whitespace-nowrap tracking-wide ${isActive ? 'font-medium' : 'font-normal'}`}>
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
