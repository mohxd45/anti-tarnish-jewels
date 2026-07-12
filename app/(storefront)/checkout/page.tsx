"use client";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { createOrder, getOptimizedImageUrl } from "@/lib/firestore";
import { Address } from "@/types";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ShieldCheck, ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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
      const orderId = await createOrder({
        userId: user?.uid || "guest",
        customerEmail: user?.email || "guest@example.com",
        items: cart.items,
        address,
        subtotal: cart.subtotal,
        total: cart.total,
        discount: cart.discount,
        shipping: cart.shipping || 0,
        paymentMethod: "cod"
      });
      cart.clearCart();
      router.push(`/order-success?id=${orderId}`);
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
            <label className={`flex items-start gap-3 p-4 border border-[#E8D7C8] rounded-2xl bg-white cursor-pointer transition-colors ${settings?.codEnabled !== false ? 'hover:border-[#B8955E]' : 'opacity-60 cursor-not-allowed'}`}>
              <input type="radio" name="pm" defaultChecked className="mt-1 accent-[#B8955E] h-4 w-4" disabled={settings?.codEnabled === false} /> 
              <div className="flex flex-col">
                <span className={`text-base font-medium ${settings?.codEnabled === false ? 'text-stone-400' : 'text-[#3A2428]'}`}>
                  Cash on Delivery
                  {settings?.codEnabled === false && " (Disabled)"}
                </span>
                {settings?.codEnabled !== false && (
                  <span className="text-sm text-[#8F817B] mt-0.5">{settings?.codText || "Pay remaining amount on delivery"}</span>
                )}
              </div>
            </label>
            
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
          <aside className="bg-[#FFF9FB] border border-[#E8D7C8] rounded-[24px] shadow-sm px-4 py-5 md:p-6 mb-6">
            <h3 className="mb-4 font-serif text-[26px] text-[#3A2428]">Order summary</h3>
            
            <div className="space-y-4 max-h-[40vh] overflow-y-auto no-scrollbar pr-1 mb-5">
              {cart.items.map((it) => (
                <div key={it.product.id} className="flex gap-4">
                  <div className="h-[64px] w-[64px] rounded-xl border border-[#E8D7C8] bg-white overflow-hidden shrink-0 flex items-center justify-center">
                    {it.product.images?.[0] ? (
                      <img 
                        src={getOptimizedImageUrl(it.product.images[0], 150)} 
                        alt="" 
                        className="h-full w-full object-cover" 
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-stone-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <p className="truncate text-sm font-medium text-[#3A2428] line-clamp-2 leading-tight mb-1" style={{ whiteSpace: 'normal' }}>
                      {it.product.name}
                    </p>
                    <p className="text-xs text-[#8F817B]">Qty {it.quantity}</p>
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
              
              <div className="mt-4 pt-4 border-t border-[#E8D7C8] flex justify-between items-center">
                <span className="font-serif text-xl font-bold text-[#3A2428]">Total</span>
                <span className="text-[22px] font-bold text-[#B8955E]">₹{cart.total + (cart.shipping || 0)}</span>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-[#8F817B] text-[11px] uppercase tracking-wide font-medium">
              <ShieldCheck className="h-[18px] w-[18px] text-emerald-500" /> Secure encrypted checkout
            </div>
          </aside>

          {/* Sticky Place Order Bar */}
          <div className="fixed bottom-[72px] left-0 right-0 z-40 bg-[#FFF9FB] border-t border-[#E8D7C8] px-4 py-3 shadow-[0_-6px_20px_rgba(58,36,40,0.06)] lg:static lg:bottom-auto lg:bg-transparent lg:border-none lg:shadow-none lg:p-0 lg:mt-0">
            <div className="flex items-center justify-between max-w-7xl mx-auto gap-4">
              <div className="flex flex-col lg:hidden">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8F817B]">Total</span>
                <span className="text-[20px] leading-tight font-bold text-[#B8955E]">₹{cart.total + (cart.shipping || 0)}</span>
              </div>
              <button 
                type="submit" 
                form="checkout-form" 
                disabled={loading || settings?.codEnabled === false} 
                className="w-[60%] lg:w-full bg-[#B8955E] hover:bg-[#A08050] text-white font-medium py-3.5 px-6 rounded-2xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Place Order"}
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
