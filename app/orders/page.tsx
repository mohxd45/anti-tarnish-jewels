"use client";
import { useAuth } from "@/context/AuthContext";
import { getUserOrders } from "@/lib/firestore";
import { formatPrice } from "@/lib/utils";
import { Order, OrderStatus } from "@/types";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Truck, CheckCircle2, Package, MapPin, CreditCard, ChevronDown, ChevronUp } from "lucide-react";
import { HeartLoader } from "@/components/ui/HeartLoader";
import { PageLoader } from "@/components/ui/PageLoader";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";

export default function OrdersPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader text="Loading secure area..." />;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-champagne/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-champagne" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-2xl font-serif font-semibold text-champagne tracking-wide">Please sign in to view your orders.</h1>
        <p className="mt-3 text-stoneGray text-sm leading-relaxed">You need an account to view your order history.</p>
        <Link 
          href={`/login?redirect=${encodeURIComponent("/orders")}`} 
          className="mt-8 inline-block rounded-full bg-champagne px-7 py-3 font-semibold text-charcoalBrown hover:bg-champagne/90 transition-all shadow-jewel"
        >
          Login to Continue
        </Link>
      </div>
    );
  }

  return (
    <OrdersInner />
  );
}

function OrdersInner() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFetching(true);
      setError("");
      getUserOrders(user.uid, user.email || undefined)
        .then(setOrders)
        .catch((err) => {
          setError(err.message || "Failed to load orders. Please try again.");
        })
        .finally(() => setFetching(false));
    }
  }, [user]);

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
    <section className="mx-auto max-w-5xl px-4 py-12 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-serif font-semibold text-charcoalBrown">My Orders</h1>
        <p className="text-sm text-stoneGray mt-2">Track the shipping progress and view order summaries of your purchases.</p>
      </div>

      <div className="grid gap-6">
        {fetching ? (
          <div className="py-24">
            <HeartLoader text="Finding your orders..." />
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border border-dustyRose/20 bg-dustyRose/5 p-12 text-center text-dustyRose">
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
              <div key={order.id} className="rounded-[2rem] border border-goldBeige bg-white/70 backdrop-blur-md overflow-hidden shadow-jewel">
                {/* Header Summary */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="p-6 cursor-pointer flex flex-wrap items-center justify-between gap-4 hover:bg-beige/35 transition-all"
                >
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wider text-stoneGray">Order Reference</p>
                    <h3 className="text-lg font-serif font-semibold text-champagne">{order.orderNumber || `#${order.id}`}</h3>
                    <p className="text-xs text-stoneGray">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-stoneGray">Total Amount</p>
                      <p className="font-serif font-semibold text-champagne text-lg">{formatPrice(order.total)}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
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
                  <div className="border-t border-goldBeige/40 p-6 bg-beige/10 space-y-8 transition-all">
                    {/* Visual Tracking Stepper */}
                    {!isCancelled && !isReturned ? (
                      <div className="py-6">
                        {/* Horizontal Stepper for Tablet/Desktop */}
                        <div className="relative hidden sm:flex items-center justify-between">
                          {/* Progress Line */}
                          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-goldBeige/40 -z-10" />
                          <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-champagne transition-all duration-500 -z-10"
                            style={{ width: `${(Math.max(0, currentIdx) / (steps.length - 1)) * 100}%` }}
                          />

                          {/* Steps */}
                          {steps.map((step, idx) => {
                            const isCompleted = idx <= currentIdx;
                            const isCurrent = idx === currentIdx;
                            return (
                              <div key={step.label} className="flex flex-col items-center">
                                <div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                                    isCompleted
                                      ? "bg-champagne border-champagne text-charcoalBrown shadow-jewel shadow-champagne/20"
                                      : "bg-white/70 backdrop-blur-md border-goldBeige text-stoneGray/30"
                                  }`}
                                >
                                  {isCompleted ? <CheckCircle2 size={18} className="stroke-[2.5]" /> : <div className="w-2.5 h-2.5 rounded-full bg-goldBeige/40" />}
                                </div>
                                <span className={`text-xs mt-2.5 font-medium ${isCurrent ? "text-champagne font-semibold" : "text-stoneGray"}`}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Vertical Stepper for Mobile */}
                        <div className="relative sm:hidden flex flex-col gap-6 pl-6 border-l-2 border-goldBeige/40 ml-4">
                          {steps.map((step, idx) => {
                            const isCompleted = idx <= currentIdx;
                            const isCurrent = idx === currentIdx;
                            return (
                              <div key={step.label} className="relative flex items-center gap-4">
                                <div
                                  className={`absolute -left-[35px] w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                                    isCompleted
                                      ? "bg-champagne border-champagne text-charcoalBrown shadow-jewel"
                                      : "bg-beige border-goldBeige text-stoneGray/30"
                                  }`}
                                >
                                  {isCompleted ? <CheckCircle2 size={12} className="stroke-[2.5]" /> : <div className="w-1.5 h-1.5 rounded-full bg-goldBeige/40" />}
                                </div>
                                <span className={`text-sm font-medium ${isCurrent ? "text-champagne font-semibold" : isCompleted ? "text-charcoalBrown" : "text-stoneGray"}`}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-dustyRose/10 border border-dustyRose/20 p-4 text-center text-dustyRose text-sm">
                        This order has been {order.status.toLowerCase()}. If you have questions, please reach out to customer support.
                      </div>
                    )}

                    {/* Order Breakdown Grid */}
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Items */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-serif font-semibold text-champagne uppercase tracking-wider flex items-center gap-1.5">
                          <ShoppingBag size={15} /> Order Items
                        </h4>
                        <div className="divide-y divide-goldBeige/30 rounded-2xl border border-goldBeige/50 bg-beige/10 p-4 space-y-3">
                          {order.items.map((item) => (
                            <div key={item.product.id} className="pt-3 first:pt-0 flex items-center justify-between text-sm">
                              <div className="flex items-center gap-3">
                                {item.product.images?.[0] && (
                                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-goldBeige/30">
                                    <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-serif font-semibold text-charcoalBrown">{item.product.name}</p>
                                  <p className="text-xs text-stoneGray mt-0.5">Qty: {item.quantity} • {formatPrice(item.product.salePrice)}</p>
                                </div>
                              </div>
                              <span className="font-semibold text-champagne">{formatPrice(item.product.salePrice * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping & Payment */}
                      <div className="space-y-6">
                        {/* Address */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-serif font-semibold text-champagne uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin size={15} /> Shipping Destination
                          </h4>
                          <div className="rounded-2xl border border-goldBeige/50 bg-beige/10 p-4 text-sm leading-6 text-charcoalBrown">
                            <p className="font-serif font-semibold text-charcoalBrown">{order.address.fullName}</p>
                            <p className="text-stoneGray">{order.address.line1}, {order.address.line2}</p>
                            <p className="text-stoneGray">{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                            <p className="text-xs text-stoneGray/70 mt-1">Contact Phone: {order.address.phone}</p>
                          </div>
                        </div>

                        {/* Payment Details */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-serif font-semibold text-champagne uppercase tracking-wider flex items-center gap-1.5">
                            <CreditCard size={15} /> Payment Summary
                          </h4>
                          <div className="rounded-2xl border border-goldBeige/50 bg-beige/10 p-4 text-sm space-y-2 text-stoneGray">
                            <div className="flex justify-between">
                              <span>Payment Method</span>
                              <span className="font-medium text-charcoalBrown capitalize">
                                {order.paymentMethod === "cod" ? "Cash On Delivery (COD)" : order.paymentMethod}
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-goldBeige/30 pt-2">
                              <span>Subtotal</span>
                              <span className="text-charcoalBrown font-medium">{formatPrice(order.subtotal)}</span>
                            </div>
                            {order.discount > 0 && (
                              <div className="flex justify-between text-dustyRose font-semibold">
                                <span>Discount Applied</span>
                                <span>-{formatPrice(order.discount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>Shipping Charges</span>
                              <span className="text-charcoalBrown font-medium">{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span>
                            </div>
                            <div className="flex justify-between border-t border-goldBeige/30 pt-2 text-base font-serif font-semibold text-champagne">
                              <span>Final Paid Amount</span>
                              <span>{formatPrice(order.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-4 border-t border-goldBeige/30 pt-6">
                      <Link 
                        href={`/orders/${order.orderNumber || order.id}`} 
                        className="rounded-full bg-champagne px-5 py-2.5 font-semibold text-charcoalBrown hover:opacity-90 transition-all text-xs shadow-sm text-center"
                      >
                        View Details
                      </Link>
                      <Link 
                        href={`/track-order?order=${order.orderNumber || order.id}&phone=${encodeURIComponent(order.address.phone)}`} 
                        className="rounded-full border border-goldBeige px-5 py-2.5 text-champagne hover:bg-champagne/5 transition-all text-xs font-semibold text-center"
                      >
                        Track Order
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
            subtext="Once you purchase items from the checkout page, they will show up here." 
          />
        )}
      </div>
    </section>
  );
}
