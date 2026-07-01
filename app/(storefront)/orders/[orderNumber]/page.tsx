"use client";

import { useEffect, useState, use } from "react";
import { getOrderByOrderNumber, updateOrderStatus } from "@/lib/firestore";
import { Order, OrderStatus } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Protected } from "@/components/Protected";
import { useAuth } from "@/context/AuthContext";
import { 
  ArrowLeft, 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  Package, 
  MapPin, 
  CreditCard, 
  MessageSquare,
  Calendar,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const steps: { label: string; status: OrderStatus }[] = [
  { label: "Ordered", status: "Pending" },
  { label: "Confirmed", status: "Confirmed" },
  { label: "Packed", status: "Packed" },
  { label: "Shipped", status: "Shipped" },
  { label: "Out for Delivery", status: "Out for Delivery" },
  { label: "Delivered", status: "Delivered" }
];

function getStepIndex(status: OrderStatus): number {
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

export default function OrderDetailsPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const resolvedParams = use(params);
  return (
    <Protected>
      <OrderDetailsInner orderNumber={resolvedParams.orderNumber} />
    </Protected>
  );
}

function OrderDetailsInner({ orderNumber }: { orderNumber: string }) {
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [whatsAppConfigs, setWhatsAppConfigs] = useState({
    number: "919999999999",
    message: "Hi Anti Tarnish Jewels, I need help with my order."
  });

  useEffect(() => {
    // Load WhatsApp settings
    if (typeof window !== "undefined") {
      const storedAnnouncements = localStorage.getItem("site_announcements");
      if (storedAnnouncements) {
        try {
          const parsed = JSON.parse(storedAnnouncements);
          if (parsed.whatsAppSupport) {
            setWhatsAppConfigs({
              number: parsed.whatsAppSupport,
              message: parsed.whatsAppMessage || "Hi Anti Tarnish Jewels, I need help with my order."
            });
          }
        } catch (e) {
          console.warn(e);
        }
      }
    }

    async function loadOrder() {
      setLoading(true);
      setError("");
      try {
        const found = await getOrderByOrderNumber(orderNumber);
        if (found) {
          // Check security: user can only see their own order, unless they are admin
          // We can check user profile
          const isAdmin = typeof window !== "undefined" && localStorage.getItem("user_role") === "admin";
          if (found.userId === user?.uid || found.customerEmail === user?.email || isAdmin) {
            setOrder(found);
          } else {
            setError("You do not have permission to view this order.");
          }
        } else {
          setError("Order not found. Please check your order number or contact support.");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while loading order details.");
      } finally {
        setLoading(false);
      }
    }

    if (user && orderNumber) {
      loadOrder();
    }
  }, [orderNumber, user]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-stoneGray">
        Loading order details...
      </div>
    );
  }

  if (error || !order) {
    return (
      <section className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="rounded-[2rem] border border-goldBeige bg-white/70 backdrop-blur-md p-10 shadow-jewel flex flex-col items-center">
          <AlertCircle className="text-dustyRose w-16 h-16 mb-4" />
          <h1 className="text-2xl font-serif font-semibold text-charcoalBrown">{error || "Order Not Found"}</h1>
          <p className="mt-2 text-stoneGray text-sm">Please verify the order number or contact support.</p>
          <div className="mt-8 flex gap-4 w-full">
            <Link href="/orders" className="rounded-full bg-champagne px-6 py-3 font-semibold text-charcoalBrown hover:opacity-90 transition-all flex-1 text-center">
              Back to My Orders
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const currentIdx = getStepIndex(order.status);
  const isCancelled = order.status === "Cancelled";
  const isReturned = order.status === "Returned";

  // Build WhatsApp Support URL
  const waMsg = `Hi Anti Tarnish Jewels, I need help with my order ${order.orderNumber || order.id}.`;
  const waUrl = `https://wa.me/${whatsAppConfigs.number}?text=${encodeURIComponent(waMsg)}`;

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 space-y-8 pb-24">
      {/* Header breadcrumb */}
      <div className="flex items-center gap-3">
        <Link href="/orders" className="rounded-full p-2 border border-goldBeige bg-white/70 backdrop-blur-md text-charcoalBrown hover:bg-champagne/10 transition-all">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <span className="text-xs text-stoneGray uppercase tracking-wider">My Orders</span>
          <h1 className="text-2xl font-serif font-semibold text-charcoalBrown">{order.orderNumber || `Order #${order.id.slice(-6).toUpperCase()}`}</h1>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main tracking & items column */}
        <div className="md:col-span-2 space-y-6">
          {/* Stepper tracking progress */}
          <div className="rounded-[2rem] border border-goldBeige bg-white/70 backdrop-blur-md p-6 md:p-8 shadow-jewel">
            <div className="flex justify-between items-center border-b border-goldBeige/20 pb-4 mb-6">
              <h3 className="text-sm font-serif font-semibold text-champagne uppercase tracking-wider">Order Journey</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                order.status === "Delivered" ? "bg-emerald-500/10 text-emerald-600" :
                order.status === "Cancelled" || order.status === "Returned" ? "bg-dustyRose/10 text-dustyRose" : "bg-champagne/10 text-champagne"
              }`}>
                {order.status}
              </span>
            </div>

            {!isCancelled && !isReturned ? (
              <div className="py-2">
                {/* Horizontal Stepper */}
                <div className="relative hidden sm:flex items-center justify-between">
                  <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-goldBeige/40 -z-10" />
                  <div
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-0.5 bg-champagne transition-all duration-500 -z-10"
                    style={{ width: `${(Math.max(0, currentIdx) / (steps.length - 1)) * 95}%` }}
                  />

                  {steps.map((step, idx) => {
                    const isCompleted = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                      <div key={step.label} className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                            isCompleted
                              ? "bg-champagne border-champagne text-charcoalBrown shadow-jewel shadow-champagne/20"
                              : "bg-white/70 backdrop-blur-md border-goldBeige text-stoneGray/30"
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 size={15} className="stroke-[2.5]" /> : <span className="text-[10px]">{idx + 1}</span>}
                        </div>
                        <span className={`text-[10px] mt-2 font-semibold ${isCurrent ? "text-champagne font-bold" : "text-stoneGray"}`}>
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
                              : "bg-white/70 backdrop-blur-md border-goldBeige text-stoneGray/30"
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 size={12} className="stroke-[2.5]" /> : <div className="w-1.5 h-1.5 rounded-full bg-goldBeige/40" />}
                        </div>
                        <span className={`text-xs font-semibold ${isCurrent ? "text-champagne font-bold" : isCompleted ? "text-charcoalBrown" : "text-stoneGray"}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-dustyRose/10 border border-dustyRose/20 p-4 text-center text-dustyRose text-sm">
                This order has been {order.status.toLowerCase()}.
              </div>
            )}
          </div>

          {/* Items checklist */}
          <div className="rounded-[2rem] border border-goldBeige bg-white/70 backdrop-blur-md p-6 shadow-jewel">
            <h3 className="text-sm font-serif font-semibold text-champagne uppercase tracking-wider border-b border-goldBeige/20 pb-4 mb-4 flex items-center gap-1.5">
              <ShoppingBag size={16} /> Items Purchased
            </h3>
            <div className="divide-y divide-goldBeige/20">
              {order.items.map((item) => (
                <div key={item.product.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {item.product.images?.[0] && (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-goldBeige/30 shrink-0">
                        <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-serif font-semibold text-charcoalBrown text-sm">{item.product.name}</h4>
                      <p className="text-xs text-stoneGray mt-1">Qty: {item.quantity} • {formatPrice(item.product.salePrice)}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-champagne text-sm">{formatPrice(item.product.salePrice * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info column */}
        <div className="space-y-6">
          {/* Support CTA card */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-3xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-jewel transition-all text-center justify-center"
          >
            <MessageSquare size={18} />
            <span>Chat on WhatsApp</span>
          </a>

          {/* Delivery & Tracking info */}
          {order.trackingNumber && (
            <div className="rounded-2xl border border-goldBeige bg-beige p-5 space-y-3 shadow-sm">
              <h4 className="text-xs font-semibold text-champagne uppercase tracking-wider flex items-center gap-1.5">
                <Truck size={14} /> Tracking details
              </h4>
              <div className="text-xs space-y-2 text-stoneGray">
                <p>Courier: <strong className="text-charcoalBrown uppercase">{order.courierName || "Standard courier"}</strong></p>
                <p>Tracking ID: <strong className="text-champagne font-mono">{order.trackingNumber}</strong></p>
              </div>
            </div>
          )}

          {/* Shipping Address */}
          <div className="rounded-[2.5rem] border border-goldBeige bg-white/70 backdrop-blur-md p-6 shadow-jewel space-y-4">
            <h3 className="text-xs font-serif font-semibold text-champagne uppercase tracking-wider flex items-center gap-1.5 border-b border-goldBeige/20 pb-3">
              <MapPin size={14} /> Shipping Address
            </h3>
            <div className="text-xs md:text-sm leading-6 text-charcoalBrown space-y-1">
              <p className="font-serif font-semibold text-charcoalBrown">{order.address?.fullName || order.customerName}</p>
              <p className="text-stoneGray">{order.address?.line1 || ""}</p>
              {order.address?.line2 && <p className="text-stoneGray">{order.address.line2}</p>}
              <p className="text-stoneGray">
                {order.address?.city || ""}, {order.address?.state || ""} - {order.address?.pincode || ""}
              </p>
              <p className="text-xs font-mono text-stoneGray/80 pt-1">Phone: {order.address?.phone || order.customerPhone}</p>
            </div>
          </div>

          {/* Order Summary breakdown */}
          <div className="rounded-[2.5rem] border border-goldBeige bg-white/70 backdrop-blur-md p-6 shadow-jewel space-y-4">
            <h3 className="text-xs font-serif font-semibold text-champagne uppercase tracking-wider flex items-center gap-1.5 border-b border-goldBeige/20 pb-3">
              <CreditCard size={14} /> Payment & Billing
            </h3>
            <div className="text-xs md:text-sm space-y-2 text-stoneGray">
              <div className="flex justify-between">
                <span>Method</span>
                <span className="font-medium text-charcoalBrown uppercase">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status</span>
                <span className={`font-semibold ${order.paymentStatus === "Paid" ? "text-emerald-600" : "text-amber-600"}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between border-t border-goldBeige/25 pt-2">
                <span>Subtotal</span>
                <span className="text-charcoalBrown font-medium">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-dustyRose font-semibold">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Charges</span>
                <span className="text-charcoalBrown font-medium">{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between border-t border-goldBeige/25 pt-2 text-base font-serif font-semibold text-champagne">
                <span>Total Amount</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
