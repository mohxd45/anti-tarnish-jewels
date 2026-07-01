"use client";

import { useEffect, useState } from "react";
import { getProducts, getAllOrders, getUsers, getContactMessages } from "@/lib/firestore";
import { Product, Order } from "@/types";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import {
  IndianRupee, ShoppingBag, Clock, CheckCircle2, Package, AlertTriangle,
  Users, TrendingUp, Plus, Image as ImageIcon, Ticket, Settings,
} from "lucide-react";

import { StatCard } from "@/components/admin/StatCard";
import { AdminCard, StatusBadge } from "@/components/admin/Bits";

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
  
  // Today orders
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter((o) => {
    if (!o.createdAt) return false;
    const orderDate = new Date(o.createdAt);
    return orderDate >= today;
  }).length;

  const pendingOrders = orders.filter((o) => {
    const s = (o.status || "").toLowerCase().trim();
    return s === "pending" || s === "pending verification";
  }).length;
  
  const completedOrders = orders.filter((o) => {
    const s = (o.status || "").toLowerCase().trim();
    return s === "delivered" || s === "completed";
  }).length;

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  const monthRevenue = activeOrders.filter((o) => {
    if (!o.createdAt) return false;
    const orderDate = new Date(o.createdAt);
    return orderDate >= thisMonth;
  }).reduce((sum, o) => sum + (o.total || 0), 0);

  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => p.stock !== undefined && p.stock !== null && p.stock <= 5);
  const lowStockCount = lowStockProducts.length;

  // Fake chart data based on actual orders for the last 7 days
  const salesChart = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString("en-US", { weekday: "short" });
    
    // Sum orders for this day
    const dayStart = new Date(d);
    dayStart.setHours(0,0,0,0);
    const dayEnd = new Date(d);
    dayEnd.setHours(23,59,59,999);
    
    const daySales = activeOrders.filter(o => {
      if (!o.createdAt) return false;
      const orderDate = new Date(o.createdAt);
      return orderDate >= dayStart && orderDate <= dayEnd;
    }).reduce((sum, o) => sum + (o.total || 0), 0);

    return { day: dayStr, value: daySales };
  });

  const maxChartValue = Math.max(...salesChart.map((d) => d.value), 1); // Avoid division by zero

  if (loading) {
    return <div className="p-10 text-center animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stat grid — auto-fits big numbers */}
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
        <StatCard label="Total Sales" value={formatPrice(totalSales)} hint="Lifetime" icon={<IndianRupee className="h-4 w-4" />} tone="gold" />
        <StatCard label="Today's Orders" value={todayOrders} icon={<ShoppingBag className="h-4 w-4" />} tone="rose" />
        <StatCard label="Pending Orders" value={pendingOrders} hint="Need action" icon={<Clock className="h-4 w-4" />} tone="warn" />
        <StatCard label="Completed Orders" value={completedOrders.toLocaleString("en-IN")} hint="All time" icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Revenue This Month" value={formatPrice(monthRevenue)} icon={<TrendingUp className="h-4 w-4" />} tone="gold" />
        <StatCard label="Total Products" value={totalProducts} icon={<Package className="h-4 w-4" />} />
        <StatCard label="Low Stock" value={lowStockCount} hint="≤ 5 units" icon={<AlertTriangle className="h-4 w-4" />} tone="warn" />
        <StatCard label="Customers" value={userCount.toLocaleString("en-IN")} icon={<Users className="h-4 w-4" />} tone="rose" />
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 mt-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { to: "/admin/add-product", label: "Add Product", icon: Plus },
          { to: "/admin/orders", label: "View Orders", icon: ShoppingBag },
          { to: "/admin/banners", label: "Add Banner", icon: ImageIcon },
          { to: "/admin/coupons", label: "Create Coupon", icon: Ticket },
          { to: "/admin/settings", label: "Settings", icon: Settings },
        ].map((a) => {
          const I = a.icon;
          return (
            <Link key={a.to} href={a.to} className="glass-card px-4 py-4 flex items-center gap-3 hover:shadow-lg transition-shadow">
              <div className="h-10 w-10 rounded-lg grid place-items-center text-white" style={{ background: "var(--gradient-rose, linear-gradient(135deg, #d8a7b1, #3a2428))" }}>
                <I className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium truncate">{a.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        {/* Sales chart */}
        <AdminCard title="Weekly Sales" className="lg:col-span-2" action={<span className="text-xs text-muted-foreground">Last 7 days</span>}>
          <div className="flex items-end gap-3 h-52 px-1">
            {salesChart.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${(d.value / maxChartValue) * 100}%`,
                      background: "var(--gradient-rose, linear-gradient(135deg, #d8a7b1, #3a2428))",
                      boxShadow: "0 4px 12px rgba(184, 149, 94, 0.25)",
                    }}
                  />
                </div>
                <div className="text-[11px] text-muted-foreground">{d.day}</div>
                <div className="text-[10px] font-medium tabular-nums">{d.value > 0 ? `₹${(d.value / 1000).toFixed(1)}k` : "0"}</div>
              </div>
            ))}
          </div>
        </AdminCard>

        {/* Low stock */}
        <AdminCard title="Low Stock Alert" action={<Link href="/admin/products" className="text-xs text-primary hover:underline">View all</Link>}>
          {lowStockProducts.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">All products have healthy stock.</div>
          ) : (
            <ul className="divide-y divide-border/60">
              {lowStockProducts.slice(0, 5).map((p) => (
                <li key={p.id} className="py-3 flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-secondary overflow-hidden shrink-0">
                    <img src={p.images?.[0] || "/placeholder.png"} alt={p.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.category}</p>
                  </div>
                  <span className="text-xs font-semibold text-amber-700 shrink-0">{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>

      {/* Recent orders */}
      <AdminCard title="Recent Orders" className="mt-6" action={<Link href="/admin/orders" className="text-xs text-primary hover:underline">View all →</Link>}>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="text-left">
                <th className="px-2 py-2 font-medium">Order</th>
                <th className="px-2 py-2 font-medium">Customer</th>
                <th className="px-2 py-2 font-medium">Amount</th>
                <th className="px-2 py-2 font-medium">Status</th>
                <th className="px-2 py-2 font-medium hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id}>
                  <td className="px-2 py-3 font-mono text-xs">{o.id ? o.id.slice(-6).toUpperCase() : "N/A"}</td>
                  <td className="px-2 py-3">{o.customerName || "Unknown"}</td>
                  <td className="px-2 py-3 tabular-nums font-medium">{formatPrice(o.total || 0)}</td>
                  <td className="px-2 py-3"><StatusBadge status={o.status || "Pending"} /></td>
                  <td className="px-2 py-3 text-muted-foreground hidden md:table-cell">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "Unknown Date"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
