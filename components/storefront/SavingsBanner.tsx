"use client";

import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export function SavingsBanner() {
  const { totalSavings } = useCart();

  if (totalSavings <= 0) return null;

  return (
    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-4 flex items-center justify-center gap-2 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400" />
      <Sparkles className="h-4 w-4 text-[#B8955E]" />
      <p className="text-emerald-800 font-medium text-sm">
        You saved <span className="font-bold">{formatPrice ? formatPrice(totalSavings) : `₹${totalSavings.toLocaleString()}`}</span> so far 🎉
      </p>
    </div>
  );
}
