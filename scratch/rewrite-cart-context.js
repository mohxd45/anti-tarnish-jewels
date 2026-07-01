const fs = require('fs');

const cartContent = `"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Trash2, ArrowRight, ShieldCheck, Minus, Plus } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/firestore";

export default function CartPage() {
  const cart = useCart();
  const { items, subtotal, total, discount, coupon, applyCoupon, increase, decrease, removeFromCart, clearCart } = cart;

  const [code, setCode] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  async function handleApplyCoupon() {
    if (!code.trim()) return;
    setCouponLoading(true);
    setCouponMsg("");
    try {
      const res = await applyCoupon(code);
      setCouponMsg(res.success ? "✨ Coupon applied!" : \`❌ \${res.error || "Invalid coupon"}\`);
    } catch {
      setCouponMsg("❌ Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCouponLocal() {
    // There is no explicit removeCoupon, but we can call applyCoupon with ""?
    // Actually the current CartContext applies empty to remove. Let's assume that.
    applyCoupon("");
  }

  if (items.length === 0) {
    return (
      <div className="bg-[var(--noir)] pt-32 pb-16 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-24 h-24 bg-[var(--charcoal)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-[var(--pink-200)]">
            <ShoppingCart className="w-10 h-10 text-[var(--stoneGray)]" />
          </div>
          <h1 className="font-display text-4xl text-[var(--ink)] mb-4">Your Cart is Empty</h1>
          <p className="text-[var(--stoneGray)] mb-8">Discover our waterproof and anti-tarnish pieces to add to your collection.</p>
          <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--noir)] pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="font-display text-4xl md:text-5xl text-[var(--ink)] mb-8">Your Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map(item => (
              <div key={item.product.id} className="glass-dark p-4 md:p-6 rounded-2xl flex gap-4 md:gap-6 items-center shadow-sm relative border-[var(--glass-border)]">
                <Link href={\`/product/\${item.product.slug || item.product.id}\`} className="flex-shrink-0">
                  <div className="w-20 h-24 md:w-24 md:h-28 bg-[var(--ivory)] rounded-xl overflow-hidden relative">
                    <Image src={getOptimizedImageUrl(item.product.images?.[0] || "", 200)} alt={item.product.name} fill className="object-cover" />
                  </div>
                </Link>
                <div className="flex-grow">
                  <p className="text-[var(--gold-dark)] text-[10px] md:text-xs font-semibold tracking-wider uppercase mb-1">{item.product.category}</p>
                  <Link href={\`/product/\${item.product.slug || item.product.id}\`}>
                    <h3 className="font-display text-lg md:text-xl text-[var(--ink)] font-semibold line-clamp-1 hover:text-[var(--rose)] transition-colors">{item.product.name}</h3>
                  </Link>
                  <p className="text-[var(--stoneGray)] text-sm mb-3">₹{item.product.price}</p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-[var(--charcoal)] rounded-lg px-2 py-1 border border-[var(--pink-200)]">
                      <button 
                        onClick={() => decrease(item.product.id)}
                        className="text-[var(--ink)] p-1"
                      >-</button>
                      <span className="font-bold text-[var(--ink)] w-4 text-center text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => increase(item.product.id)}
                        className="text-[var(--ink)] p-1"
                      >+</button>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => removeFromCart(item.product.id)}
                  className="absolute top-4 right-4 p-2 text-[var(--stoneGray)] hover:text-red-500 transition-colors bg-white/50 rounded-full"
                >
                  <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass-dark p-6 md:p-8 rounded-3xl sticky top-24 border-[var(--glass-border)] shadow-sm">
              <h2 className="font-display text-2xl text-[var(--ink)] mb-6 font-semibold">Order Summary</h2>
              
              <div className="space-y-4 mb-6 text-sm md:text-base text-[var(--ink)]">
                <div className="flex justify-between">
                  <span className="text-[var(--stoneGray)]">Subtotal</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[var(--success)] font-medium">
                    <span>Discount {coupon ? \`(\${coupon})\` : ""}</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[var(--stoneGray)]">Shipping</span>
                  <span className="text-[var(--success)] font-medium">Free</span>
                </div>
                
                <div className="border-t border-[var(--pink-200)] pt-4 mt-4 flex justify-between items-end">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="font-display text-3xl font-bold text-[var(--ink)]">₹{total}</span>
                </div>
              </div>

              {/* Coupon Code */}
              <div className="mb-6">
                {!coupon ? (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Promo Code" 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="neo-input flex-grow px-4 py-2.5 text-sm w-full outline-none focus:ring-1 focus:ring-[var(--rose)]"
                    />
                    <button 
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !code.trim()}
                      className="bg-[var(--gold)] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--gold-dark)] disabled:opacity-50"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-[var(--pink-100)] px-4 py-2.5 rounded-xl border border-[var(--pink-200)]">
                    <span className="text-sm font-medium text-[var(--success)]">✨ {coupon} Applied!</span>
                    <button onClick={removeCouponLocal} className="text-xs text-[var(--stoneGray)] hover:text-red-500 underline">Remove</button>
                  </div>
                )}
                {couponMsg && !coupon && <p className="text-xs text-red-500 mt-2">{couponMsg}</p>}
              </div>

              <Link href="/checkout" className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-2 mb-6 text-lg shadow-glow">
                Checkout securely
              </Link>

              <div className="flex items-center gap-3 justify-center text-[var(--stoneGray)] text-xs">
                <ShieldCheck className="w-4 h-4 text-[var(--gold)]" />
                <span>Secure encrypted checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShoppingCart(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="8" cy="21" r="1"></circle>
      <circle cx="19" cy="21" r="1"></circle>
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
    </svg>
  );
}
`;

fs.writeFileSync('app/cart/page.tsx', cartContent);
