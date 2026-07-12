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
    <div className="sticky top-[64px] z-40 bg-[#FFF0F5]/95 backdrop-blur-md border-b border-[#B8955E]/20 block md:hidden shadow-sm">
      <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => {
          const isActive = currentCategory === cat.param;
          const href = cat.param ? `/shop?category=${cat.param}` : `/shop`;
          const Icon = cat.icon;

          return (
            <Link 
              key={cat.name} 
              href={href}
              className={`flex items-center gap-1.5 px-3.5 h-[42px] rounded-full border transition-all duration-300 snap-start shrink-0 ${
                isActive 
                  ? "bg-gradient-to-r from-[#B8955E] to-[#D4AF37] border-[#D4AF37] text-white shadow-[0_4px_12px_rgba(184,149,94,0.3)] scale-[1.02]" 
                  : "bg-[#FFF9FB] border-[#B8955E]/30 text-[#3A2428] hover:border-[#B8955E]/60 hover:bg-white shadow-[0_2px_8px_rgba(58,36,40,0.03)]"
              }`}
            >
              <Icon className={`w-[14px] h-[14px] shrink-0 ${isActive ? "text-white" : "text-[#B8955E]"}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[13px] whitespace-nowrap tracking-wide ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
