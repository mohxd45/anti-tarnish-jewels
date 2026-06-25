"use client";

import { Protected } from "@/components/Protected";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function AccountPage() {
  return (
    <Protected>
      <AccountInner />
    </Protected>
  );
}

function AccountInner() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-serif font-semibold text-charcoalBrown">My Account</h1>
      <div className="mt-8 rounded-[2rem] border border-[#F1CFCF]/50 bg-white/70 backdrop-blur-md p-8 shadow-jewel">
        <p className="text-stoneGray">Logged in as</p>
        <h2 className="mt-2 text-2xl font-serif font-semibold text-champagne">{user?.email}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link href="/orders" className="rounded-2xl border border-[#F1CFCF]/50 bg-beige p-5 text-champagne hover:border-champagne hover:bg-champagne/5 transition-all font-semibold">My Orders</Link>
          <Link href="/track-order" className="rounded-2xl border border-[#F1CFCF]/50 bg-beige p-5 text-champagne hover:border-champagne hover:bg-champagne/5 transition-all font-semibold">Track Order</Link>
          <Link href="/wishlist" className="rounded-2xl border border-[#F1CFCF]/50 bg-beige p-5 text-champagne hover:border-champagne hover:bg-champagne/5 transition-all font-semibold">Wishlist</Link>
          {isAdmin && <Link href="/admin" className="rounded-2xl border border-[#F1CFCF]/50 bg-beige p-5 text-champagne hover:border-champagne hover:bg-champagne/5 transition-all font-semibold">Admin Dashboard</Link>}
        </div>
        <button onClick={logout} className="mt-8 rounded-full bg-dustyRose px-6 py-3 font-semibold text-charcoalBrown hover:opacity-90 transition-all">Logout</button>
      </div>
    </section>
  );
}
