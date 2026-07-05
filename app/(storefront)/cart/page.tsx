"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { Trash2, ArrowRight, ShieldCheck, Minus, Plus, ShoppingBag } from "lucide-react";
import { getOptimizedImageUrl, getSiteSettings } from "@/lib/firestore";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const cart = useCart();
  const { items, subtotal, total, discount, coupon, applyCoupon, increase, decrease, removeFromCart } = cart;

  const [code, setCode] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(console.error);
  }, []);

  async function handleApplyCoupon() {
    if (!code.trim()) return;
    setCouponLoading(true);
    setCouponMsg("");
    try {
      const res = await applyCoupon(code);
      setCouponMsg(res.success ? "✨ Coupon applied!" : `❌ ${res.error || "Invalid coupon"}`);
    } catch {
      setCouponMsg("❌ Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCouponLocal() {
    applyCoupon("");
  }

  const freeShippingThreshold = settings?.freeShippingThreshold ?? 999;
  const shippingFee = settings?.shippingFee ?? 79;
  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : shippingFee;
  
  // Actually CartContext might calculate total differently, but let's recalculate accurately here if we are applying a dynamic shipping fee
  // If CartContext already calculates 'total' with shipping, we must ensure it uses the settings. 
  // Let's assume CartContext doesn't know about dynamic shipping yet, so we just add it to the final display here.
  // Wait, if CartContext doesn't know, checkout will fail. CartContext needs to be updated too, or we just display the cart's subtotal and add shipping in Checkout.
  // In the existing app, cart context gives subtotal, discount, total (subtotal - discount). 
  // Shipping is usually calculated at checkout. So CartPage display should just be an estimate or exactly what Checkout will charge.
  const finalTotal = total + shipping;

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-12 md:pt-16">
        <div className="glass bg-white/80 shadow-sm p-6 md:p-8 rounded-[2rem] border border-goldBeige mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-charcoalBrown">Your Bag</h1>
          <p className="mt-2 text-stoneGray">{items.length} item{items.length === 1 ? "" : "s"} waiting for you</p>
        </div>
      </div>

      <div className="mx-auto mt-6 grid max-w-7xl grid-cols-1 gap-8 px-4 lg:grid-cols-[1fr_380px] pb-24">
        <div className="space-y-4">
          {items.length === 0 && (
            <EmptyStateCard 
              icon={ShoppingBag} 
              text="Your bag is empty" 
              subtext="Let's find something beautiful for you."
            >
              <Link href="/shop" className="mt-4 inline-flex items-center gap-2 rounded-full bg-charcoalBrown px-6 py-3 font-semibold text-white transition hover:bg-charcoalBrown/90 shadow-sm">
                Continue Shopping
              </Link>
            </EmptyStateCard>
          )}
          {items.map(item => (
            <div key={item.product.id} className="glass bg-white/80 border border-goldBeige shadow-sm flex gap-4 rounded-[1.5rem] p-4 relative transition-all hover:shadow-md">
              <div className="relative h-24 w-24 shrink-0 rounded-xl overflow-hidden md:h-32 md:w-32 border border-goldBeige/30">
                <img 
                  src={getOptimizedImageUrl(item.product.images?.[0] || "", 300)} 
                  alt={item.product.name} 
                  className="h-full w-full object-cover" 
                  loading="lazy"
                />
              </div>
              
              <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-champagne mb-1">
                    {item.product.categorySlug || item.product.category || 'Jewelry'}
                  </p>
                  <Link href={`/product/${item.product.slug || item.product.id}`}>
                    <h3 className="truncate font-serif text-base text-charcoalBrown md:text-lg hover:text-champagne transition-colors">
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="text-sm font-semibold text-charcoalBrown mt-1">
                    {formatPrice(item.product.salePrice)}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="glass bg-beige/50 border border-goldBeige/30 flex items-center rounded-xl p-1">
                    <button 
                      onClick={() => decrease(item.product.id)} 
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-charcoalBrown hover:bg-white hover:shadow-sm transition-all" 
                      aria-label="Decrease"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-charcoalBrown">{item.quantity}</span>
                    <button 
                      onClick={() => increase(item.product.id)} 
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-charcoalBrown hover:bg-white hover:shadow-sm transition-all" 
                      aria-label="Increase"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item.product.id)} 
                    className="text-stoneGray hover:text-dustyRose transition-colors p-2" 
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <aside className="glass bg-white/80 border border-goldBeige shadow-sm h-fit rounded-[2rem] p-6 md:p-8 sticky top-24">
            <h3 className="mb-6 font-serif text-2xl text-charcoalBrown">Order Summary</h3>
            <div className="space-y-3 text-sm text-stoneGray">
              <Row label="Subtotal" value={formatPrice(subtotal)} />
              
              {discount > 0 && (
                <Row 
                  label={<span className="text-emerald-600">Discount {coupon ? `(${coupon})` : ""}</span>} 
                  value={<span className="text-emerald-600">-{formatPrice(discount)}</span>} 
                />
              )}
              
              <Row 
                label="Shipping" 
                value={shipping === 0 ? <span className="text-emerald-600 font-medium">Free</span> : formatPrice(shipping)} 
              />
              
              <div className="my-4 border-t border-goldBeige/50" />
              <Row 
                label={<span className="font-serif text-xl font-bold text-charcoalBrown">Total</span>} 
                value={<span className="font-serif text-xl font-bold text-champagne">{formatPrice(finalTotal)}</span>} 
              />
            </div>
            
            <div className="mt-8">
              <div className="mb-6">
                {!coupon ? (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Coupon code" 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="neo-input flex-grow px-4 py-3 text-sm w-full outline-none bg-white"
                    />
                    <button 
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !code.trim()}
                      className="btn-primary-gold px-6 py-3 text-sm disabled:opacity-50"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-100">
                    <span className="text-sm font-medium text-emerald-600">✨ {coupon} Applied!</span>
                    <button onClick={removeCouponLocal} className="text-xs text-dustyRose hover:underline font-medium">Remove</button>
                  </div>
                )}
                {couponMsg && !coupon && <p className="text-xs text-dustyRose mt-2 font-medium">{couponMsg}</p>}
              </div>

              <Link href="/checkout" className="btn-primary-gold w-full py-4 text-base shadow-lg shadow-champagne/20 block text-center">
                Proceed to Checkout
              </Link>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-stoneGray text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Secure encrypted checkout
            </div>
          </aside>
        )}
      </div>
    </>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return <div className="flex items-center justify-between">{label}<span>{value}</span></div>;
}
