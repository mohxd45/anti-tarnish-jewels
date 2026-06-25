"use client";

import { useState, useEffect } from "react";
import { getOrderForTracking, getAnnouncements } from "@/lib/firestore";
import { getWhatsAppNumber, createWhatsAppUrl } from "@/lib/whatsapp";
import { Order, OrderStatus } from "@/types";
import { Truck, CheckCircle2, AlertCircle, Search, Calendar, ShieldCheck, Phone } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";

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

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [whatsAppMessage, setWhatsAppMessage] = useState("Hi Anti Tarnish Jewels, I need help tracking my order. My order/tracking number is: ");

  useEffect(() => {
    async function fetchWhatsAppConfigs() {
      try {
        const num = await getWhatsAppNumber();
        setWhatsAppNumber(num);

        const announcements = await getAnnouncements();
        if (announcements && announcements.whatsAppMessage) {
          setWhatsAppMessage(announcements.whatsAppMessage);
        }
      } catch (err) {
        console.warn("Failed to load announcements in TrackOrderPage:", err);
      }
    }
    fetchWhatsAppConfigs();

    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const queryOrder = searchParams.get("order") || searchParams.get("orderNumber");
      const queryPhone = searchParams.get("phone") || searchParams.get("customerPhone") || searchParams.get("mobile");
      if (queryOrder && queryPhone) {
        setOrderId(queryOrder);
        setPhone(queryPhone);
        trackByOrderId(queryOrder, queryPhone);
      }
    }
  }, []);

  async function trackByOrderId(targetId: string, targetPhone: string) {
    setLoading(true);
    setError("");
    setSearched(true);
    setOrder(null);

    try {
      const found = await getOrderForTracking(targetId, targetPhone);

      if (found) {
        setOrder(found);
      } else {
        setError("Order not found. Please check your order/tracking number and phone number.");
      }
    } catch (err) {
      console.error("Error tracking order:", err);
      setError("An error occurred while tracking the order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId.trim() || !phone.trim()) return;
    trackByOrderId(orderId.trim(), phone.trim());
  }

  const currentIdx = order ? getStepIndex(order.status) : -1;
  const isCancelled = order?.status === "Cancelled";
  const isReturned = order?.status === "Returned";

  return (
    <section className="mx-auto max-w-3xl px-4 pt-16 pb-32">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-serif font-semibold text-champagne tracking-wide">Track Shipment</h1>
        <p className="mt-3 text-sm text-stoneGray">Enter your order/tracking number and phone number to verify details</p>
      </div>

      <form onSubmit={handleTrack} className="max-w-md mx-auto space-y-4 rounded-3xl border border-goldBeige bg-white/70 backdrop-blur-md p-6 md:p-8 shadow-jewel">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#2E2823] uppercase tracking-wider">
            Order or Tracking Number
          </label>
          <div className="relative">
            <input
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Example: ATJ-20260608-1001"
              className="w-full rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-5 py-3.5 pl-11 outline-none text-charcoalBrown focus:border-champagne transition-all text-sm uppercase tracking-wider"
            />
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-champagne/60" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#2E2823] uppercase tracking-wider">
            Phone Number
          </label>
          <div className="relative">
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full rounded-full border border-goldBeige bg-white/70 backdrop-blur-md px-5 py-3.5 pl-11 outline-none text-charcoalBrown focus:border-champagne transition-all text-sm tracking-wider"
            />
            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-champagne/60" />
          </div>
        </div>

        <LoadingButton
          type="submit"
          loading={loading}
          loadingText="Verifying..."
          className="w-full rounded-full bg-champagne py-3.5 font-semibold text-charcoalBrown hover:opacity-90 transition-all text-sm shadow-jewel flex items-center justify-center gap-2"
        >
          Track Shipment
        </LoadingButton>
      </form>

      {searched && error && (
        <div className="mt-8">
          <EmptyStateCard 
            icon={AlertCircle} 
            text="Tracking Error" 
            subtext="Order not found. Please check your order/tracking number and phone number, or contact support." 
          >
            {whatsAppNumber && (
              <a
                href={createWhatsAppUrl(
                  whatsAppNumber,
                  `Hi Anti Tarnish Jewels, I need help tracking my order. My order/tracking number is: ${orderId.trim()}`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full rounded-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 font-semibold text-center transition-all text-sm shadow-sm flex items-center justify-center gap-2"
              >
                <span>Need help? Contact us on WhatsApp.</span>
              </a>
            )}
          </EmptyStateCard>
        </div>
      )}

      {/* Tracking results */}
      {searched && order && (
        <div className="mt-10 rounded-[2rem] border border-goldBeige bg-white/70 backdrop-blur-md p-6 md:p-8 shadow-jewel space-y-8 animate-fade-in">
          
          {/* Summary Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-goldBeige/40 pb-5">
            <div>
              <p className="text-xs text-stoneGray uppercase tracking-wider">Order Reference</p>
              <h3 className="text-xl font-serif font-semibold text-champagne mt-1">{order.orderNumber || `#${order.id.toUpperCase()}`}</h3>
              <p className="text-xs text-stoneGray mt-1 flex items-center gap-1">
                <Calendar size={12} /> Placed: {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <div className="text-right">
              <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold ${
                order.status === "Delivered" ? "bg-emerald-500/10 text-emerald-600" :
                order.status === "Cancelled" || order.status === "Returned" ? "bg-dustyRose/10 text-dustyRose" : "bg-champagne/10 text-champagne"
              }`}>
                {order.status}
              </span>
            </div>
          </div>

          {/* Payment & Shipping Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs md:text-sm border-b border-goldBeige/40 pb-5 text-stoneGray">
            <div>
              <span className="font-semibold text-charcoalBrown block">Payment Method</span>
              <span>{order.paymentMethod || "Cash on Delivery"}</span>
            </div>
            <div>
              <span className="font-semibold text-charcoalBrown block">Payment Status</span>
              <span className={order.paymentStatus === "Paid" ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>
                {order.paymentStatus || "Pending"}
              </span>
            </div>
            <div>
              <span className="font-semibold text-charcoalBrown block">Shipping Destination</span>
              <span>{(order.shippingAddress || order.address)?.city || "N/A"}</span>
            </div>
          </div>

          {/* Estimated Delivery */}
          {order.createdAt && (
            <div className="text-xs text-stoneGray/80 flex items-center gap-1.5 bg-beige/15 border border-goldBeige/25 p-3 rounded-2xl">
              <Calendar size={14} className="text-champagne shrink-0" />
              <span>
                Estimated Delivery: <strong>3-5 business days</strong> from order placement date.
              </span>
            </div>
          )}

          {/* Stepper tracking progress */}
          {!isCancelled && !isReturned ? (
            <div className="py-6">
              <h4 className="text-xs font-semibold text-champagne uppercase tracking-wider mb-8">Shipment Progress Status</h4>
              
              {/* Stepper display */}
              <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4">
                {/* Connecting lines for desktop */}
                <div className="hidden md:block absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-goldBeige/40 -z-10" />
                <div
                  className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 h-0.5 bg-champagne transition-all duration-500 -z-10"
                  style={{ width: `${(Math.max(0, currentIdx) / (steps.length - 1)) * 96}%` }}
                />

                {steps.map((step, idx) => {
                  const isCompleted = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  return (
                    <div key={step.label} className="flex flex-row md:flex-col items-center gap-3 md:gap-1.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCompleted
                            ? "bg-champagne border-champagne text-charcoalBrown shadow-jewel shadow-champagne/25"
                            : "bg-white/70 backdrop-blur-md border-goldBeige text-stoneGray/30"
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 size={16} className="stroke-[2.5]" /> : <span className="text-[10px]">{idx + 1}</span>}
                      </div>
                      <div className="text-left md:text-center">
                        <span className={`text-xs block font-semibold ${isCurrent ? "text-champagne" : isCompleted ? "text-charcoalBrown" : "text-stoneGray/50"}`}>
                          {step.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-dustyRose/10 border border-dustyRose/15 p-4 text-center text-dustyRose text-sm">
              This order has been {order.status.toLowerCase()}. Please contact Anti Tarnish Jewels Support for further assistance.
            </div>
          )}

          {/* Courier Details Info */}
          {order.trackingNumber && (
            <div className="rounded-2xl border border-goldBeige bg-beige p-5 space-y-4">
              <h4 className="text-xs font-semibold text-champagne uppercase tracking-wider flex items-center gap-1.5">
                <Truck size={14} /> Dispatch & Courier Tracking Details
              </h4>
              <div className="grid gap-4 md:grid-cols-2 text-xs md:text-sm text-charcoalBrown pt-1">
                <div>
                  <span className="text-stoneGray">Courier Partner:</span>
                  <strong className="text-charcoalBrown ml-2 uppercase font-serif">{order.courierName || "Standard Shipping"}</strong>
                </div>
                <div>
                  <span className="text-stoneGray">Tracking Number:</span>
                  <strong className="text-champagne ml-2 font-mono">{order.trackingNumber}</strong>
                </div>
              </div>
              {order.trackingUrl && (
                <div className="border-t border-goldBeige/20 pt-3 flex">
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-champagne px-5 py-2.5 text-charcoalBrown hover:opacity-90 transition-all text-xs font-semibold shadow-sm"
                  >
                    <Truck size={14} />
                    <span>Track Order on Courier Website</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Order items list summary */}
          <div className="border-t border-goldBeige/40 pt-6">
            <h4 className="text-xs font-semibold text-champagne uppercase tracking-wider mb-4">Ordered Items</h4>
            <div className="divide-y divide-goldBeige/20 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin">
              {order.items.map((item) => (
                <div key={item.product.id} className="py-2.5 flex justify-between items-center text-xs md:text-sm">
                  <div>
                    <span className="font-semibold text-charcoalBrown">{item.product.name}</span>
                    <span className="text-stoneGray ml-2 text-xs">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-semibold text-champagne">{formatPrice(item.product.salePrice * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary details */}
          <div className="border-t border-goldBeige/40 pt-4 flex justify-between items-center text-sm">
            <span className="text-stoneGray">Total Paid Amount:</span>
            <strong className="text-champagne text-lg font-serif">{formatPrice(order.total)}</strong>
          </div>

          {/* WhatsApp Support CTA */}
          {whatsAppNumber && (
            <div className="border-t border-goldBeige/40 pt-4 text-center">
              <a
                href={createWhatsAppUrl(
                  whatsAppNumber,
                  `Hi Anti Tarnish Jewels, I need help with my order ${order.orderNumber || order.id}.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-champagne font-semibold hover:underline"
              >
                <span>Need help? Contact us on WhatsApp.</span>
              </a>
            </div>
          )}

        </div>
      )}
    </section>
  );
}
