"use client";
import { useState, useEffect } from "react";
import { Search, CheckCircle, AlertCircle } from "lucide-react";
import { getOrderByOrderNumber } from "@/lib/firestore";
import { Order } from "@/types";
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
    { label: "Order Placed" },
    { label: "Confirmed" },
    { label: "Packed" },
    { label: "Shipped" },
    { label: "Out for Delivery" },
    { label: "Delivered" }
  ];

  function getStepIndex(status: string): number {
    switch (status) {
      case "Pending Verification":
      case "Pending": return 0;
      case "Confirmed": return 1;
      case "Packed": return 2;
      case "Shipped": return 3;
      case "Out for Delivery": return 4;
      case "Delivered": return 5;
      default: return -1;
    }
  }

  const currentIdx = order ? getStepIndex(order.status) : -1;
  const isCancelled = order?.status === "Cancelled";
  const isReturned = order?.status === "Returned";

  return (
    <div className="min-h-screen bg-[#FFF0F5] pb-32">
      <div className="mx-auto max-w-3xl px-4 pt-10 sm:pt-16 pb-12">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF9FB] border border-[#B8955E]/20 shadow-[0_8px_24px_rgba(58,36,40,0.04)]">
            <Search className="h-8 w-8 text-[#B8955E]" />
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#3A2428] mb-4">Track Order</h1>
          <p className="text-[#3A2428]/70 text-sm sm:text-base">Enter your order ID and contact information to check your delivery status.</p>
        </div>

        {/* Input Card */}
        <div className="bg-[#FFF9FB] rounded-[2rem] shadow-[0_8px_24px_rgba(58,36,40,0.04)] border border-[#B8955E]/20 p-6 sm:p-10 mb-8">
          <form onSubmit={handleTrack} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3A2428] mb-2">Order ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. ORD-12345" 
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B8955E]/50 focus:border-[#B8955E] transition-all text-sm text-[#3A2428] placeholder-stone-400" 
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#3A2428] mb-2">Email or Phone</label>
                <input 
                  type="text" 
                  placeholder="Used during checkout" 
                  value={verification}
                  onChange={(e) => setVerification(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B8955E]/50 focus:border-[#B8955E] transition-all text-sm text-[#3A2428] placeholder-stone-400" 
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading || !orderId.trim() || !verification.trim()}
              className="w-full py-4 bg-[#B8955E] hover:bg-[#A38250] text-white rounded-full font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Track Package"}
            </button>
          </form>

          {errorMsg && (
            <div className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-[#FFF0F5] border border-[#B8955E]/20 text-[#3A2428] text-sm font-medium">
              <AlertCircle className="h-5 w-5 shrink-0 text-[#B8955E]" />
              <p>{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Order Status Card */}
        {order && (
          <div className="bg-[#FFF9FB] rounded-[2rem] shadow-[0_8px_24px_rgba(58,36,40,0.04)] border border-[#B8955E]/20 p-6 sm:p-10 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-10 pb-8 border-b border-[#B8955E]/10">
              <div>
                <p className="text-xs text-[#3A2428]/60 uppercase tracking-wider mb-2 font-semibold">Current Status</p>
                <div className="flex items-center gap-2 font-serif font-semibold">
                  <span className={`capitalize text-lg px-4 py-1.5 rounded-full text-sm border ${
                    order.status === "Delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    isCancelled || isReturned ? "bg-red-50 text-red-700 border-red-200" : "bg-[#B8955E]/10 text-[#B8955E] border-[#B8955E]/20"
                  }`}>
                    {order.status || 'Processing'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#3A2428]/60 uppercase tracking-wider mb-2 font-semibold">Order Total</p>
                <p className="font-serif text-2xl font-semibold text-[#B8955E]">{formatPrice(order.total)}</p>
              </div>
            </div>
            
            {!isCancelled && !isReturned ? (
              <div className="relative flex flex-col gap-8 pl-4 border-l-2 border-[#B8955E]/20 ml-2">
                {steps.map((step, idx) => {
                  const isCompleted = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  return (
                    <div key={step.label} className="relative flex items-center gap-5">
                      <div
                        className={`absolute -left-[27px] w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          isCompleted
                            ? "bg-[#B8955E] border-[#B8955E] text-white shadow-sm"
                            : "bg-[#FFF9FB] border-[#B8955E]/30"
                        }`}
                      >
                        {isCompleted ? <CheckCircle size={12} className="stroke-[3]" /> : <div className="w-1.5 h-1.5 rounded-full bg-[#B8955E]/30" />}
                      </div>
                      <span className={`text-sm uppercase tracking-widest font-medium transition-colors ${
                        isCurrent ? "text-[#3A2428] font-bold" : 
                        isCompleted ? "text-[#3A2428]/80" : "text-[#3A2428]/40"
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#FFF0F5] border border-[#B8955E]/20 text-[#3A2428] text-center text-sm font-medium">
                This order has been {order.status.toLowerCase()}. Live tracking is unavailable.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
