"use client";
import { useState } from "react";
import { Search, Package, Truck, CheckCircle, PackageCheck } from "lucide-react";
import { getOrderByOrderNumber } from "@/lib/firestore";
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
      const found = await getOrderByOrderNumber(orderId.trim());
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
      case 'processing': return <Package className="h-6 w-6" />;
      case 'shipped': return <Truck className="h-6 w-6" />;
      case 'delivered': return <CheckCircle className="h-6 w-6" />;
      default: return <PackageCheck className="h-6 w-6" />;
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 pt-16 pb-32">
      <div className="glass-dark rounded-3xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 border border-pink-200">
            <Search className="h-8 w-8 text-[color:var(--color-gold)]" />
          </div>
          <h1 className="font-serif text-3xl text-pink-900 mb-2">Track Order</h1>
          <p className="text-sm text-pink-600">Enter your order ID to see the status</p>
        </div>

        <form onSubmit={handleTrack} className="space-y-4 mb-8">
          <input 
            type="text" 
            placeholder="Order ID (e.g. ORD-12345)" 
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="neo-input w-full px-4 py-3 text-sm" 
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary-gold w-full py-3"
          >
            {loading ? "Tracking..." : "Track Package"}
          </button>
        </form>

        {order && (
          <div className="glass rounded-2xl p-6 mt-8 animate-in fade-in">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs text-pink-600 uppercase tracking-wider mb-1">Status</p>
                <div className="flex items-center gap-2 text-pink-900 font-semibold">
                  {getStatusIcon(order.status)}
                  <span className="capitalize text-lg">{order.status || 'Processing'}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-pink-600 uppercase tracking-wider mb-1">Total</p>
                <p className="font-serif text-xl font-bold text-pink-900">₹{order.total}</p>
              </div>
            </div>
            
            <div className="border-t border-pink-200 pt-4">
              <p className="text-xs text-pink-600 uppercase tracking-wider mb-2">Items</p>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-pink-900 line-clamp-1 flex-1 pr-4">{item.quantity}x {item.product.name}</span>
                    <span className="text-pink-600 font-medium">₹{item.product.salePrice * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
