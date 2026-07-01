"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Trash2, ArrowRight, ShieldCheck, Minus, Plus } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/firestore";

export default function CartPage() {
  const cart = useCart();
  const { items, subtotal, total, discount, coupon, applyCoupon, increase, decrease, removeFromCart } = cart;

  const [code, setCode] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

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

  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 79;

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <h1 className="font-serif text-4xl text-pink-900 md:text-5xl">Your Cart</h1>
        <p className="mt-2 text-pink-600">{items.length} item{items.length === 1 ? "" : "s"} in your bag</p>
      </div>

      <div className="mx-auto mt-6 grid max-w-7xl grid-cols-1 gap-6 px-4 lg:grid-cols-[1fr_360px] pb-16">
        <div className="space-y-4">
          {items.length === 0 && (
            <div className="glass-dark rounded-2xl p-10 text-center">
              <p className="mb-4 text-pink-700">Your cart is empty.</p>
              <Link href="/shop" className="btn-primary-gold inline-flex items-center gap-2">
                Continue shopping <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
          {items.map(item => (
            <div key={item.product.id} className="glass-dark flex gap-3 rounded-2xl p-3 md:gap-4 md:p-4 relative">
              <img 
                src={getOptimizedImageUrl(item.product.images?.[0] || "", 200)} 
                alt={item.product.name} 
                className="h-24 w-24 shrink-0 rounded-xl object-cover md:h-28 md:w-28" 
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-xs uppercase tracking-wide text-pink-600">{item.product.categorySlug || item.product.category}</p>
                <Link href={`/product/${item.product.slug || item.product.id}`}>
                  <h3 className="truncate font-serif text-base text-pink-900 md:text-lg hover:text-pink-700">{item.product.name}</h3>
                </Link>
                <p className="text-sm font-semibold text-pink-900">
                  ₹{item.product.salePrice}
                </p>
                <div className="mt-auto flex items-center justify-between gap-2">
                  <div className="glass flex items-center rounded-xl p-1">
                    <button 
                      onClick={() => decrease(item.product.id)} 
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-pink-900 hover:bg-pink-100" aria-label="Decrease"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-pink-900">{item.quantity}</span>
                    <button 
                      onClick={() => increase(item.product.id)} 
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-pink-900 hover:bg-pink-100" aria-label="Increase"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.product.id)} className="text-pink-600 hover:text-pink-700" aria-label="Remove">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <aside className="glass-dark h-fit rounded-2xl p-6">
            <h3 className="mb-4 font-serif text-xl text-pink-900">Order summary</h3>
            <div className="space-y-2 text-sm text-pink-700">
              <Row label="Subtotal" value={`₹${subtotal}`} />
              
              {discount > 0 && (
                <Row 
                  label={<span className="text-green-600">Discount {coupon ? `(${coupon})` : ""}</span>} 
                  value={<span className="text-green-600">-₹{discount}</span>} 
                />
              )}
              
              <Row label="Shipping" value={shipping === 0 ? "Free" : `₹${shipping}`} />
              
              <div className="my-3 border-t border-pink-200" />
              <Row 
                label={<span className="font-serif text-lg text-pink-900">Total</span>} 
                value={<span className="font-serif text-lg text-pink-900">₹{total}</span>} 
              />
            </div>
            
            <div className="mt-6">
              <div className="mb-4">
                {!coupon ? (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Coupon code" 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="neo-input flex-grow px-4 py-2 text-sm w-full outline-none"
                    />
                    <button 
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !code.trim()}
                      className="btn-primary-gold px-4 py-2 !rounded-xl text-sm disabled:opacity-50"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-pink-100/50 px-4 py-2.5 rounded-xl border border-pink-200">
                    <span className="text-sm font-medium text-green-600">✨ {coupon} Applied!</span>
                    <button onClick={removeCouponLocal} className="text-xs text-pink-600 hover:text-red-500 underline">Remove</button>
                  </div>
                )}
                {couponMsg && !coupon && <p className="text-xs text-red-500 mt-2">{couponMsg}</p>}
              </div>

              <Link href="/checkout" className="btn-primary-gold w-full py-3">Checkout</Link>
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-2 text-pink-600 text-xs">
              <ShieldCheck className="h-4 w-4" /> Secure encrypted checkout
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
