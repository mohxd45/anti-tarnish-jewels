"use client";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { createOrder, getOptimizedImageUrl } from "@/lib/firestore";
import { Address } from "@/types";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ShieldCheck, ArrowLeft } from "lucide-react";
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
    if (!cart.items.length) {
      router.push("/cart");
    }
  }, [cart.items.length, router]);

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

  if (!cart.items.length) return null;

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-12 md:pt-16">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cart" className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 backdrop-blur-sm border border-stone-200 text-charcoalBrown transition hover:bg-stone-50/50 hover:shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-charcoalBrown">Checkout</h1>
            <p className="mt-1 text-sm text-stoneGray">Almost there — review and place your order</p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 grid max-w-7xl grid-cols-1 gap-6 px-4 lg:grid-cols-[1fr_360px] pb-16">
        <form onSubmit={handlePlaceOrder} className="space-y-6">
          <Section title="Contact">
            <Field label="Full name *">
              <input 
                required
                className="neo-input w-full px-4 py-3 text-sm" 
                placeholder="Your name" 
                value={address.fullName}
                onChange={e => setAddress({...address, fullName: e.target.value})}
              />
            </Field>
            <Field label="Email">
              <input 
                type="email" 
                className="neo-input w-full px-4 py-3 text-sm" 
                placeholder="you@example.com" 
                defaultValue={user?.email || ""}
                disabled={!!user?.email}
              />
            </Field>
            <Field label="Phone *">
              <input 
                required
                type="tel"
                className="neo-input w-full px-4 py-3 text-sm" 
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
                className="neo-input w-full px-4 py-3 text-sm" 
                placeholder="House / Flat / Street" 
                value={address.line1}
                onChange={e => setAddress({...address, line1: e.target.value})}
              />
            </Field>
            <Field label="Apartment, suite, etc. (optional)">
              <input 
                className="neo-input w-full px-4 py-3 text-sm" 
                placeholder="" 
                value={address.line2}
                onChange={e => setAddress({...address, line2: e.target.value})}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City *">
                <input 
                  required
                  className="neo-input w-full px-4 py-3 text-sm" 
                  value={address.city}
                  onChange={e => setAddress({...address, city: e.target.value})}
                />
              </Field>
              <Field label="State *">
                <input 
                  required
                  className="neo-input w-full px-4 py-3 text-sm" 
                  value={address.state}
                  onChange={e => setAddress({...address, state: e.target.value})}
                />
              </Field>
            </div>
            <Field label="Pincode *">
              <input 
                required
                className="neo-input w-full px-4 py-3 text-sm" 
                value={address.pincode}
                onChange={e => setAddress({...address, pincode: e.target.value})}
              />
            </Field>
          </Section>

          <Section title="Payment method">
            <label className="bg-[#FAF9F6]/95 backdrop-blur-sm shadow-sm border border-stone-200 rounded-2xl">
              <input type="radio" name="pm" defaultChecked className="accent-champagne" disabled={settings?.codEnabled === false} /> 
              <span className={`text-sm font-medium ${settings?.codEnabled === false ? 'text-stoneGray/50' : 'text-charcoalBrown'}`}>
                Cash on Delivery
                {settings?.codEnabled === false && " (Currently Disabled)"}
              </span>
            </label>
            {settings?.codEnabled !== false && settings?.codText && (
              <p className="text-xs text-stoneGray mt-2 px-2">{settings.codText}</p>
            )}
            <label className="bg-[#FAF9F6]/95 backdrop-blur-sm shadow-sm border border-stone-200 rounded-2xl">
              <input type="radio" name="pm" disabled /> 
              <span className="text-sm text-charcoalBrown">UPI (Coming Soon)</span>
            </label>
            <label className="bg-[#FAF9F6]/95 backdrop-blur-sm shadow-sm border border-stone-200 rounded-2xl">
              <input type="radio" name="pm" disabled /> 
              <span className="text-sm text-charcoalBrown">Credit / Debit Card (Coming Soon)</span>
            </label>
          </Section>
          
          {settings?.checkoutNote && (
            <div className="bg-stone-50/30 p-4 rounded-2xl border border-champagne/30 text-sm text-charcoalBrown/80">
              {settings.checkoutNote}
            </div>
          )}

          <button type="submit" disabled={loading || settings?.codEnabled === false} className="btn-primary-gold w-full py-4 text-lg">
            {loading ? "Processing..." : "Place Order"}
          </button>
        </form>

        <aside className="bg-[#FAF9F6]/95 backdrop-blur-sm shadow-sm border border-stone-200 rounded-2xl">
          <h3 className="mb-6 font-serif text-2xl text-charcoalBrown">Order summary</h3>
          <div className="space-y-4 max-h-[40vh] overflow-y-auto no-scrollbar pr-2 mb-6">
            {cart.items.map((it) => (
              <div key={it.product.id} className="flex gap-4">
                <div className="h-16 w-16 rounded-xl border border-stone-200/30 overflow-hidden shrink-0">
                  <img 
                    src={getOptimizedImageUrl(it.product.images?.[0] || "", 150)} 
                    alt="" 
                    className="h-full w-full object-cover" 
                  />
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-center">
                  <p className="truncate text-sm font-medium text-charcoalBrown">{it.product.name}</p>
                  <p className="text-xs text-stoneGray mt-0.5">Qty {it.quantity}</p>
                </div>
                <div className="flex flex-col justify-center text-right">
                  <p className="text-sm font-semibold text-charcoalBrown">₹{it.product.salePrice * it.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-stone-200/50 pt-4 space-y-3 text-sm text-stoneGray">
            <div className="flex justify-between">
              <span>Subtotal</span><span>₹{cart.subtotal}</span>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span><span>-₹{cart.discount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span><span>{cart.shipping === 0 ? <span className="text-emerald-600 font-medium">Free</span> : `₹${cart.shipping}`}</span>
            </div>
            
            <div className="my-4 border-t border-stone-200/50" />
            
            <div className="flex justify-between font-serif text-xl text-charcoalBrown font-bold">
              <span>Total</span><span className="text-champagne">₹{cart.total + (cart.shipping || 0)}</span>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-2 text-stoneGray text-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-500" /> Secure encrypted checkout
          </div>
        </aside>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#FAF9F6]/95 backdrop-blur-sm shadow-sm border border-stone-200 rounded-2xl">
      <h3 className="mb-6 font-serif text-2xl text-charcoalBrown">{title}</h3>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-champagne ml-2">{label}</span>
      {children}
    </label>
  );
}
