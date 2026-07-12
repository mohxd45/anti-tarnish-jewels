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
    <div className={`bg-brandCardBg border-t border-brandBorder/30 px-4 py-3 shadow-soft w-full ${isPage ? 'fixed bottom-[72px] left-0 right-0 z-40 md:static md:shadow-none' : 'sticky bottom-0 z-40'}`}>
      <div className={`flex items-center justify-between gap-4 ${isPage ? 'max-w-7xl mx-auto' : ''}`}>
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-brandMutedText">Total</span>
          <span className="text-lg font-bold text-brandEspresso">
            {formatPrice ? formatPrice(total) : `₹${total.toLocaleString()}`}
          </span>
        </div>
        
        <button
          onClick={handleCheckout}
          className="flex-1 py-3 bg-gradient-gold text-white rounded-xl font-semibold shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
        >
          Checkout Securely
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      
      {!isPage && (
        <p className="text-center text-[10px] text-brandMutedText uppercase tracking-widest mt-2">
          Taxes included. SSL encrypted.
        </p>
      )}
    </div>
  );
}
