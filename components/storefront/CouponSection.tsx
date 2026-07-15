"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Tag } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export function CouponSection({ compact = false }: { compact?: boolean }) {
  const { coupon, discount, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  async function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setCouponLoading(true);
    setCouponMsg("");
    try {
      const res = await applyCoupon(code);
      if (res.success) {
        setCouponMsg("");
        setCode("");
      } else {
        setCouponMsg(`❌ ${res.error || "Invalid coupon"}`);
      }
    } catch {
      setCouponMsg("❌ Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  }

  // Applied State
  if (coupon) {
    return (
      <div className={`bg-emerald-50 border border-emerald-100 rounded-xl ${compact ? 'p-3' : 'p-4'} flex flex-col gap-1.5`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-emerald-800 flex items-center gap-1.5">
            <Tag className="h-4 w-4 text-emerald-600" />
            {coupon} Applied
          </span>
          <button 
            onClick={() => { removeCoupon(); setCouponMsg(""); }} 
            className="text-xs text-[#3A2428]/60 hover:text-red-600 font-semibold transition-colors"
          >
            Remove
          </button>
        </div>
        <p className="text-xs text-emerald-700">
          You are saving <span className="font-bold">{formatPrice ? formatPrice(discount) : `₹${discount}`}</span> with this coupon.
        </p>
      </div>
    );
  }

  // Empty / Input State
  return (
    <div className={`bg-[#FFF9FB] border border-[#E8D7C8]/70 rounded-xl ${compact ? 'p-3' : 'p-4'}`}>
      <form onSubmit={handleApplyCoupon} className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value); setCouponMsg(""); }}
            placeholder={compact ? "Discount code" : "Have a coupon?"}
            className={`w-full pl-9 pr-3 text-sm border border-[#E8D7C8] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B8955E] focus:border-[#B8955E] bg-white transition-shadow ${compact ? 'py-2' : 'py-3'}`}
          />
        </div>
        <button
          type="submit"
          disabled={couponLoading || !code.trim()}
          className={`bg-[#B8955E] text-white text-sm font-semibold rounded-lg hover:bg-[#a3824f] transition-colors shadow-sm disabled:opacity-50 px-4 ${compact ? 'py-2' : 'py-3'}`}
        >
          {couponLoading ? "..." : "Apply"}
        </button>
      </form>
      {!compact && !couponMsg && (
        <p className="text-[11px] text-[#8F817B] mt-2 ml-1">Apply it here to unlock extra savings.</p>
      )}
      {couponMsg && <p className="text-xs text-red-500 mt-2 font-medium px-1">{couponMsg}</p>}
    </div>
  );
}
