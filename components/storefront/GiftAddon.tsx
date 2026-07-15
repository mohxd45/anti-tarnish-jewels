"use client";

import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Gift } from "lucide-react";

export function GiftAddon({ compact = false }: { compact?: boolean }) {
  const { isGiftWrap, toggleGiftWrap, giftWrapPrice, giftMessage, setGiftMessage } = useCart();

  return (
    <div className={`bg-[#FFF9FB] border rounded-2xl overflow-hidden transition-all duration-300 ${isGiftWrap ? 'border-[#B8955E] shadow-[0_2px_12px_rgba(184,149,94,0.15)]' : 'border-[#E8D7C8]/70 shadow-sm hover:border-[#B8955E]/50'}`}>
      <div className={`flex items-start justify-between gap-2 ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex gap-3">
          <div className="bg-[#FFF0F5] p-2.5 rounded-xl text-[#B8955E] shrink-0 border border-[#B8955E]/10 flex items-center justify-center">
            <Gift className="h-5 w-5" />
          </div>
          <div className="flex flex-col justify-center">
            <h4 className="font-serif text-[#3A2428] font-semibold text-[15px] leading-tight">Make it a Gift</h4>
            <p className="text-[11px] sm:text-xs text-[#8F817B] mt-0.5 leading-tight">Premium gift box + message card</p>
            <p className="text-xs sm:text-sm font-bold text-[#B8955E] mt-1.5">{formatPrice ? formatPrice(giftWrapPrice) : `₹${giftWrapPrice}`}</p>
          </div>
        </div>
        
        <button 
          onClick={toggleGiftWrap}
          className={`px-4 py-2 mt-0.5 shrink-0 rounded-xl text-[11px] font-bold tracking-wide uppercase transition-all border ${isGiftWrap ? 'bg-[#FFF0F5] text-[#3A2428] border-[#E8D7C8] hover:bg-[#ffeaf2]' : 'bg-[#B8955E] text-white border-transparent hover:bg-[#a3824f] shadow-sm hover:shadow-md'}`}
        >
          {isGiftWrap ? "Remove" : "Add"}
        </button>
      </div>

      {isGiftWrap && (
        <div className={`bg-white border-t border-[#E8D7C8]/50 ${compact ? 'p-3' : 'p-4'}`}>
          <label className="text-[11px] uppercase tracking-wider font-bold text-[#3A2428] block mb-2">Gift Message (Optional)</label>
          <textarea 
            value={giftMessage}
            onChange={(e) => setGiftMessage(e.target.value)}
            placeholder="Write a sweet message..."
            maxLength={160}
            rows={2}
            className="w-full text-[13px] border border-[#E8D7C8] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#B8955E] focus:border-[#B8955E] bg-[#FFF9FB] resize-none transition-colors"
          />
          <p className="text-[10px] text-right text-[#8F817B] mt-1.5 font-medium">{giftMessage.length}/160</p>
        </div>
      )}
    </div>
  );
}
