"use client";

import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface StickyCartSummaryBarProps {
  closeDrawer?: () => void;
  isPage?: boolean;
}

export function StickyCartSummaryBar({ closeDrawer, isPage = false }: StickyCartSummaryBarProps) {
  const { total } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    if (closeDrawer) closeDrawer();
    router.push("/checkout");
  };

  return (
    <div className={`bg-[#FFF9FB] border-t border-[#E8D7C8]/50 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] w-full ${isPage ? 'fixed bottom-[60px] left-0 right-0 z-40 md:static md:shadow-none md:bottom-auto' : 'sticky bottom-0 z-40'}`}>
      <div className={`flex items-center justify-between gap-4 ${isPage ? 'max-w-6xl xl:max-w-[1140px] mx-auto' : ''}`}>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8F817B]">Total</span>
          <span className="text-lg font-bold text-[#3A2428] leading-tight">
            {formatPrice ? formatPrice(total) : `₹${total.toLocaleString()}`}
          </span>
        </div>
        
        <button
          onClick={handleCheckout}
          className="flex-1 py-2.5 bg-gradient-to-r from-[#B8955E] to-[#E3C9A3] text-white rounded-xl font-semibold shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
        >
          Checkout Securely
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      
      {!isPage && (
        <p className="text-center text-[9px] text-stone-400 uppercase tracking-widest mt-1.5">
          Taxes included. SSL encrypted.
        </p>
      )}
    </div>
  );
}
