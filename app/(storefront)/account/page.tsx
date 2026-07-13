"use client";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Package, Heart, MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getUserOrders } from "@/lib/firestore";
import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";

export default function AccountDashboard() {
  const { user, profile } = useAuth();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecentOrders() {
      if (!user) return;
      try {
        const fetchedOrders = await getUserOrders(user.uid, user.email || undefined);
        // Additional client-side filter to ensure we get orders matching the profile name/phone if needed
        const myOrders = fetchedOrders.filter(o => 
          o.userId === user.uid || 
          (user.email && o.customerEmail === user.email) ||
          (profile?.phone && o.address?.phone === profile.phone)
        );
        // Sort by date descending and take top 3
        myOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRecentOrders(myOrders.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadRecentOrders();
  }, [user, profile]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="bg-[#FFF9FB] shadow-[0_8px_24px_rgba(58,36,40,0.04)] border border-[#E8D7C8]/50 rounded-[2rem] p-6 sm:p-10 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#3A2428] mb-1 sm:mb-2 text-center sm:text-left">Welcome back, {profile?.name?.split(' ')[0] || 'Guest'}</h1>
          <p className="text-[#3A2428]/70 text-sm sm:text-base text-center sm:text-left truncate max-w-full">
            {user.email}
          </p>
        </div>
        <div className="hidden sm:flex h-16 w-16 bg-[#FFF0F5] items-center justify-center rounded-full text-[#B8955E] text-2xl font-serif border border-[#B8955E]/20">
          {profile?.name?.charAt(0)?.toUpperCase() || 'G'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        <div className="bg-[#FFF9FB] shadow-[0_8px_24px_rgba(58,36,40,0.04)] border border-[#E8D7C8]/50 rounded-[2rem] p-6 sm:p-8 h-fit">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl text-[#3A2428] flex items-center gap-2">
              <Package className="h-6 w-6 text-[#B8955E]" /> Recent Orders
            </h2>
            <Link href="/account/orders" className="text-xs font-semibold uppercase tracking-widest text-[#B8955E] hover:text-[#3A2428] transition-colors flex items-center">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-16 bg-[#FFF0F5] rounded-xl"></div>
              <div className="h-16 bg-[#FFF0F5] rounded-xl"></div>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8 bg-[#FFF0F5] rounded-2xl">
              <p className="text-[#3A2428]/70 text-sm">No recent orders found.</p>
              <Link href="/shop" className="text-[#B8955E] font-semibold text-sm hover:underline mt-2 inline-block">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map(order => (
                <div key={order.id} className="flex justify-between items-center p-4 bg-[#FFF0F5] border border-[#E8D7C8]/50 rounded-2xl transition hover:border-[#B8955E]/30">
                  <div>
                    <p className="text-xs font-medium text-[#3A2428]/60 mb-1 tracking-wider uppercase">#{order.orderNumber || order.id.slice(0, 8)}</p>
                    <p className="text-sm font-semibold text-[#3A2428]">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#B8955E] mb-1">{formatPrice(order.total)}</p>
                    <p className="text-[10px] uppercase font-bold text-[#3A2428]/60 tracking-wider bg-white px-2 py-0.5 rounded-full inline-block border border-[#E8D7C8]/30">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#FFF9FB] shadow-[0_8px_24px_rgba(58,36,40,0.04)] border border-[#E8D7C8]/50 rounded-[2rem] p-6 sm:p-8 h-fit">
          <h2 className="font-serif text-2xl text-[#3A2428] mb-6 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-[#B8955E]" /> Saved Details
          </h2>
          {profile?.phone || profile?.address ? (
            <div className="space-y-6">
              {profile.phone && (
                <div className="bg-[#FFF0F5] p-4 rounded-2xl border border-[#E8D7C8]/50">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#B8955E] mb-1">Phone Number</p>
                  <p className="font-medium text-[#3A2428]">{profile.phone}</p>
                </div>
              )}
              {profile.address && (
                <div className="bg-[#FFF0F5] p-4 rounded-2xl border border-[#E8D7C8]/50">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#B8955E] mb-1">Primary Address</p>
                  <div className="text-sm text-[#3A2428] mt-2 space-y-1">
                    <p>{profile.address.line1}</p>
                    {profile.address.line2 && <p>{profile.address.line2}</p>}
                    <p>{profile.address.city}, {profile.address.state} {profile.address.pincode}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 bg-[#FFF0F5] rounded-2xl">
              <p className="text-[#3A2428]/70 text-sm">No saved details found.</p>
              <Link href="/account/profile" className="text-[#B8955E] font-semibold text-sm hover:underline mt-2 inline-block">Update Profile</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
