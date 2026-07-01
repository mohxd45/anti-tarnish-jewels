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
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <div className="flex items-center gap-3">
          <Link href="/cart" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 text-pink-900 transition hover:bg-pink-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-serif text-3xl text-pink-900 md:text-4xl">Checkout</h1>
            <p className="mt-1 text-sm text-pink-600">Almost there — review and place your order</p>
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
            <label className="glass flex cursor-pointer items-center gap-3 rounded-xl p-3 border border-[color:var(--color-gold)]">
              <input type="radio" name="pm" defaultChecked className="accent-[color:var(--color-gold)]" /> 
              <span className="text-sm text-pink-900 font-medium">Cash on Delivery</span>
            </label>
            <label className="glass flex cursor-not-allowed items-center gap-3 rounded-xl p-3 opacity-50">
              <input type="radio" name="pm" disabled /> 
              <span className="text-sm text-pink-900">UPI (Coming Soon)</span>
            </label>
            <label className="glass flex cursor-not-allowed items-center gap-3 rounded-xl p-3 opacity-50">
              <input type="radio" name="pm" disabled /> 
              <span className="text-sm text-pink-900">Credit / Debit Card (Coming Soon)</span>
            </label>
          </Section>
          <button type="submit" disabled={loading} className="btn-primary-gold w-full py-4 text-lg">
            {loading ? "Processing..." : "Place Order"}
          </button>
        </form>

        <aside className="glass-dark h-fit rounded-2xl p-6 sticky top-24">
          <h3 className="mb-4 font-serif text-xl text-pink-900">Order summary</h3>
          <div className="space-y-3 max-h-[40vh] overflow-y-auto no-scrollbar pr-2 mb-4">
            {cart.items.map((it) => (
              <div key={it.product.id} className="flex gap-3">
                <img 
                  src={getOptimizedImageUrl(it.product.images?.[0] || "", 150)} 
                  alt="" 
                  className="h-14 w-14 rounded-lg object-cover" 
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-pink-900">{it.product.name}</p>
                  <p className="text-xs text-pink-600">Qty {it.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-pink-900">₹{it.product.salePrice * it.quantity}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-pink-200 pt-3 space-y-2 text-sm text-pink-700">
            <div className="flex justify-between">
              <span>Subtotal</span><span>₹{cart.subtotal}</span>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span><span>-₹{cart.discount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span><span>{cart.shipping === 0 ? "Free" : `₹${cart.shipping}`}</span>
            </div>
            
            <div className="my-2 border-t border-pink-200" />
            
            <div className="flex justify-between font-serif text-lg text-pink-900 font-bold">
              <span>Total</span><span>₹{cart.total}</span>
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-2 text-pink-600 text-xs">
            <ShieldCheck className="h-4 w-4" /> Secure encrypted checkout
          </div>
        </aside>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-dark rounded-2xl p-6">
      <h3 className="mb-4 font-serif text-xl text-pink-900">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-pink-900">{label}</span>
      {children}
    </label>
  );
}
