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
    <div className={`bg-white border-t border-stone-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] w-full ${isPage ? 'fixed bottom-16 left-0 right-0 z-40 md:static md:shadow-none' : 'sticky bottom-0 z-40'}`}>
      <div className={`flex items-center justify-between gap-4 ${isPage ? 'max-w-7xl mx-auto' : ''}`}>
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">Total</span>
          <span className="text-lg font-bold text-charcoalBrown">
            {formatPrice ? formatPrice(total) : `₹${total.toLocaleString()}`}
          </span>
        </div>
        
        <button
          onClick={handleCheckout}
          className="flex-1 py-3.5 bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-white rounded-xl font-semibold shadow-lg shadow-[#c5a059]/20 hover:shadow-xl hover:shadow-[#c5a059]/30 transition-all flex items-center justify-center gap-2 group"
        >
          Checkout securely
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      
      {!isPage && (
        <p className="text-center text-[9px] text-stone-400 uppercase tracking-widest mt-3">
          Taxes included. SSL encrypted.
        </p>
      )}
    </div>
  );
}
