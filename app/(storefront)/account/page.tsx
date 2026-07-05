"use client";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Package, Heart, MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getAllOrders } from "@/lib/firestore";
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
        const allOrders = await getAllOrders();
        // filter by userId or contactEmail
        const myOrders = allOrders.filter(o => o.userId === user.uid || (o.address && o.address.fullName === profile?.name));
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
      <div className="glass bg-white/80 shadow-sm p-6 md:p-8 rounded-[2rem] border border-goldBeige">
        <h1 className="font-serif text-3xl text-charcoalBrown mb-2">Welcome back, {profile?.name?.split(' ')[0] || 'Guest'}</h1>
        <p className="text-stoneGray text-sm">Manage your orders, track shipments, and update your profile.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass bg-white/80 shadow-sm p-6 rounded-[2rem] border border-goldBeige">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl text-charcoalBrown flex items-center gap-2">
              <Package className="h-5 w-5 text-champagne" /> Recent Orders
            </h2>
            <Link href="/account/orders" className="text-xs font-semibold text-champagne hover:text-charcoalBrown transition-colors flex items-center">
              View All <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-16 bg-beige/50 rounded-xl"></div>
              <div className="h-16 bg-beige/50 rounded-xl"></div>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-stoneGray text-sm">No recent orders found.</p>
              <Link href="/shop" className="text-champagne font-semibold text-sm hover:underline mt-2 inline-block">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div key={order.id} className="flex justify-between items-center p-3 bg-beige/20 border border-goldBeige/50 rounded-xl">
                  <div>
                    <p className="text-xs text-stoneGray">#{order.orderNumber || order.id.slice(0, 8)}</p>
                    <p className="text-sm font-semibold text-charcoalBrown">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-champagne">{formatPrice(order.total)}</p>
                    <p className="text-[10px] uppercase font-semibold text-stoneGray tracking-wider">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass bg-white/80 shadow-sm p-6 rounded-[2rem] border border-goldBeige">
          <h2 className="font-serif text-xl text-charcoalBrown mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-champagne" /> Saved Details
          </h2>
          {profile?.phone || profile?.address ? (
            <div className="space-y-4 text-sm text-stoneGray">
              {profile.phone && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-champagne mb-1">Phone Number</p>
                  <p className="font-medium text-charcoalBrown">{profile.phone}</p>
                </div>
              )}
              {profile.address && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-champagne mb-1">Primary Address</p>
                  <p className="font-medium text-charcoalBrown">{profile.address}</p>
                  <p className="font-medium text-charcoalBrown">
                    {profile.city && `${profile.city}, `}{profile.state && `${profile.state} `}{profile.pincode}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-stoneGray text-sm">You haven't saved any contact details yet.</p>
            </div>
          )}
          <Link href="/account/profile" className="btn-primary-gold w-full mt-6 py-2 text-sm">
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
