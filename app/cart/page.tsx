"use client";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Gift, Package, ShieldCheck, ShoppingBag, Trash2, ArrowLeft, Plus, Minus, X, Sparkles } from "lucide-react";
import { PublicJewelryBackground } from "@/components/ui/PublicJewelryBackground";

export default function CartPage() {
  const cart = useCart();
  const [code, setCode] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  async function handleApplyCoupon() {
    if (!code.trim()) return;
    setCouponLoading(true);
    setCouponMsg("");
    try {
      const res = await cart.applyCoupon(code);
      setCouponMsg(res.success ? "✓ Coupon applied!" : `✗ ${res.error || "Invalid or expired coupon code."}`);
    } catch {
      setCouponMsg("✗ Failed to apply coupon. Try again.");
    } finally {
      setCouponLoading(false);
    }
  }

  if (!cart.items.length) {
    return (
      <PublicJewelryBackground variant="subtle" intensity="low" className="min-h-screen pt-20" contentClassName="mx-auto max-w-xl px-4 py-20 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-champagne/10 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-champagne" />
        </div>
        <h1 className="text-3xl font-serif font-semibold text-charcoalBrown">Your jewellery cart is empty</h1>
        <p className="mt-4 text-stoneGray leading-relaxed max-w-sm mx-auto">
          Explore our collections and discover beautiful waterproof pieces.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-champagne px-8 py-3.5 text-sm font-semibold text-charcoalBrown hover:bg-champagne/90 transition-all shadow-jewel hover:shadow-champagne/25"
        >
          Explore Collection
        </Link>
      </PublicJewelryBackground>
    );
  }

  const threshold = cart.freeShippingThreshold;
  const progress = threshold ? Math.min((cart.subtotal / threshold) * 100, 100) : 0;
  const remaining = threshold ? Math.max(threshold - cart.subtotal, 0) : 0;
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const giftThreshold = 1499;
  const giftRemaining = Math.max(giftThreshold - cart.subtotal, 0);
  const giftUnlocked = cart.subtotal >= giftThreshold;

  return (
    <PublicJewelryBackground variant="subtle" intensity="low" className="min-h-screen" contentClassName="mx-auto max-w-7xl px-4 py-8 md:py-10 pb-32">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-4xl font-serif font-semibold text-charcoalBrown">
          Your Jewellery Cart <span className="text-lg text-stoneGray font-sans font-normal">({totalItems} piece{totalItems !== 1 ? 's' : ''})</span>
        </h1>
        <button
          onClick={() => cart.clearCart()}
          className="flex items-center gap-1.5 text-xs text-dustyRose hover:underline transition-colors shrink-0 ml-2"
        >
          <Trash2 size={13} /> Clear all
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Cart Items */}
        <div className="grid gap-3 h-fit">
          {cart.items.map((item) => (
            <div key={item.product.id} className="flex gap-2.5 sm:gap-4 rounded-2xl sm:rounded-3xl border border-goldBeige bg-white/70 backdrop-blur-md p-2.5 sm:p-4 shadow-jewel hover:border-champagne/60 transition-colors">
              <Link href={`/product/${item.product.slug}`} className="relative h-20 w-20 min-[360px]:h-24 min-[360px]:w-24 shrink-0 overflow-hidden rounded-2xl bg-beige border border-goldBeige/20">
                <Image src={item.product.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600"} alt={item.product.name} fill className="object-cover" sizes="96px" />
              </Link>
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link href={`/product/${item.product.slug}`} className="font-semibold text-charcoalBrown text-xs sm:text-sm leading-snug line-clamp-2 hover:text-champagne transition-colors">
                      {item.product.name}
                    </Link>
                    {/* Jewellery badges */}
                    <div className="flex gap-1.5 mt-1">
                      {item.product.waterproof && <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md border border-emerald-200">💧 Waterproof</span>}
                      {item.product.antiTarnish && <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md border border-amber-200">✨ Anti-Tarnish</span>}
                    </div>
                  </div>
                  <button onClick={() => cart.removeFromCart(item.product.id)} className="shrink-0 rounded-full p-1 text-stoneGray hover:text-dustyRose hover:bg-dustyRose/10 transition-colors" aria-label="Remove item">
                    <X size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap items-center justify-between mt-2 gap-2">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button onClick={() => cart.decrease(item.product.id)} className="rounded-full border border-goldBeige w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-champagne hover:bg-champagne/10 transition-colors shrink-0" aria-label="Decrease">
                      <Minus size={12} />
                    </button>
                    <span className="w-5 sm:w-6 text-center text-xs sm:text-sm font-semibold text-charcoalBrown">{item.quantity}</span>
                    <button onClick={() => cart.increase(item.product.id)} className="rounded-full border border-goldBeige w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-champagne hover:bg-champagne/10 transition-colors shrink-0" aria-label="Increase">
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-charcoalBrown truncate ml-auto">{formatPrice(item.product.salePrice * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary sidebar */}
        <aside className="h-fit lg:sticky lg:top-24 rounded-[2rem] border border-goldBeige bg-white/70 backdrop-blur-md p-4 sm:p-6 shadow-jewel space-y-5">
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-champagne border-b border-goldBeige/20 pb-3">Order Summary</h2>
          
          {/* Free Shipping Alert & Progress */}
          {threshold !== null && threshold > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-stoneGray font-medium">
                <span>{remaining > 0 ? `Add ${formatPrice(remaining)} more for free shipping` : '🎉 Free shipping unlocked!'}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 rounded-full bg-beige overflow-hidden">
                <div className="h-full rounded-full bg-champagne transition-all duration-500 min-w-[2px]" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Free Gift Promo */}
          <div className="rounded-2xl bg-champagne/5 border border-champagne/20 p-3.5 text-xs text-charcoalBrown space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-champagne">
              <Sparkles size={14} className="animate-pulse" />
              <span>Free Gift Promotion</span>
            </div>
            <p className="text-stoneGray leading-relaxed">
              {giftUnlocked ? (
                <span className="text-emerald-700 font-medium">🎉 You've unlocked a Free Mystery Jewellery Gift with this order!</span>
              ) : (
                <span>Add <strong className="text-charcoalBrown">{formatPrice(giftRemaining)}</strong> more to unlock a <strong>Free Mystery Jewellery Gift</strong>!</span>
              )}
            </p>
          </div>

          {/* Coupon Input */}
          <div className="space-y-2">
            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                placeholder="Promo code (e.g. ATJ20)"
                className="flex-1 w-full min-w-0 rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-4 py-2.5 outline-none text-charcoalBrown focus:border-champagne transition-all text-sm"
                disabled={!!cart.coupon}
              />
              {cart.coupon ? (
                <button onClick={() => { cart.applyCoupon(''); setCode(''); setCouponMsg(''); }} className="shrink-0 w-full sm:w-auto rounded-full bg-dustyRose/20 px-4 py-2.5 sm:py-2 text-xs font-semibold text-dustyRose hover:bg-dustyRose/30 transition-all">Remove</button>
              ) : (
                <button onClick={handleApplyCoupon} disabled={couponLoading || !code.trim()} className="shrink-0 w-full sm:w-auto rounded-full bg-champagne px-4 py-2.5 sm:py-2 text-xs font-semibold text-charcoalBrown hover:opacity-90 disabled:opacity-50 transition-all">
                  {couponLoading ? '...' : 'Apply'}
                </button>
              )}
            </div>
            {couponMsg && (
              <p className={`text-xs ${couponMsg.startsWith('✓') ? 'text-emerald-600' : 'text-dustyRose'}`}>{couponMsg}</p>
            )}
          </div>

          {/* Price breakdown */}
          <div className="grid gap-2.5 text-sm text-stoneGray border-t border-goldBeige/20 pt-4">
            <div className="flex justify-between"><span>Subtotal</span><span className="text-charcoalBrown font-medium">{formatPrice(cart.subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span className="text-charcoalBrown font-medium">{cart.shipping === 0 ? 'Free' : formatPrice(cart.shipping)}</span></div>
            {cart.discount > 0 && (
              <div className="flex justify-between text-dustyRose"><span>Discount ({cart.coupon})</span><span className="font-semibold">-{formatPrice(cart.discount)}</span></div>
            )}
            {giftUnlocked && (
              <div className="flex justify-between text-emerald-700"><span className="flex items-center gap-1">🎁 Mystery Gift</span><span className="font-semibold">FREE</span></div>
            )}
            <div className="flex justify-between border-t border-goldBeige/20 pt-3 text-lg font-serif font-semibold text-champagne">
              <span>Total</span><span>{formatPrice(cart.total)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Link href="/checkout" className="block w-full rounded-full bg-champagne py-3.5 text-center font-semibold text-charcoalBrown hover:opacity-90 transition-all shadow-jewel hover:scale-[1.01]">
              Proceed to Checkout
            </Link>
            <Link href="/shop" className="block text-center text-xs text-stoneGray hover:text-champagne transition-colors">
              Continue Shopping
            </Link>
          </div>

          {/* Trust Policies / Badges */}
          <div className="grid grid-cols-2 gap-2 text-center text-[10px] text-stoneGray border-t border-goldBeige/25 pt-4">
            <div className="flex flex-col items-center p-2 rounded-xl bg-white/70 backdrop-blur-md border border-goldBeige/20">
              <span className="text-champagne font-bold text-xs mb-0.5">✓ COD Available</span>
              <span>Pay on delivery</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-xl bg-white/70 backdrop-blur-md border border-goldBeige/20">
              <span className="text-champagne font-bold text-xs mb-0.5">✓ Easy Returns</span>
              <span>7-day exchange</span>
            </div>
          </div>

          {/* Jewellery Care Note */}
          <div className="rounded-2xl bg-dustyRose/5 border border-dustyRose/15 p-3 text-[11px] text-stoneGray leading-relaxed">
            <span className="font-semibold text-dustyRose block mb-1">✨ Jewellery Care Tip:</span>
            Store pieces individually in airtight bags and keep them dry to preserve their luxurious polish forever.
          </div>
        </aside>
      </div>
    </PublicJewelryBackground>
  );
}
