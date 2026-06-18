"use client";

import { useEffect, useState } from "react";
import { getAllOrders, listenToAllOrders, updateOrder, updateOrderStatus, updateOrderTracking } from "@/lib/firestore";
import { Order, OrderStatus } from "@/types";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, Eye, Calendar, User, Truck, Search, CreditCard, Loader } from "lucide-react";

const statuses: OrderStatus[] = [
  "Pending Verification",
  "Pending",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Returned"
];

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [paymentFilter, setPaymentFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Edit Tracking State
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("Pending");
  const [updatingTracking, setUpdatingTracking] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToAllOrders((data) => {
      setOrders(data);
      setLoading(false);
      
      // Update selected order if it was modified
      setSelectedOrder(prev => {
        if (!prev) return null;
        return data.find(o => o.id === prev.id) || prev;
      });
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, paymentFilter]);

  useEffect(() => {
    if (selectedOrder) {
      setCourierName(selectedOrder.courierName || "");
      setTrackingNumber(selectedOrder.trackingNumber || "");
      setTrackingUrl(selectedOrder.trackingUrl || "");
      setAdminNote(selectedOrder.notes || "");
      setOrderStatus(selectedOrder.status || selectedOrder.orderStatus || "Pending");
    }
  }, [selectedOrder]);

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    setUpdatingStatus(true);
    try {
      await updateOrderStatus(orderId, status);
      await updateOrderStatus(orderId, status);
      // Removed manual reload since onSnapshot handles it automatically
    } catch (err) {
      console.error(err);
      alert("Failed to update order status.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleSaveTracking(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdatingTracking(true);
    try {
      await updateOrderTracking(
        selectedOrder.id,
        courierName,
        trackingNumber,
        trackingUrl,
        orderStatus,
        adminNote
      );

      // Removed manual reload since onSnapshot handles it automatically
      alert("Order details and shipment tracking saved successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to save order details.");
    } finally {
      setUpdatingTracking(false);
    }
  }

  async function handleCancelOrder() {
    if (!selectedOrder) return;
    if (!confirm("Are you sure you want to cancel this order?")) return;
    await handleStatusChange(selectedOrder.id, "Cancelled");
  }

  // Filter Logic
  const filteredOrders = orders.filter((order) => {
    const orderId = order.id || "";
    const orderNumber = order.orderNumber || "";
    const customerEmail = order.customerEmail || "";
    const customerPhone = order.customerPhone || order.address?.phone || "";
    const fullName = order.customerName || order.address?.fullName || "";
    
    const matchesSearch = 
      orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerPhone.includes(searchQuery) ||
      fullName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || order.status === statusFilter || order.orderStatus === statusFilter;
    
    const normalizedPaymentMethod = (order.paymentMethod || "").toLowerCase();
    const filterPaymentLower = paymentFilter.toLowerCase();
    
    const matchesPayment = 
      paymentFilter === "All" || 
      normalizedPaymentMethod === filterPaymentLower ||
      (filterPaymentLower === "cod" && normalizedPaymentMethod.includes("delivery")) ||
      (filterPaymentLower === "stripe" && normalizedPaymentMethod.includes("stripe")) ||
      (filterPaymentLower === "razorpay" && normalizedPaymentMethod.includes("razorpay"));

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const ITEMS_PER_PAGE = 20;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
        {/* Page Header */}
        <div className="border-b border-goldBeige/40 pb-6 mb-8">
          <h1 className="text-4xl font-serif font-semibold text-champagne tracking-wide">Orders Tracking</h1>
          <p className="text-sm text-stoneGray mt-1">Manage order statuses, courier assignments, and payment transaction logs.</p>
        </div>

        {/* Search & Filters Row */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between mb-8">
          {/* Search input */}
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stoneGray" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, name, or phone..."
              className="w-full rounded-full border border-goldBeige bg-warmwhite py-2.5 pl-11 pr-4 text-charcoalBrown placeholder-stoneGray outline-none focus:border-champagne transition-all text-sm"
            />
          </div>

          {/* Selector group */}
          <div className="flex flex-wrap gap-3">
            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-full border border-goldBeige bg-warmwhite px-4 py-2.5 text-charcoalBrown outline-none focus:border-champagne text-sm appearance-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Payment Filter */}
            <div>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="rounded-full border border-goldBeige bg-warmwhite px-4 py-2.5 text-charcoalBrown outline-none focus:border-champagne text-sm appearance-none cursor-pointer"
              >
                <option value="All">All Payments</option>
                <option value="cod">Cash on Delivery (COD)</option>
                <option value="stripe">Stripe</option>
                <option value="razorpay">Razorpay</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1.4fr]">
          {/* Orders List Panel */}
          <div className="rounded-[2rem] border border-goldBeige bg-warmwhite shadow-jewel overflow-hidden flex flex-col">
            <h2 className="border-b border-goldBeige/40 p-5 font-serif font-semibold text-champagne text-lg flex items-center gap-2">
              <ShoppingBag size={20} /> All Orders ({filteredOrders.length})
            </h2>
            {loading ? (
              <div className="p-12 text-center text-stoneGray">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-stoneGray">No orders found matching the filter criteria.</div>
            ) : (
              <div className="divide-y divide-goldBeige/40 overflow-y-auto max-h-[600px] scrollbar-thin">
                {paginatedOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-5 cursor-pointer hover:bg-beige/35 transition-all flex justify-between items-center ${
                      selectedOrder?.id === order.id ? "bg-beige/20 border-l-4 border-champagne pl-4" : ""
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-serif font-semibold text-charcoalBrown">{order.orderNumber || `Order #${order.id ? order.id.slice(-6).toUpperCase() : "UNKNOWN"}`}</p>
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-beige text-stoneGray font-semibold font-mono">
                          {(order.paymentMethod || "COD").toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-stoneGray mt-1 flex items-center gap-1">
                        <Calendar size={12} /> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Unknown Date"}
                      </p>
                      <p className="text-xs text-stoneGray mt-1">
                        {(order.items || []).length} item(s) • <strong className="text-champagne">{formatPrice(order.total || 0)}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === "Delivered" ? "bg-emerald-500/10 text-emerald-600" :
                        order.status === "Cancelled" || order.status === "Returned" ? "bg-dustyRose/10 text-dustyRose" : "bg-champagne/10 text-champagne"
                      }`}>
                        {order.status || "Pending"}
                      </span>
                      <Eye size={18} className="text-stoneGray/60" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination Controls */}
            {filteredOrders.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between border-t border-goldBeige/40 p-4 bg-beige/5">
                <span className="text-xs text-stoneGray">
                  Page {currentPage} of {Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)}
                </span>
                <div className="flex gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    className="rounded-full border border-goldBeige bg-warmwhite px-3 py-1.5 text-xs font-semibold text-charcoalBrown hover:border-champagne disabled:opacity-50 transition-all"
                  >
                    Prev
                  </button>
                  <button
                    disabled={currentPage * ITEMS_PER_PAGE >= filteredOrders.length}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="rounded-full border border-goldBeige bg-warmwhite px-3 py-1.5 text-xs font-semibold text-charcoalBrown hover:border-champagne disabled:opacity-50 transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Detail View Panel */}
          <div className="rounded-[2rem] border border-goldBeige bg-warmwhite p-6 shadow-jewel h-fit">
            <h2 className="font-serif font-semibold text-champagne text-lg border-b border-goldBeige/40 pb-4">
              Order Details Summary
            </h2>

            {selectedOrder ? (
              <div className="mt-6 space-y-6">
                {/* Header info */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-serif font-semibold text-charcoalBrown">{selectedOrder.orderNumber || `Order #${selectedOrder.id}`}</h3>
                    <p className="text-xs text-stoneGray mt-1">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : "Unknown Date"}</p>
                  </div>
                  {selectedOrder.status !== "Cancelled" && (
                    <button
                      onClick={handleCancelOrder}
                      className="text-xs font-semibold px-4 py-2 rounded-full border border-dustyRose bg-dustyRose/10 text-dustyRose hover:bg-dustyRose hover:text-charcoalBrown transition-all"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>

                {/* Shipment & Status Form */}
                <form onSubmit={handleSaveTracking} className="rounded-2xl border border-goldBeige/50 bg-beige/20 p-4 space-y-3">
                  <div className="flex items-center gap-1.5 border-b border-goldBeige/25 pb-2 mb-1">
                    <Truck size={15} className="text-champagne" />
                    <span className="text-xs uppercase tracking-wider text-champagne font-semibold block">Edit Order Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] uppercase tracking-wider text-stoneGray font-semibold block mb-1">Order Status</label>
                      <select
                        value={orderStatus}
                        onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                        className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-2.5 outline-none text-charcoalBrown focus:border-champagne text-xs cursor-pointer"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status} className="bg-warmwhite text-charcoalBrown">{status}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-stoneGray font-semibold block mb-1">Courier Partner</label>
                      <input
                        type="text"
                        value={courierName}
                        onChange={(e) => setCourierName(e.target.value)}
                        placeholder="Courier Name (e.g. Delhivery)"
                        className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-2 outline-none text-charcoalBrown focus:border-champagne text-xs transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-stoneGray font-semibold block mb-1">Tracking ID</label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Tracking Number"
                        className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-2 outline-none text-charcoalBrown focus:border-champagne text-xs transition-all"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] uppercase tracking-wider text-stoneGray font-semibold block mb-1">Tracking URL</label>
                      <input
                        type="url"
                        value={trackingUrl}
                        onChange={(e) => setTrackingUrl(e.target.value)}
                        placeholder="e.g. https://delhivery.com/track?id=..."
                        className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-2 outline-none text-charcoalBrown focus:border-champagne text-xs transition-all"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] uppercase tracking-wider text-stoneGray font-semibold block mb-1">Admin Notes</label>
                      <textarea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder="Admin Notes (visible to admin only)"
                        className="w-full rounded-2xl border border-goldBeige bg-warmwhite px-4 py-2 outline-none text-charcoalBrown focus:border-champagne text-xs transition-all h-16 resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={updatingTracking}
                    className="w-full rounded-full bg-champagne px-4 py-2.5 text-charcoalBrown hover:opacity-90 text-xs font-semibold transition-all mt-2 shadow-sm"
                  >
                    {updatingTracking ? "Updating Details..." : "Save Order Changes"}
                  </button>
                </form>

                {/* Customer Address Details */}
                <div className="space-y-2 border-t border-goldBeige/40 pt-4">
                  <h4 className="text-xs font-semibold text-champagne uppercase tracking-wider">Shipping Address</h4>
                  <div className="text-sm leading-6 text-charcoalBrown">
                    {(() => {
                      const addr = selectedOrder.shippingAddress || selectedOrder.address;
                      if (!addr) return <p className="text-stoneGray text-xs">No address recorded for this order.</p>;
                      return (
                        <>
                          <p className="font-serif font-semibold text-charcoalBrown flex items-center gap-1.5">
                            <User size={13} className="text-champagne" /> {addr.fullName || "N/A"}
                          </p>
                          <p className="mt-1 pl-4.5 text-stoneGray">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                          <p className="pl-4.5 text-stoneGray">{addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="mt-1 pl-4.5 font-mono text-xs text-stoneGray">Phone: {addr.phone}</p>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Payment Detail Details */}
                <div className="space-y-2 border-t border-goldBeige/40 pt-4">
                  <h4 className="text-xs font-semibold text-champagne uppercase tracking-wider">Payment Transaction</h4>
                  <div className="text-xs flex items-center gap-2 text-stoneGray">
                    <CreditCard size={14} className="text-champagne" />
                    <span>Method: <strong className="text-charcoalBrown uppercase font-mono">{selectedOrder.paymentMethod}</strong></span>
                  </div>
                </div>

                {/* Courier / Tracking Details */}
                {selectedOrder.trackingNumber && (
                  <div className="space-y-2 border-t border-goldBeige/40 pt-4 text-xs text-stoneGray">
                    <h4 className="text-xs font-semibold text-champagne uppercase tracking-wider">Courier / Shipment</h4>
                    <p>Courier Partner: <strong className="text-charcoalBrown">{selectedOrder.courierName || "Standard Shipping"}</strong></p>
                    <p>Tracking ID: <strong className="text-charcoalBrown font-mono">{selectedOrder.trackingNumber}</strong></p>
                    {selectedOrder.trackingUrl && (
                      <p>
                        Tracking URL:{" "}
                        <a href={selectedOrder.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-champagne hover:underline break-all">
                          {selectedOrder.trackingUrl}
                        </a>
                      </p>
                    )}
                  </div>
                )}

                {/* Order Timeline (Admin view) */}
                {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
                  <div className="space-y-3 border-t border-goldBeige/40 pt-4">
                    <h4 className="text-xs font-semibold text-champagne uppercase tracking-wider">Order Timeline</h4>
                    <div className="space-y-3 max-h-[150px] overflow-y-auto pr-2 scrollbar-thin text-xs">
                      {selectedOrder.timeline.map((event, idx) => (
                        <div key={idx} className="flex justify-between items-start gap-4 text-stoneGray border-b border-goldBeige/10 pb-1.5 last:border-b-0">
                          <div>
                            <span className="font-semibold text-charcoalBrown block">{event.title}</span>
                            <span className="text-[10px] text-stoneGray/70">{event.description}</span>
                          </div>
                          <span className="text-[10px] font-mono text-stoneGray/60 shrink-0">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin notes display */}
                {selectedOrder.notes && (
                  <div className="space-y-1.5 border-t border-goldBeige/40 pt-4 text-xs text-stoneGray">
                    <h4 className="text-xs font-semibold text-champagne uppercase tracking-wider">Admin Remarks / Notes</h4>
                    <p className="rounded-xl border border-goldBeige bg-beige/10 p-3 italic text-charcoalBrown leading-relaxed">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-2 border-t border-goldBeige/40 pt-4">
                  <h4 className="text-xs font-semibold text-champagne uppercase tracking-wider">Order Items</h4>
                  <div className="divide-y divide-goldBeige/20 max-h-[180px] overflow-y-auto pr-2 scrollbar-thin">
                    {selectedOrder.items.map((item) => (
                      <div key={item.product.id} className="py-2 flex justify-between items-center text-sm">
                        <div>
                          <p className="font-serif font-semibold text-charcoalBrown">{item.product.name}</p>
                          <p className="text-xs text-stoneGray mt-0.5">Qty: {item.quantity} • {formatPrice(item.product.salePrice)}</p>
                        </div>
                        <span className="font-semibold text-champagne">{formatPrice(item.product.salePrice * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="border-t border-goldBeige/40 pt-4 space-y-2 text-sm text-stoneGray">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-charcoalBrown font-medium">{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-dustyRose font-semibold">
                      <span>Discount Coupon {selectedOrder.couponCode ? `(${selectedOrder.couponCode})` : ""}</span>
                      <span>-{formatPrice(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Fees</span>
                    <span className="text-charcoalBrown font-medium">
                      {(selectedOrder.shippingFee ?? selectedOrder.shipping ?? 0) === 0 ? "Free" : formatPrice(selectedOrder.shippingFee ?? selectedOrder.shipping ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-goldBeige/40 pt-3 text-base font-serif font-semibold text-champagne">
                    <span>Total Paid/Due</span>
                    <span>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-16 text-center text-stoneGray py-10">
                Select an order from the left sidebar tracker to inspect details.
              </div>
            )}
          </div>
        </div>
      </section>
  );
}
