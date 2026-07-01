"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Package, Heart, Settings, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { getAllOrders } from "@/lib/firestore";
import { Order } from "@/types";

export default function AccountPage() {
  const { user, profile, logout, isAdmin } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    async function loadOrders() {
      try {
        const allOrders = await getAllOrders();
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
    <>
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <h1 className="mb-8 font-serif text-3xl text-pink-900 md:text-4xl">My Account</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-16">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-4">
            <div className="glass bg-white/90 shadow-sm border border-[color:var(--color-border)] p-6 rounded-3xl text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-pink-100 border border-pink-200">
                <UserIcon className="h-10 w-10 text-pink-900" />
              </div>
              <h2 className="font-serif text-xl text-pink-900">{profile?.name || user?.email?.split('@')[0]}</h2>
              <p className="text-sm text-pink-600 mb-6 truncate">{user?.email}</p>
              
              <div className="space-y-2">
                <Link href="/wishlist" className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-pink-100 transition-colors text-pink-900 font-medium">
                  <Heart className="h-5 w-5 text-pink-600" /> Wishlist
                </Link>
                <Link href="/track-order" className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-pink-100 transition-colors text-pink-900 font-medium">
                  <Package className="h-5 w-5 text-pink-600" /> Track Order
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-pink-100 transition-colors text-[color:var(--color-gold)] font-semibold">
                    <Settings className="h-5 w-5" /> Admin Dashboard
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="mt-4 flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors text-pink-700 font-medium"
                >
                  <LogOut className="h-5 w-5" /> Sign Out
                </button>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="glass bg-white/90 shadow-sm p-6 md:p-8 rounded-3xl border border-[color:var(--color-border)]">
              <h2 className="mb-6 font-serif text-2xl text-[color:var(--color-espresso)]">Order History</h2>
              
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-50">
                    <Package className="h-8 w-8 text-pink-400" />
                  </div>
                  <h3 className="mb-2 font-serif text-xl text-[color:var(--color-espresso)]">No orders yet</h3>
                  <p className="mb-6 text-[color:var(--color-muted-text)]">When you place orders, they will appear here.</p>
                  <Link href="/shop" className="btn-primary-gold inline-block">Start Shopping</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="glass bg-white p-4 md:p-6 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 border border-[color:var(--color-border)]">
                      <div>
                        <p className="mb-1 text-xs text-pink-600">Order #{order.orderNumber || order.id.slice(0, 8)}</p>
                        <p className="font-medium text-pink-900">{new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="mt-2 text-sm text-pink-600">{order.items.length} item(s)</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="mb-2 font-serif text-xl font-bold text-pink-900">₹{order.total}</p>
                        <span className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                          order.status?.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-[color:var(--color-gold)] text-white'
                        }`}>
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
    </>
  );
}
