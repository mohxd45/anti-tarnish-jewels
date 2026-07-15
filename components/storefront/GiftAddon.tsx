"use client";

import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Gift } from "lucide-react";

export function GiftAddon({ compact = false }: { compact?: boolean }) {
  const { isGiftWrap, toggleGiftWrap, giftWrapPrice, giftMessage, setGiftMessage } = useCart();

  return (
    <div className={`bg-[#FFF9FB] border rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${isGiftWrap ? 'border-[#B8955E]' : 'border-[#E8D7C8]/70'}`}>
      <div className={`flex items-start justify-between ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex gap-3">
          <div className="bg-[#FFF0F5] p-2 rounded-lg text-[#B8955E]">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-serif text-[#3A2428] font-semibold text-[15px]">Make it a Gift</h4>
            <p className="text-xs text-[#8F817B] mt-0.5">Premium gift box + message card</p>
            <p className="text-sm font-bold text-[#B8955E] mt-1">{formatPrice ? formatPrice(giftWrapPrice) : `₹${giftWrapPrice}`}</p>
          </div>
        </div>
        
        <button 
          onClick={toggleGiftWrap}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all border ${isGiftWrap ? 'bg-[#FFF0F5] text-[#3A2428] border-[#E8D7C8]' : 'bg-[#B8955E] text-white border-transparent hover:bg-[#a3824f]'}`}
        >
          {isGiftWrap ? "Remove" : "Add"}
        </button>
      </div>

      {isGiftWrap && (
        <div className={`bg-[#FFF0F5]/50 border-t border-[#E8D7C8]/50 ${compact ? 'p-3' : 'p-4'}`}>
          <label className="text-xs font-semibold text-[#3A2428] block mb-1.5">Gift Message (Optional)</label>
          <textarea 
            value={giftMessage}
            onChange={(e) => setGiftMessage(e.target.value)}
            placeholder="Write a sweet message..."
            maxLength={160}
            rows={2}
            className="w-full text-sm border border-[#E8D7C8] rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#B8955E] focus:border-[#B8955E] bg-white resize-none"
          />
          <p className="text-[10px] text-right text-[#8F817B] mt-1">{giftMessage.length}/160</p>
        </div>
      )}
    </div>
  );
}
