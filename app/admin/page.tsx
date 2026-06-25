"use client";

import { useEffect, useState } from "react";
import { getProducts, getAllOrders, getUsers, getContactMessages } from "@/lib/firestore";
import { Product, Order } from "@/types";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, ShoppingBag, DollarSign, Package, AlertTriangle, ListOrdered, Users, Mail, CheckCircle2, CreditCard, CheckCircle } from "lucide-react";
import { HeartLoader } from "@/components/ui/HeartLoader";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // Step 1: load cached metrics instantly (non-blocking)
      try {
        const cachedProducts = await getProducts(false);
        const cachedOrders = await getAllOrders(false);
        const cachedUsers = await getUsers(false);
        const cachedMsgs = await getContactMessages();
        
        setProducts(cachedProducts);
        setOrders(cachedOrders);
        setUserCount(cachedUsers.length);
        setMsgCount(cachedMsgs.filter(m => !m.isRead).length);
        setLoading(false);
      } catch (err) {
        console.error("Error loading cached dashboard metrics", err);
      }

      // Step 2: fetch fresh metrics in the background (slower)
      try {
        const [freshProducts, freshOrders, freshUsers, freshMsgs] = await Promise.allSettled([
          getProducts(true),
          getAllOrders(true),
          getUsers(true),
          getContactMessages()
        ]);

        if (freshProducts.status === "fulfilled") setProducts(freshProducts.value);
        if (freshOrders.status === "fulfilled") setOrders(freshOrders.value);
        if (freshUsers.status === "fulfilled") setUserCount(freshUsers.value.length);
        if (freshMsgs.status === "fulfilled") setMsgCount(freshMsgs.value.filter(m => !m.isRead).length);
      } catch (err) {
        console.error("Error loading fresh dashboard metrics in background", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute Stats
  const activeOrders = orders.filter(o => {
    const s = (o.status || "").toLowerCase().trim();
    return s !== "cancelled" && s !== "canceled" && s !== "returned" && s !== "failed";
  });
  const totalSales = activeOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => {
    const s = (o.status || "").toLowerCase().trim();
    return s === "pending" || s === "pending verification";
  }).length;
  const confirmedOrders = orders.filter((o) => (o.status || "").toLowerCase().trim() === "confirmed").length;
  const deliveredOrders = orders.filter((o) => (o.status || "").toLowerCase().trim() === "delivered").length;
  const cancelledOrders = orders.filter((o) => {
    const s = (o.status || "").toLowerCase().trim();
    return s === "cancelled" || s === "canceled";
  }).length;
  const codOrders = orders.filter((o) => (o.paymentMethod || "").toLowerCase().includes("delivery") || (o.paymentMethod || "").toLowerCase() === "cod").length;
  const totalProducts = products.length;
  const lowStockCount = products.filter((p) => p.stock !== undefined && p.stock !== null && p.stock <= 5).length;

  const stats = [
    { label: "Total Sales", value: formatPrice(totalSales), icon: DollarSign, color: "text-emerald-500" },
    { label: "Total Orders", value: totalOrders.toString(), icon: ShoppingBag, color: "text-champagne" },
    { label: "Pending Orders", value: pendingOrders.toString(), icon: ListOrdered, color: "text-amber-500" },
    { label: "Confirmed Orders", value: confirmedOrders.toString(), icon: ListOrdered, color: "text-sky-500" },
    { label: "Delivered Orders", value: deliveredOrders.toString(), icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Cancelled Orders", value: cancelledOrders.toString(), icon: AlertTriangle, color: "text-rose" },
    { label: "COD Orders", value: codOrders.toString(), icon: CreditCard, color: "text-indigo-500" },
    { label: "Total Products", value: totalProducts.toString(), icon: Package, color: "text-sky-400" },
    { label: "Low Stock Items", value: lowStockCount.toString(), icon: AlertTriangle, color: "text-rose" },
    { label: "Total Users", value: userCount.toString(), icon: Users, color: "text-champagne" }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif font-semibold text-champagne tracking-wide">Welcome back, Admin</h1>
        <p className="text-sm text-stoneGray mt-1">Here is a summary of your Anti Tarnish Jewels store metrics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const iconColor = stat.color.includes("rose") ? "text-dustyRose" : stat.color.includes("gold") ? "text-champagne" : stat.color;
          return (
            <div key={stat.label} className="rounded-3xl border border-goldBeige bg-warmwhite p-5 flex items-center justify-between shadow-jewel">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-[10px] uppercase tracking-wider text-stoneGray truncate block">{stat.label}</p>
                <h2 className="mt-1.5 text-xl lg:text-2xl font-serif font-semibold text-champagne truncate">
                  {loading ? <HeartLoader size="sm" text="" /> : stat.value}
                </h2>
              </div>
              <div className={`p-2.5 rounded-2xl bg-beige border border-goldBeige/40 shrink-0 ${iconColor}`}>
                <Icon size={18} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Auxiliary Metrics Box */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/users" className="rounded-3xl border border-goldBeige bg-warmwhite p-6 hover:border-champagne/40 transition-all flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-champagne/10 text-champagne rounded-xl"><Users size={20} /></div>
            <div>
              <h3 className="font-serif font-semibold text-charcoalBrown">Registered Customers</h3>
              <p className="text-xs text-stoneGray mt-0.5">Manage Customer spends and roles</p>
            </div>
          </div>
          <span className="text-xl font-bold text-champagne">
            {loading ? <HeartLoader size="sm" text="" /> : userCount}
          </span>
        </Link>
        
        <Link href="/admin/messages" className="rounded-3xl border border-goldBeige bg-warmwhite p-6 hover:border-champagne/40 transition-all flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-dustyRose/10 text-dustyRose rounded-xl"><Mail size={20} /></div>
            <div>
              <h3 className="font-serif font-semibold text-charcoalBrown">Unread Enquiries</h3>
              <p className="text-xs text-stoneGray mt-0.5">Customer feedback and query emails</p>
            </div>
          </div>
          <span className="text-xl font-bold text-dustyRose">
            {loading ? <HeartLoader size="sm" text="" /> : msgCount}
          </span>
        </Link>
      </div>

      {/* Recent Activity Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-[2rem] border border-goldBeige bg-warmwhite p-6 shadow-jewel">
          <div className="flex justify-between items-center border-b border-goldBeige/40 pb-4 mb-4">
            <h2 className="text-lg font-serif font-semibold text-champagne flex items-center gap-2">
              <ListOrdered size={18} /> Recent Orders
            </h2>
            <Link href="/admin/orders" className="text-xs text-champagne hover:underline">View All</Link>
          </div>
          {loading ? (
            <div className="py-10 flex justify-center"><HeartLoader size="sm" text="Loading recent orders..." /></div>
          ) : orders.length === 0 ? (
            <EmptyStateCard 
              icon={ShoppingBag} 
              text="No orders placed yet" 
              subtext="" 
            />
          ) : (
            <div className="divide-y divide-goldBeige/25 space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="pt-3 flex justify-between items-center text-sm">
                  <div>
                    <p className="font-serif font-semibold text-charcoalBrown">Order #{order.id ? order.id.slice(-6).toUpperCase() : "UNKNOWN"}</p>
                    <p className="text-xs text-stoneGray mt-0.5">{(order.items || []).length} item(s) • {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Unknown Date"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-champagne">{formatPrice(order.total || 0)}</p>
                    <span className="text-[10px] uppercase font-bold text-stoneGray bg-champagne/10 px-2 py-0.5 rounded-full">{order.status || "Pending"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Watchlist */}
        <div className="rounded-[2rem] border border-goldBeige bg-warmwhite p-6 shadow-jewel">
          <div className="flex justify-between items-center border-b border-goldBeige/40 pb-4 mb-4">
            <h2 className="text-lg font-serif font-semibold text-champagne flex items-center gap-2">
              <AlertTriangle size={18} /> Low Stock Watchlist
            </h2>
            <Link href="/admin/products" className="text-xs text-champagne hover:underline">View Inventory</Link>
          </div>
          {loading ? (
            <div className="py-10 flex justify-center"><HeartLoader size="sm" text="Loading inventory..." /></div>
          ) : products.filter((p) => p.stock !== undefined && p.stock !== null && p.stock <= 5).length === 0 ? (
            <EmptyStateCard 
              icon={CheckCircle} 
              text="Stock looks good" 
              subtext="All products are healthy in stock!" 
            />
          ) : (
            <div className="divide-y divide-goldBeige/25 space-y-3">
              {products.filter((p) => p.stock !== undefined && p.stock !== null && p.stock <= 5).slice(0, 5).map((p) => (
                <div key={p.id} className="pt-3 flex justify-between items-center text-sm">
                  <div>
                    <p className="font-serif font-semibold text-charcoalBrown">{p.name}</p>
                    <p className="text-xs text-stoneGray mt-0.5">Category: {p.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-dustyRose bg-dustyRose/10 px-2.5 py-1 rounded-full">
                      {p.stock} left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
