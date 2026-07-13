"use client";
import { useAuth } from "@/context/AuthContext";
import { getUserOrders } from "@/lib/firestore";
import { formatPrice } from "@/lib/utils";
import { Order, OrderStatus } from "@/types";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, CheckCircle2, Package, MapPin, CreditCard, ChevronDown, ChevronUp } from "lucide-react";
import { HeartLoader } from "@/components/ui/HeartLoader";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";

export default function AccountOrdersPage() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFetching(true);
      setError("");
      // Get all orders using the updated logic where we filter by userId or email/phone
      getUserOrders(user.uid, user.email || undefined)
        .then((fetchedOrders) => {
          // Additional client-side filter to ensure we get orders matching the profile name/phone if needed
          const myOrders = fetchedOrders.filter(o => 
            o.userId === user.uid || 
            (user.email && o.customerEmail === user.email) ||
            (profile?.phone && o.address?.phone === profile.phone)
          );
          setOrders(myOrders);
        })
        .catch((err) => {
          setError(err.message || "Failed to load orders. Please try again.");
        })
        .finally(() => setFetching(false));
    }
  }, [user, profile]);

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const steps: { label: string; status: OrderStatus }[] = [
    { label: "Ordered", status: "Pending" },
    { label: "Confirmed", status: "Confirmed" },
    { label: "Packed", status: "Packed" },
    { label: "Shipped", status: "Shipped" },
    { label: "Delivered", status: "Delivered" }
  ];

  function getStepIndex(status: OrderStatus): number {
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

  return (
    <div className="bg-[#FFF9FB] shadow-[0_8px_24px_rgba(58,36,40,0.04)] border border-[#E8D7C8]/50 rounded-[2rem] p-6 sm:p-10 mb-8 pb-20">
      <div className="mb-8">
        <h1 className="font-serif text-2xl md:text-4xl text-[#3A2428] mb-2">My Orders</h1>
        <p className="text-[#3A2428]/70 text-sm sm:text-base">Track the shipping progress and view order summaries of your purchases.</p>
      </div>

      <div className="grid gap-6">
        {fetching ? (
          <div className="py-12">
            <HeartLoader text="Finding your orders..." />
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-center text-red-700">
            <p className="font-serif font-semibold text-lg">{error}</p>
            <p className="text-sm mt-2 opacity-80">Please check your connection and try again.</p>
          </div>
        ) : orders.length ? (
          orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const currentIdx = getStepIndex(order.status);
            const isCancelled = order.status === "Cancelled";
            const isReturned = order.status === "Returned";

            return (
              <div key={order.id} className="rounded-[1.5rem] border border-[#E8D7C8]/50 bg-[#FFF0F5] overflow-hidden shadow-sm transition-all hover:border-[#B8955E]/30">
                {/* Header Summary */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="p-5 sm:p-6 cursor-pointer flex flex-wrap items-center justify-between gap-4 hover:bg-[#E8D7C8]/10 transition-all"
                >
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-[#B8955E]">Order Reference</p>
                    <h3 className="text-base sm:text-lg font-serif font-semibold text-[#3A2428]">{order.orderNumber || `#${order.id}`}</h3>
                    <p className="text-xs text-stoneGray">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-stoneGray">Total</p>
                      <p className="font-serif font-semibold text-champagne text-lg">{formatPrice(order.total)}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === "Delivered" ? "bg-emerald-500/10 text-emerald-600" :
                        order.status === "Cancelled" || order.status === "Returned" ? "bg-dustyRose/10 text-dustyRose" : "bg-champagne/10 text-champagne"
                      }`}>
                        {order.status}
                      </span>
                      {isExpanded ? <ChevronUp size={20} className="text-stoneGray" /> : <ChevronDown size={20} className="text-stoneGray" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-stone-200/40 p-5 bg-stone-50/10 space-y-6 transition-all">
                    {/* Visual Tracking Stepper */}
                    {!isCancelled && !isReturned ? (
                      <div className="py-4">
                        {/* Horizontal Stepper for Tablet/Desktop */}
                        <div className="relative hidden sm:flex items-center justify-between">
                          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-goldBeige/40 -z-10" />
                          <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-champagne transition-all duration-500 -z-10"
                            style={{ width: `${(Math.max(0, currentIdx) / (steps.length - 1)) * 100}%` }}
                          />

                          {steps.map((step, idx) => {
                            const isCompleted = idx <= currentIdx;
                            const isCurrent = idx === currentIdx;
                            return (
                              <div key={step.label} className="flex flex-col items-center">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                    isCompleted
                                      ? "bg-champagne border-champagne text-white shadow-sm"
                                      : "bg-white border-stone-200 text-stoneGray/30"
                                  }`}
                                >
                                  {isCompleted ? <CheckCircle2 size={16} className="stroke-[3]" /> : <div className="w-2 h-2 rounded-full bg-goldBeige/40" />}
                                </div>
                                <span className={`text-[11px] uppercase tracking-wider mt-2 font-medium ${isCurrent ? "text-charcoalBrown font-bold" : "text-stoneGray"}`}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Vertical Stepper for Mobile */}
                        <div className="relative sm:hidden flex flex-col gap-5 pl-4 border-l-2 border-stone-200/40 ml-2">
                          {steps.map((step, idx) => {
                            const isCompleted = idx <= currentIdx;
                            const isCurrent = idx === currentIdx;
                            return (
                              <div key={step.label} className="relative flex items-center gap-4">
                                <div
                                  className={`absolute -left-[27px] w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                                    isCompleted
                                      ? "bg-champagne border-champagne text-white"
                                      : "bg-stone-50 border-stone-200"
                                  }`}
                                >
                                  {isCompleted ? <CheckCircle2 size={10} className="stroke-[3]" /> : <div className="w-1.5 h-1.5 rounded-full bg-goldBeige/40" />}
                                </div>
                                <span className={`text-xs uppercase tracking-wider font-medium ${isCurrent ? "text-charcoalBrown font-bold" : isCompleted ? "text-stoneGray" : "text-stoneGray/50"}`}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl bg-dustyRose/10 border border-dustyRose/20 p-3 text-center text-dustyRose text-xs">
                        This order has been {order.status.toLowerCase()}.
                      </div>
                    )}

                    {/* Order Breakdown Grid */}
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Items */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-serif font-semibold text-champagne uppercase tracking-wider flex items-center gap-1.5">
                          <ShoppingBag size={14} /> Order Items
                        </h4>
                        <div className="divide-y divide-goldBeige/30 rounded-xl border border-stone-200/50 bg-white p-3 space-y-2">
                          {order.items.map((item) => (
                            <div key={item.product.id} className="pt-2 first:pt-0 flex items-center justify-between text-sm">
                              <div className="flex items-center gap-3">
                                {item.product.images?.[0] && (
                                  <div className="relative w-10 h-10 rounded overflow-hidden border border-stone-200/30">
                                    <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-serif font-medium text-charcoalBrown text-xs line-clamp-1">{item.product.name}</p>
                                  <p className="text-[10px] text-stoneGray mt-0.5">Qty: {item.quantity} • {formatPrice(item.product.salePrice)}</p>
                                </div>
                              </div>
                              <span className="font-semibold text-charcoalBrown text-xs">{formatPrice(item.product.salePrice * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping & Payment */}
                      <div className="space-y-4">
                        {/* Address */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-serif font-semibold text-champagne uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin size={14} /> Shipping
                          </h4>
                          <div className="rounded-xl border border-stone-200/50 bg-white p-3 text-xs leading-5 text-stoneGray">
                            <p className="font-serif font-semibold text-charcoalBrown text-sm">{order.address.fullName}</p>
                            <p>{order.address.line1}, {order.address.line2}</p>
                            <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                            <p className="text-[10px] mt-1">Phone: {order.address.phone}</p>
                          </div>
                        </div>

                        {/* Payment Details */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-serif font-semibold text-champagne uppercase tracking-wider flex items-center gap-1.5">
                            <CreditCard size={14} /> Payment
                          </h4>
                          <div className="rounded-xl border border-stone-200/50 bg-white p-3 text-xs space-y-1.5 text-stoneGray">
                            <div className="flex justify-between">
                              <span>Method</span>
                              <span className="font-medium text-charcoalBrown capitalize">
                                {order.paymentMethod === "cod" ? "COD" : order.paymentMethod}
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-stone-200/30 pt-1.5">
                              <span>Subtotal</span>
                              <span className="text-charcoalBrown font-medium">{formatPrice(order.subtotal)}</span>
                            </div>
                            {order.discount > 0 && (
                              <div className="flex justify-between text-dustyRose font-semibold">
                                <span>Discount</span>
                                <span>-{formatPrice(order.discount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between border-t border-stone-200/30 pt-1.5 text-sm font-serif font-bold text-champagne">
                              <span>Total</span>
                              <span>{formatPrice(order.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Link 
                        href={`/track-order?order=${order.orderNumber || order.id}&phone=${encodeURIComponent(order.address.phone)}`} 
                        className="btn-primary-gold w-full py-2 text-xs text-center rounded-xl"
                      >
                        Track Shipment
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <EmptyStateCard 
            icon={Package} 
            text="No orders found" 
            subtext="When you place orders, they will appear here." 
          />
        )}
      </div>
    </div>
  );
}
