const fs = require('fs');

const trackContent = `"use client";

import { useState } from "react";
import { Search, Package, Truck, CheckCircle, PackageCheck } from "lucide-react";
import { getOrderByNumber } from "@/lib/firestore";
import { Order } from "@/types";
import { toast } from "sonner";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    try {
      const found = await getOrderByNumber(orderId.trim());
      if (found) {
        setOrder(found);
      } else {
        toast.error("Order not found. Please check your order ID.");
        setOrder(null);
      }
    } catch (err) {
      toast.error("Failed to track order.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'processing': return <Package className="w-6 h-6" />;
      case 'shipped': return <Truck className="w-6 h-6" />;
      case 'delivered': return <CheckCircle className="w-6 h-6" />;
      default: return <PackageCheck className="w-6 h-6" />;
    }
  };

  return (
    <div className="bg-[var(--noir)] pt-32 pb-16 min-h-screen">
      <div className="w-full max-w-md mx-auto px-4">
        <div className="glass-dark p-8 rounded-3xl border border-[var(--glass-border)] shadow-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[var(--charcoal)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--pink-200)] shadow-sm">
              <Search className="w-8 h-8 text-[var(--gold-dark)]" />
            </div>
            <h1 className="font-display text-3xl text-[var(--ink)] mb-2 font-medium">Track Order</h1>
            <p className="text-[var(--stoneGray)]">Enter your order ID to see the status</p>
          </div>

          <form onSubmit={handleTrack} className="space-y-4 mb-8">
            <input 
              type="text" 
              placeholder="Order ID (e.g. ORD-12345)" 
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="neo-input px-4 py-3.5 w-full outline-none focus:ring-1 focus:ring-[var(--rose)]" 
              required
            />
            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-3.5 rounded-xl shadow-glow text-lg flex items-center justify-center"
            >
              {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Track Package"}
            </button>
          </form>

          {order && (
            <div className="bg-[var(--charcoal)] rounded-2xl p-6 border border-[var(--pink-200)] mt-8 animate-fade-in">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs text-[var(--stoneGray)] uppercase tracking-wider mb-1">Status</p>
                  <div className="flex items-center gap-2 text-[var(--ink)] font-semibold">
                    {getStatusIcon(order.status)}
                    <span className="capitalize text-lg">{order.status || 'Processing'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--stoneGray)] uppercase tracking-wider mb-1">Total</p>
                  <p className="font-display text-xl text-[var(--ink)] font-bold">₹{order.totalAmount}</p>
                </div>
              </div>
              
              <div className="border-t border-[var(--pink-200)] pt-4">
                <p className="text-xs text-[var(--stoneGray)] uppercase tracking-wider mb-2">Items</p>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-[var(--ink)] line-clamp-1 flex-1 pr-4">{item.quantity}x {item.name}</span>
                      <span className="text-[var(--stoneGray)]">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('app/track-order/page.tsx', trackContent);
