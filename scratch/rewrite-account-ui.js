const fs = require('fs');

const accountContent = `"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Package, Heart, Settings, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { getOrders } from "@/lib/firestore";
import { Order } from "@/types";

export default function AccountPage() {
  const { user, profile, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    async function loadOrders() {
      try {
        const allOrders = await getOrders();
        // filter by userId or contactEmail
        const myOrders = allOrders.filter(o => o.userId === user?.uid || (o.address && o.address.fullName === profile?.name));
        setOrders(myOrders);
      } catch (err) {
        console.error(err);
      }
    }
    loadOrders();
  }, [user, router, profile]);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="bg-[var(--noir)] pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="font-display text-4xl md:text-5xl text-[var(--ink)] mb-8">My Account</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-4">
            <div className="glass-dark p-6 rounded-3xl border border-[var(--glass-border)] shadow-sm text-center">
              <div className="w-20 h-20 bg-[var(--gold-light)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--pink-200)] shadow-sm">
                <UserIcon className="w-10 h-10 text-[var(--ink)]" />
              </div>
              <h2 className="font-display text-xl text-[var(--ink)] font-semibold">{profile?.name || user?.email?.split('@')[0]}</h2>
              <p className="text-[var(--stoneGray)] text-sm mb-6 truncate">{user?.email}</p>
              
              <div className="space-y-2">
                <Link href="/wishlist" className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[var(--pink-100)] transition-colors text-[var(--ink)] font-medium">
                  <Heart className="w-5 h-5 text-[var(--stoneGray)]" /> Wishlist
                </Link>
                <Link href="/track-order" className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[var(--pink-100)] transition-colors text-[var(--ink)] font-medium">
                  <Package className="w-5 h-5 text-[var(--stoneGray)]" /> Track Order
                </Link>
                {profile?.isAdmin && (
                  <Link href="/admin" className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[var(--pink-100)] transition-colors text-[var(--gold-dark)] font-semibold">
                    <Settings className="w-5 h-5" /> Admin Dashboard
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors text-[var(--stoneGray)] font-medium mt-4"
                >
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="glass-dark p-6 md:p-8 rounded-3xl border border-[var(--glass-border)] shadow-sm">
              <h2 className="font-display text-2xl text-[var(--ink)] mb-6 font-semibold">Order History</h2>
              
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-[var(--charcoal)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--pink-200)]">
                    <Package className="w-8 h-8 text-[var(--stoneGray)]" />
                  </div>
                  <h3 className="font-display text-xl text-[var(--ink)] mb-2">No orders yet</h3>
                  <p className="text-[var(--stoneGray)] mb-6">When you place orders, they will appear here.</p>
                  <Link href="/shop" className="btn-liquid inline-block">Start Shopping</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="bg-[var(--charcoal)] p-4 md:p-6 rounded-2xl border border-[var(--pink-200)] flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <p className="text-xs text-[var(--stoneGray)] mb-1">Order #{order.orderNumber || order.id.slice(0, 8)}</p>
                        <p className="text-[var(--ink)] font-medium">{new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="text-sm text-[var(--stoneGray)] mt-2">{order.items.length} item(s)</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-display text-xl text-[var(--ink)] font-bold mb-2">₹{order.totalAmount}</p>
                        <span className={\`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider \${
                          order.status === 'delivered' ? 'bg-[var(--success)]/10 text-[var(--success)]' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                          'bg-[var(--gold)]/20 text-[var(--gold-dark)]'
                        }\`}>
                          {order.status || "Processing"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('app/account/page.tsx', accountContent);
