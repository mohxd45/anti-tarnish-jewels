const fs = require('fs');

const checkoutContent = `"use client";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/lib/firestore";
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

  async function handlePlaceOrder() {
    if (!address.fullName || !address.phone || !address.line1 || !address.city || !address.pincode) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    try {
      setLoading(true);
      const orderId = await createOrder(
        user?.uid || "guest",
        cart.items,
        address,
        cart.total,
        "cod"
      );
      cart.clearCart();
      router.push(\`/order-success?id=\${orderId}\`);
    } catch (err: any) {
      toast.error(err.message || "Failed to place order.");
      setLoading(false);
    }
  }

  if (!cart.items.length) return null;

  return (
    <div className="bg-[var(--noir)] pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cart" className="p-2 bg-white/50 rounded-full hover:bg-[var(--pink-100)] transition-colors text-[var(--ink)]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display text-3xl md:text-4xl text-[var(--ink)]">Checkout</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            {/* Shipping Details */}
            <div className="glass-dark p-6 md:p-8 rounded-3xl border border-[var(--glass-border)] shadow-sm">
              <h2 className="font-display text-2xl text-[var(--ink)] mb-6 font-semibold">Shipping Details</h2>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Full Name *" 
                  value={address.fullName}
                  onChange={e => setAddress({...address, fullName: e.target.value})}
                  className="neo-input px-4 py-3 w-full outline-none focus:ring-1 focus:ring-[var(--rose)]" 
                />
                <input 
                  type="tel" 
                  placeholder="Phone Number *" 
                  value={address.phone}
                  onChange={e => setAddress({...address, phone: e.target.value})}
                  className="neo-input px-4 py-3 w-full outline-none focus:ring-1 focus:ring-[var(--rose)]" 
                />
                <input 
                  type="text" 
                  placeholder="Address Line 1 *" 
                  value={address.line1}
                  onChange={e => setAddress({...address, line1: e.target.value})}
                  className="neo-input px-4 py-3 w-full outline-none focus:ring-1 focus:ring-[var(--rose)]" 
                />
                <input 
                  type="text" 
                  placeholder="Apartment, suite, etc. (optional)" 
                  value={address.line2}
                  onChange={e => setAddress({...address, line2: e.target.value})}
                  className="neo-input px-4 py-3 w-full outline-none focus:ring-1 focus:ring-[var(--rose)]" 
                />
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="City *" 
                    value={address.city}
                    onChange={e => setAddress({...address, city: e.target.value})}
                    className="neo-input px-4 py-3 w-full outline-none focus:ring-1 focus:ring-[var(--rose)]" 
                  />
                  <input 
                    type="text" 
                    placeholder="State *" 
                    value={address.state}
                    onChange={e => setAddress({...address, state: e.target.value})}
                    className="neo-input px-4 py-3 w-full outline-none focus:ring-1 focus:ring-[var(--rose)]" 
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="Postal Code *" 
                  value={address.pincode}
                  onChange={e => setAddress({...address, pincode: e.target.value})}
                  className="neo-input px-4 py-3 w-full outline-none focus:ring-1 focus:ring-[var(--rose)]" 
                />
              </div>
            </div>
            
            {/* Payment Method */}
            <div className="glass-dark p-6 md:p-8 rounded-3xl border border-[var(--glass-border)] shadow-sm">
              <h2 className="font-display text-2xl text-[var(--ink)] mb-6 font-semibold">Payment Method</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-4 p-4 border border-[var(--gold)] bg-[var(--pink-100)] rounded-xl cursor-pointer transition-colors shadow-sm">
                  <input type="radio" name="payment" defaultChecked className="w-5 h-5 text-[var(--gold)] accent-[var(--gold)]" />
                  <span className="font-medium text-[var(--ink)]">Cash on Delivery (COD)</span>
                </label>
                <label className="flex items-center gap-4 p-4 border border-[var(--pink-200)] bg-white/40 hover:bg-white/60 rounded-xl cursor-not-allowed transition-colors opacity-60">
                  <input type="radio" name="payment" disabled className="w-5 h-5" />
                  <span className="font-medium text-[var(--stoneGray)]">UPI / Card (Coming Soon)</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Order Summary Sidebar */}
          <div>
            <div className="glass-dark p-6 md:p-8 rounded-3xl sticky top-24 border border-[var(--glass-border)] shadow-sm">
              <h2 className="font-display text-2xl text-[var(--ink)] mb-6 font-semibold">Order Details</h2>
              
              <div className="space-y-4 mb-6 max-h-[30vh] overflow-y-auto no-scrollbar pr-2">
                {cart.items.map(item => (
                  <div key={item.product.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded bg-[var(--pink-200)] text-[var(--ink)] font-bold flex items-center justify-center text-xs">
                        {item.quantity}
                      </span>
                      <span className="text-[var(--ink)] font-medium line-clamp-1">{item.product.name}</span>
                    </div>
                    <span className="text-[var(--ink)] font-semibold">₹{item.product.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-[var(--pink-200)] pt-4 mb-6 space-y-3 text-sm md:text-base text-[var(--ink)]">
                <div className="flex justify-between">
                  <span className="text-[var(--stoneGray)]">Subtotal</span>
                  <span className="font-medium">₹{cart.subtotal}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-[var(--success)] font-medium">
                    <span>Discount</span>
                    <span>-₹{cart.discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[var(--stoneGray)]">Shipping</span>
                  <span className="text-[var(--success)] font-medium">Free</span>
                </div>
                
                <div className="border-t border-[var(--pink-200)] pt-4 mt-4 flex justify-between items-end">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="font-display text-3xl font-bold text-[var(--ink)]">₹{cart.total}</span>
                </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full btn-primary py-4 rounded-xl shadow-glow text-lg mb-6 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? "Processing..." : "Place Order"}
              </button>
              
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
`;

fs.writeFileSync('app/checkout/page.tsx', checkoutContent);
