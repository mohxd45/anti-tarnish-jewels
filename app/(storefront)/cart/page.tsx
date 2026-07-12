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
    <div className="pb-40 md:pb-24 bg-brandMainBg min-h-[100dvh]">
      <div className="mx-auto max-w-6xl xl:max-w-[1140px] px-4 pt-8 md:pt-12">
        <h1 className="font-serif text-3xl md:text-4xl text-brandEspresso">Your Bag</h1>
        <p className="mt-2 text-brandMutedText">{items.length} item{items.length === 1 ? "" : "s"} waiting for you</p>
      </div>

      <div className="mx-auto mt-6 max-w-6xl xl:max-w-[1140px] px-4">
        <div className="rounded-2xl overflow-hidden border border-brandBorder/30 mb-8 bg-brandCardBg shadow-sm">
          <CartRewardTracker subtotal={subtotal} />
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl xl:max-w-[1140px] grid-cols-1 gap-8 px-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-10 items-start">
        <div className="space-y-4">
          {items.length === 0 && (
            <EmptyStateCard 
              icon={ShoppingBag} 
              text="Your bag is empty" 
              subtext="Let's find something beautiful for you."
            >
              <Link href="/shop" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brandEspresso px-8 py-3.5 font-semibold text-white transition hover:bg-stone-800 shadow-md">
                Continue Shopping
              </Link>
            </EmptyStateCard>
          )}
          
          {items.length > 0 && (
            <div className="bg-brandCardBg rounded-2xl border border-brandBorder/30 p-4 shadow-sm">
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
          <div className="mt-8 rounded-2xl overflow-hidden bg-brandCardBg border border-brandBorder/30 shadow-sm">
            <RecommendedProductSlider />
          </div>
        </div>

        {items.length > 0 && (
          <div className="hidden lg:block">
            <aside className="sticky top-24 bg-brandCardBg shadow-soft border border-brandBorder/30 rounded-2xl p-6">
              <h3 className="mb-6 font-serif text-2xl text-brandEspresso">Order Summary</h3>
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
                  label={<span className="font-serif text-xl font-bold text-brandEspresso">Total</span>} 
                  value={<span className="font-serif text-xl font-bold text-brandGoldDeep">{formatPrice ? formatPrice(total) : `₹${total.toLocaleString()}`}</span>} 
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
                          className="w-full pl-9 pr-3 py-3 text-sm border border-brandBorder/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-brandGold focus:border-brandGold bg-white transition-shadow"
                        />
                      </div>
                      <button 
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !code.trim()}
                        className="bg-brandGold hover:bg-brandGoldDeep text-white px-5 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors shadow-sm"
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
                <button onClick={() => router.push("/checkout")} className="w-full py-4 bg-gradient-gold text-white rounded-2xl font-semibold shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group">
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
