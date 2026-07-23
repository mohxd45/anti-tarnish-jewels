"use client";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { getOptimizedImageUrl } from "@/lib/firestore";
import { Address } from "@/types";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { formatPrice } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ShieldCheck, ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { SavingsBanner } from "@/components/storefront/SavingsBanner";
import { CouponSection } from "@/components/storefront/CouponSection";
import { GiftAddon } from "@/components/storefront/GiftAddon";
import { auth } from "@/lib/firebase";

export default function CheckoutPage() {
  const { user } = useAuth();
  const cart = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [address, setAddress] = useState<Address>({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    import("@/lib/firestore").then(m => m.getSiteSettings().then(setSettings).catch(console.error));
  }, []);

  useEffect(() => {
    if (cart.isLoaded && !cart.items.length) {
      router.push("/cart");
    }
  }, [cart.items.length, cart.isLoaded, router]);

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!address.fullName || !address.phone || !address.line1 || !address.city || !address.pincode) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    try {
      setLoading(true);
      
      let token = "";
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          items: cart.items.map(i => ({
            productId: i.productId,
            bundleId: i.bundleId,
            quantity: i.quantity,
            selectedSize: i.selectedSize,
            selectedColor: i.selectedColor,
            cartItemId: i.cartItemId
          })),
          address,
          giftWrapSelected: cart.isGiftWrap,
          giftMessage: cart.isGiftWrap ? cart.giftMessage : "",
          paymentMethod: "cod",
          couponCode: cart.coupon || ""
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to place order.");
      }

      cart.clearCart();
      router.push(`/order-success?id=${data.orderId}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to place order.");
      setLoading(false);
    }
  }

  if (!cart.isLoaded || !cart.items.length) return null;

  return (
    <>
      <style>{`
        .whatsapp-button { display: none !important; }
        .mobile-bottom-nav { display: none !important; }
      `}</style>
      
      <div className="mx-auto max-w-6xl xl:max-w-[1100px] px-4 pt-28 md:pt-32">
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <Link href="/cart" className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-[#E8D7C8] text-[#3A2428] transition hover:bg-[#FFF9FB] hover:border-[#B8955E] shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-serif text-[28px] md:text-4xl text-[#3A2428] leading-tight">Checkout</h1>
            <p className="mt-0.5 text-sm text-[#8F817B]">Almost there — review and place your order</p>
          </div>
        </div>
      </div>

      <form id="checkout-form" onSubmit={handlePlaceOrder} className="mx-auto grid grid-cols-1 gap-5 px-4 lg:grid-cols-[minmax(0,540px)_minmax(0,400px)] xl:grid-cols-[600px_420px] lg:justify-center lg:gap-12 pb-32 lg:pb-24 items-start">
        
        {/* Left Column (Forms) */}
        <div className="flex flex-col gap-4 md:gap-5">
          <Section title="Contact">
            <Field label="Full name *">
              <input 
                required
                className="w-full bg-white border border-[#E8D7C8] rounded-2xl px-4 py-3 text-base text-[#3A2428] placeholder-stone-400 focus:border-[#B8955E] focus:outline-none transition-colors" 
                placeholder="Your name" 
                value={address.fullName}
                onChange={e => setAddress({...address, fullName: e.target.value})}
              />
            </Field>
            <Field label="Email">
              <input 
                type="email" 
                className="w-full bg-white border border-[#E8D7C8] rounded-2xl px-4 py-3 text-base text-[#3A2428] placeholder-stone-400 focus:border-[#B8955E] focus:outline-none transition-colors disabled:bg-stone-50 disabled:text-stone-500" 
                placeholder="you@example.com" 
                defaultValue={user?.email || ""}
                disabled={!!user?.email}
              />
            </Field>
            <Field label="Phone *">
              <input 
                required
                type="tel"
                className="w-full bg-white border border-[#E8D7C8] rounded-2xl px-4 py-3 text-base text-[#3A2428] placeholder-stone-400 focus:border-[#B8955E] focus:outline-none transition-colors" 
                placeholder="+91" 
                value={address.phone}
                onChange={e => setAddress({...address, phone: e.target.value})}
              />
            </Field>
          </Section>
          
          <Section title="Shipping address">
            <Field label="Address Line 1 *">
              <input 
                required
                className="w-full bg-white border border-[#E8D7C8] rounded-2xl px-4 py-3 text-base text-[#3A2428] placeholder-stone-400 focus:border-[#B8955E] focus:outline-none transition-colors" 
                placeholder="House / Flat / Street" 
                value={address.line1}
                onChange={e => setAddress({...address, line1: e.target.value})}
              />
            </Field>
            <Field label="Apartment, suite, etc. (optional)">
              <input 
                className="w-full bg-white border border-[#E8D7C8] rounded-2xl px-4 py-3 text-base text-[#3A2428] placeholder-stone-400 focus:border-[#B8955E] focus:outline-none transition-colors" 
                placeholder="" 
                value={address.line2}
                onChange={e => setAddress({...address, line2: e.target.value})}
              />
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="City *">
                <input 
                  required
                  className="w-full bg-white border border-[#E8D7C8] rounded-2xl px-4 py-3 text-base text-[#3A2428] placeholder-stone-400 focus:border-[#B8955E] focus:outline-none transition-colors" 
                  value={address.city}
                  onChange={e => setAddress({...address, city: e.target.value})}
                />
              </Field>
              <Field label="State *">
                <input 
                  required
                  className="w-full bg-white border border-[#E8D7C8] rounded-2xl px-4 py-3 text-base text-[#3A2428] placeholder-stone-400 focus:border-[#B8955E] focus:outline-none transition-colors" 
                  value={address.state}
                  onChange={e => setAddress({...address, state: e.target.value})}
                />
              </Field>
            </div>
            <Field label="Pincode *">
              <input 
                required
                className="w-full bg-white border border-[#E8D7C8] rounded-2xl px-4 py-3 text-base text-[#3A2428] placeholder-stone-400 focus:border-[#B8955E] focus:outline-none transition-colors" 
                value={address.pincode}
                onChange={e => setAddress({...address, pincode: e.target.value})}
              />
            </Field>
          </Section>

          <Section title="Payment method">
            <label className={`flex items-start gap-3 p-4 border border-[#E8D7C8] rounded-2xl transition-colors ${settings?.codEnabled !== false && cart.total > 300 ? 'bg-white cursor-pointer hover:border-[#B8955E]' : 'bg-stone-50 cursor-not-allowed opacity-60'}`}>
              <input type="radio" name="pm" defaultChecked={cart.total > 300} disabled={settings?.codEnabled === false || cart.total <= 300} className="mt-1 accent-[#B8955E] h-4 w-4" /> 
              <div className="flex flex-col w-full">
                <span className={`text-base font-medium ${(settings?.codEnabled === false || cart.total <= 300) ? 'text-stone-400' : 'text-[#3A2428]'}`}>
                  Cash on Delivery
                  {settings?.codEnabled === false && " (Disabled)"}
                </span>
                
                {settings?.codEnabled !== false && cart.total <= 300 && (
                  <span className="text-sm text-red-500 mt-0.5 font-medium">Minimum order value for COD is ₹301. Please add more items to your cart.</span>
                )}
              </div>
            </label>

            {/* Advance Required Card rendering right beneath the COD label */}
            {settings?.codEnabled !== false && cart.total > 300 && (
              <div className="bg-[#FFF9FB] p-5 rounded-2xl border border-[#B8955E]/40 shadow-sm mt-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#B8955E]" />
                <h4 className="font-serif text-[18px] text-[#3A2428] mb-2 font-medium flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#B8955E]" /> ₹100 Advance Required
                </h4>
                <p className="text-[13px] text-[#8F817B] mb-4 leading-relaxed">
                  To confirm your COD order, ₹100 advance is required. After advance confirmation, the remaining amount will be collected when your jewellery is delivered.
                </p>
                <div className="bg-white border border-[#E8D7C8]/50 rounded-xl p-3 text-sm space-y-1.5">
                  <div className="flex justify-between text-[#8F817B]">
                    <span>Order Total</span>
                    <span>₹{cart.total}</span>
                  </div>
                  <div className="flex justify-between text-[#B8955E] font-medium border-b border-[#E8D7C8]/30 pb-1.5">
                    <span>Advance Required</span>
                    <span>₹100</span>
                  </div>
                  <div className="flex justify-between text-[#3A2428] font-medium pt-1">
                    <span>Balance After Advance</span>
                    <span>₹{cart.total - 100}</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#8F817B] mt-3 font-medium bg-[#B8955E]/5 inline-block px-2 py-1 rounded">
                  * ₹100 advance is part of your total, not an extra charge.
                </p>
              </div>
            )}
            
            <label className="flex items-start gap-3 p-4 border border-[#E8D7C8] rounded-2xl bg-stone-50 cursor-not-allowed opacity-70">
              <input type="radio" name="pm" disabled className="mt-1 h-4 w-4" /> 
              <div className="flex flex-col">
                <span className="text-base font-medium text-stone-500">UPI</span>
                <span className="text-sm text-stone-400 mt-0.5">Coming soon</span>
              </div>
            </label>
            
            <label className="flex items-start gap-3 p-4 border border-[#E8D7C8] rounded-2xl bg-stone-50 cursor-not-allowed opacity-70">
              <input type="radio" name="pm" disabled className="mt-1 h-4 w-4" /> 
              <div className="flex flex-col">
                <span className="text-base font-medium text-stone-500">Credit / Debit Card</span>
                <span className="text-sm text-stone-400 mt-0.5">Coming soon</span>
              </div>
            </label>
          </Section>
          
          {settings?.checkoutNote && (
            <div className="bg-[#FFF9FB] p-4 rounded-2xl border border-[#B8955E]/30 text-sm text-[#3A2428]/80 text-center">
              {settings.checkoutNote}
            </div>
          )}
        </div>

        {/* Right Column (Summary & Sticky Bar container on mobile) */}
        <div className="flex flex-col lg:sticky lg:top-32 gap-0">
          <aside className="bg-[#FFF9FB] border border-[#E8D7C8] rounded-[24px] shadow-sm px-4 py-5 md:p-6 mb-6 flex flex-col gap-0">
            <h3 className="mb-4 font-serif text-[26px] text-[#3A2428]">Order summary</h3>
            <SavingsBanner />
            
            <div className="space-y-4 max-h-[40vh] overflow-y-auto no-scrollbar pr-1 mb-5">
              {cart.items.map((it) => (
                <div key={it.product.id} className="flex gap-4">
                  <div className="relative h-[64px] w-[64px] rounded-xl border border-[#E8D7C8] bg-white overflow-hidden shrink-0 flex items-center justify-center">
                    {it.product.images?.[0] ? (
                      <OptimizedImage 
                        src={getOptimizedImageUrl(it.product.images[0], 150)} 
                        alt="" 
                        fill
                        sizes="64px"
                        className="object-cover" 
                      />
                    ) : (
                      <OptimizedImage src="/product-stack.jpg" alt="Product" fill sizes="64px" className="object-cover opacity-80" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <p className="truncate text-sm font-medium text-[#3A2428] line-clamp-2 leading-tight mb-1" style={{ whiteSpace: 'normal' }}>
                      {it.product.name}
                    </p>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-xs text-[#8F817B] font-medium">Qty {it.quantity}</p>
                      {(it.selectedSize || it.selectedColor) && (
                        <p className="text-[11px] text-[#8F817B]">
                          {[
                            it.selectedSize ? `Size: ${it.selectedSize}` : null,
                            it.selectedColor ? `Color: ${it.selectedColor}` : null
                          ].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      {(it.sku || it.product.sku) && (
                        <p className="text-[10px] text-[#8F817B] mt-0.5">Item Code: {it.sku || it.product.sku}</p>
                      )}
                      {it.product.isBundle && it.product.includedItems && it.product.includedItems.length > 0 && (
                        <div className="mt-1 flex flex-col gap-0.5 border-t border-[#E8D7C8]/40 pt-1">
                          <span className="text-[8px] uppercase tracking-wider text-[#B8955E] font-bold">Included:</span>
                          {it.product.includedItems.map((inc, i) => (
                            <p key={i} className="text-[9px] text-[#8F817B] truncate leading-tight">
                              • {inc.quantity}x {inc.name}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-center shrink-0">
                    <p className="text-sm font-semibold text-[#3A2428]">₹{it.product.salePrice * it.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E8D7C8]/60 pt-4 space-y-3 text-sm text-[#8F817B]">
              <div className="flex justify-between">
                <span>Subtotal</span><span className="font-medium text-[#3A2428]">₹{cart.subtotal}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span><span className="font-medium">-₹{cart.discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span><span className="font-medium">{cart.shipping === 0 ? <span className="text-emerald-600">Free</span> : `₹${cart.shipping}`}</span>
              </div>
              
              {cart.isGiftWrap && (
                <div className="flex justify-between text-[#B8955E]">
                  <span>Gift Wrap</span><span className="font-medium">+₹{cart.giftWrapPrice}</span>
                </div>
              )}
              
              <div className="border-t border-[#E8D7C8]/60 mt-3 pt-3 flex justify-between items-center mb-1">
                <span className="font-serif text-xl font-bold text-[#3A2428]">Total</span>
                <span className="text-[22px] font-bold text-[#B8955E]">₹{cart.total}</span>
              </div>
            </div>
            
            <div className="mt-5 flex flex-col gap-4">
              <CouponSection />
              <GiftAddon />
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-[#8F817B] text-[11px] uppercase tracking-wide font-medium">
              <ShieldCheck className="h-[18px] w-[18px] text-emerald-500" /> Secure encrypted checkout
            </div>
          </aside>

          {/* Sticky Place Order Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-[100] bg-[#FFF9FB] border-t border-[#E8D7C8] px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] shadow-[0_-6px_20px_rgba(58,36,40,0.06)] lg:static lg:bottom-auto lg:bg-transparent lg:border-none lg:shadow-none lg:p-0 lg:pb-0 lg:mt-0">
            <div className="flex items-center justify-between max-w-7xl mx-auto gap-4">
              <div className="flex flex-col lg:hidden">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8F817B]">Total</span>
                <span className="text-[20px] leading-tight font-bold text-[#B8955E]">₹{cart.total}</span>
              </div>
              <button 
                type="submit" 
                form="checkout-form" 
                disabled={loading || settings?.codEnabled === false || cart.total <= 300} 
                className="w-[60%] lg:w-full bg-gradient-to-r from-[#B8955E] to-[#E3C9A3] hover:from-[#A08050] hover:to-[#C6AE8B] text-white font-semibold py-3.5 px-6 rounded-2xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? "Processing..." : (cart.total > 300 ? "Place Order (₹100 Advance)" : "Minimum ₹301 Required")}
              </button>
            </div>
          </div>
        </div>

      </form>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#FFF9FB] rounded-[24px] border border-[#E8D7C8] shadow-sm px-4 py-5 md:p-6 mb-2">
      <h3 className="mb-5 font-serif text-[26px] text-[#3A2428] leading-tight">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#B8955E] ml-1">{label}</span>
      {children}
    </label>
  );
}
