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
import { SavingsBanner } from "@/components/storefront/SavingsBanner";
import { CouponSection } from "@/components/storefront/CouponSection";
import { GiftAddon } from "@/components/storefront/GiftAddon";

export default function CartPage() {
  const { items, subtotal, total, discount, coupon, increase, decrease, removeFromCart, shipping, isGiftWrap, giftWrapPrice } = useCart();
  const router = useRouter();
  return (
    <>
      <style>{`
        .whatsapp-button { display: none !important; }
      `}</style>
      <div className="pb-48 md:pb-32 bg-[#FFF0F5] min-h-[100dvh]">
        <div className="mx-auto max-w-6xl xl:max-w-[1140px] px-4 pt-8 md:pt-12">
          <h1 className="font-serif text-3xl md:text-4xl text-[#3A2428]">Your Bag</h1>
          <p className="mt-2 text-[#8F817B]">{items.length} item{items.length === 1 ? "" : "s"} waiting for you</p>
        </div>

        <div className="mx-auto mt-6 max-w-6xl xl:max-w-[1140px] px-4">
          <div className="rounded-2xl overflow-hidden border border-[#E8D7C8]/50 mb-8 bg-[#FFF9FB] shadow-sm">
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
                <Link href="/shop" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#3A2428] px-8 py-3.5 font-semibold text-white transition hover:bg-[#2a1a1d] shadow-md">
                  Continue Shopping
                </Link>
              </EmptyStateCard>
            )}
            
            {items.length > 0 && (
              <div className="bg-[#FFF9FB] rounded-2xl border border-[#E8D7C8]/50 p-4 shadow-sm">
                <div className="space-y-1">
                  {items.map(item => (
                    <CartItemCard 
                      key={item.cartItemId || item.product.id}
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
            <div className="mt-8 rounded-2xl overflow-hidden bg-[#FFF9FB] border border-[#E8D7C8]/50 shadow-sm">
              <RecommendedProductSlider />
            </div>
          </div>

          {items.length > 0 && (
            <div className="hidden lg:block">
              <aside className="sticky top-24 bg-[#FFF9FB] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#E8D7C8]/50 rounded-[24px] p-6">
                <h3 className="mb-6 font-serif text-2xl text-[#3A2428]">Order Summary</h3>
                <div className="space-y-3 text-sm text-[#8F817B]">
                  <Row label="Subtotal" value={formatPrice ? formatPrice(subtotal) : `₹${subtotal.toLocaleString()}`} />
                  
                  {discount > 0 && (
                    <Row 
                      label={<span className="text-emerald-600">Discount {coupon ? `(${coupon})` : ""}</span>} 
                      value={<span className="text-emerald-600">-{formatPrice ? formatPrice(discount) : `₹${discount.toLocaleString()}`}</span>} 
                    />
                  )}
                  
                  <Row 
                    label="Shipping" 
                    value={shipping === 0 ? <span className="text-[#B8955E] font-medium">Free</span> : (formatPrice ? formatPrice(shipping) : `₹${shipping.toLocaleString()}`)} 
                  />
                  
                  {isGiftWrap && (
                    <Row 
                      label={<span className="text-[#B8955E] flex items-center gap-1.5"><Tag className="h-3 w-3" /> Gift Wrap</span>} 
                      value={<span className="text-[#B8955E]">+{formatPrice ? formatPrice(giftWrapPrice) : `₹${giftWrapPrice}`}</span>} 
                    />
                  )}
                  
                  <div className="my-4 border-t border-[#E8D7C8]/50" />
                  <Row 
                    label={<span className="font-serif text-xl font-bold text-[#3A2428]">Total</span>} 
                    value={<span className="font-serif text-xl font-bold text-[#B8955E]">{formatPrice ? formatPrice(total) : `₹${total.toLocaleString()}`}</span>} 
                  />
                </div>
                <div className="mt-8 mb-6 flex flex-col gap-3">
                  <SavingsBanner />
                  <CouponSection />
                  <GiftAddon />
                </div>
                <button onClick={() => router.push("/checkout")} className="w-full py-3.5 bg-gradient-to-r from-[#B8955E] to-[#E3C9A3] text-white rounded-xl font-semibold shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group">
                  Proceed to Checkout
                </button>
                
                <div className="mt-6 flex items-center justify-center gap-2 text-stone-400 text-xs">
                  <ShieldCheck className="h-4 w-4 text-[#B8955E]/70" /> Secure encrypted checkout
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
    </>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return <div className="flex items-center justify-between">{label}<span>{value}</span></div>;
}
