"use client";
import { useState, useEffect } from "react";
import { Search, Package, Truck, CheckCircle, PackageCheck, AlertCircle } from "lucide-react";
import { getOrderByOrderNumber } from "@/lib/firestore";
import { Order } from "@/types";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const initOrder = searchParams.get("order") || "";
  const initPhone = searchParams.get("phone") || "";

  const [orderId, setOrderId] = useState(initOrder);
  const [verification, setVerification] = useState(initPhone);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderId.trim() || !verification.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setOrder(null);
    try {
      const found = await getOrderByOrderNumber(orderId.trim());
      if (found) {
        // Privacy check: Validate against email or phone
        const emailMatch = found.customerEmail?.toLowerCase() === verification.trim().toLowerCase();
        const phoneMatch = found.customerPhone === verification.trim() || found.address?.phone === verification.trim();

        if (emailMatch || phoneMatch) {
          setOrder(found);
        } else {
          setErrorMsg("Verification failed. The email or phone does not match this order.");
        }
      } else {
        setErrorMsg("Order not found. Please check your order ID.");
      }
    } catch (err) {
      setErrorMsg("Failed to track order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initOrder && initPhone) {
      handleTrack();
    }
  }, [initOrder, initPhone]);

  const steps = [
    { label: "Ordered" },
    { label: "Confirmed" },
    { label: "Packed" },
    { label: "Shipped" },
    { label: "Delivered" }
  ];

  function getStepIndex(status: string): number {
    switch (status) {
      case "Pending Verification":
      case "Pending": return 0;
      case "Confirmed": return 1;
      case "Packed": return 2;
      case "Shipped": return 3;
      case "Out for Delivery": return 3;
      case "Delivered": return 4;
      default: return -1;
    }
  }

  const currentIdx = order ? getStepIndex(order.status) : -1;
  const isCancelled = order?.status === "Cancelled";
  const isReturned = order?.status === "Returned";

  return (
    <div className="mx-auto max-w-lg px-4 pt-16 pb-32">
      <div className="bg-[#FAF9F6]/95 backdrop-blur-sm shadow-sm border border-stone-200 rounded-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-champagne/20 border border-champagne">
            <Search className="h-10 w-10 text-champagne" />
          </div>
          <h1 className="font-serif text-3xl text-charcoalBrown mb-2">Track Order</h1>
          <p className="text-sm text-stoneGray">Enter your order ID and contact info to verify</p>
        </div>

        <form onSubmit={handleTrack} className="space-y-4 mb-8">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-champagne uppercase tracking-wider pl-2">Order ID</label>
            <input 
              type="text" 
              placeholder="e.g. ORD-12345" 
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="neo-input w-full px-4 py-3 text-sm" 
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-champagne uppercase tracking-wider pl-2">Email or Phone</label>
            <input 
              type="text" 
              placeholder="Email or Phone Number" 
              value={verification}
              onChange={(e) => setVerification(e.target.value)}
              className="neo-input w-full px-4 py-3 text-sm" 
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || !orderId.trim() || !verification.trim()}
            className="btn-primary-gold w-full py-3 mt-4"
          >
            {loading ? "Verifying..." : "Track Package"}
          </button>
        </form>

        {errorMsg && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-stone-100 border border-stone-200 text-stone-600 text-sm animate-in fade-in">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {order && (
          <div className="border-t border-stone-200/40 pt-8 mt-8 animate-in fade-in space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-stoneGray uppercase tracking-wider mb-1">Status</p>
                <div className="flex items-center gap-2 text-charcoalBrown font-serif font-semibold">
                  <span className={`capitalize text-lg px-3 py-1 rounded-full text-sm ${
                    order.status === "Delivered" ? "bg-emerald-500/10 text-emerald-600" :
                    isCancelled || isReturned ? "bg-dustyRose/10 text-dustyRose" : "bg-champagne/10 text-champagne"
                  }`}>
                    {order.status || 'Processing'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-stoneGray uppercase tracking-wider mb-1">Total</p>
                <p className="font-serif text-xl font-bold text-champagne">{formatPrice(order.total)}</p>
              </div>
            </div>
            
            {!isCancelled && !isReturned ? (
              <div className="relative flex flex-col gap-6 pl-4 border-l-2 border-stone-200/40 ml-2">
                {steps.map((step, idx) => {
                  const isCompleted = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  return (
                    <div key={step.label} className="relative flex items-center gap-4">
                      <div
                        className={`absolute -left-[27px] w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCompleted
                            ? "bg-champagne border-champagne text-white"
                            : "bg-stone-50 border-stone-200"
                        }`}
                      >
                        {isCompleted ? <CheckCircle size={12} className="stroke-[3]" /> : <div className="w-1.5 h-1.5 rounded-full bg-goldBeige/40" />}
                      </div>
                      <span className={`text-sm uppercase tracking-wider font-medium ${isCurrent ? "text-charcoalBrown font-bold" : isCompleted ? "text-stoneGray" : "text-stoneGray/40"}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 text-stone-600 text-center text-sm">
                This order has been {order.status.toLowerCase()}. Tracking is unavailable.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
