"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { ShieldCheck, ShoppingBag, Tag } from "lucide-react";
import { getSiteSettings } from "@/lib/firestore";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { formatPrice } from "@/lib/utils";
import { CartRewardTracker } from "@/components/storefront/CartRewardTracker";
import { CartItemCard } from "@/components/storefront/CartItemCard";
import { RecommendedProductSlider } from "@/components/storefront/RecommendedProductSlider";
import { StickyCartSummaryBar } from "@/components/storefront/StickyCartSummaryBar";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const cart = useCart();
  const { items, subtotal, total, discount, coupon, applyCoupon, increase, decrease, removeFromCart, shipping } = cart;

  const [code, setCode] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const router = useRouter();

  async function handleApplyCoupon() {
    if (!code.trim()) return;
    setCouponLoading(true);
    setCouponMsg("");
    try {
      const res = await applyCoupon(code);
      setCouponMsg(res.success ? "✨ Coupon applied!" : `❌ ${res.error || "Invalid coupon"}`);
      if (res.success) setCode("");
    } catch {
      setCouponMsg("❌ Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCouponLocal() {
    applyCoupon("");
  }

  return (
    <div className="pb-32 md:pb-24">
      <div className="mx-auto max-w-7xl px-4 pt-8 md:pt-12">
        <h1 className="font-serif text-3xl md:text-4xl text-charcoalBrown">Your Bag</h1>
        <p className="mt-2 text-stone-500">{items.length} item{items.length === 1 ? "" : "s"} waiting for you</p>
      </div>

      <div className="mx-auto mt-6 max-w-7xl px-4">
        <div className="rounded-2xl overflow-hidden border border-stone-200 mb-8 bg-white shadow-sm">
          <CartRewardTracker subtotal={subtotal} />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {items.length === 0 && (
            <EmptyStateCard 
              icon={ShoppingBag} 
              text="Your bag is empty" 
              subtext="Let's find something beautiful for you."
            >
              <Link href="/shop" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-charcoalBrown px-8 py-3.5 font-semibold text-white transition hover:bg-stone-800 shadow-md">
                Continue Shopping
              </Link>
            </EmptyStateCard>
          )}
          
          {items.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
              <div className="space-y-1">
                {items.map(item => (
                  <CartItemCard 
                    key={item.product.id}
                    item={item}
                    increase={increase}
                    decrease={decrease}
                    removeFromCart={removeFromCart}
                  />
                ))}
              </div>
            </div>
          )}

          {/* You May Also Like */}
          <div className="mt-8 rounded-2xl overflow-hidden bg-white border border-stone-200 shadow-sm">
            <RecommendedProductSlider />
          </div>
        </div>

        {items.length > 0 && (
          <div className="hidden lg:block">
            <aside className="sticky top-24 bg-white shadow-sm border border-stone-200 rounded-2xl p-6">
              <h3 className="mb-6 font-serif text-2xl text-charcoalBrown">Order Summary</h3>
              <div className="space-y-3 text-sm text-stone-500">
                <Row label="Subtotal" value={formatPrice ? formatPrice(subtotal) : `₹${subtotal.toLocaleString()}`} />
                
                {discount > 0 && (
                  <Row 
                    label={<span className="text-emerald-600">Discount {coupon ? `(${coupon})` : ""}</span>} 
                    value={<span className="text-emerald-600">-{formatPrice ? formatPrice(discount) : `₹${discount.toLocaleString()}`}</span>} 
                  />
                )}
                
                <Row 
                  label="Shipping" 
                  value={shipping === 0 ? <span className="text-emerald-600 font-medium">Free</span> : (formatPrice ? formatPrice(shipping) : `₹${shipping.toLocaleString()}`)} 
                />
                
                <div className="my-4 border-t border-stone-100" />
                <Row 
                  label={<span className="font-serif text-xl font-bold text-charcoalBrown">Total</span>} 
                  value={<span className="font-serif text-xl font-bold text-[#c5a059]">{formatPrice ? formatPrice(total) : `₹${total.toLocaleString()}`}</span>} 
                />
              </div>
              
              <div className="mt-8">
                <div className="mb-6">
                  {!coupon ? (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                        <input 
                          type="text" 
                          placeholder="Discount code" 
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          className="w-full pl-9 pr-3 py-3 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#c5a059] focus:border-[#c5a059] bg-stone-50 transition-shadow"
                        />
                      </div>
                      <button 
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !code.trim()}
                        className="bg-stone-200 hover:bg-stone-300 text-charcoalBrown px-5 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors"
                      >
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100/50">
                      <span className="text-sm font-medium text-emerald-700">✨ {coupon} Applied!</span>
                      <button onClick={removeCouponLocal} className="text-xs text-dustyRose hover:text-red-600 font-semibold transition-colors">Remove</button>
                    </div>
                  )}
                  {couponMsg && !coupon && <p className="text-xs text-red-500 mt-2 font-medium px-1">{couponMsg}</p>}
                </div>

                <button onClick={() => router.push("/checkout")} className="w-full py-4 bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-white rounded-xl font-semibold shadow-lg shadow-[#c5a059]/20 hover:shadow-xl hover:shadow-[#c5a059]/30 transition-all flex items-center justify-center gap-2 group">
                  Proceed to Checkout
                </button>
              </div>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-stone-400 text-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Secure encrypted checkout
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Mobile Sticky Footer */}
      {items.length > 0 && (
        <div className="block lg:hidden">
          <StickyCartSummaryBar isPage={true} />
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return <div className="flex items-center justify-between">{label}<span>{value}</span></div>;
}
