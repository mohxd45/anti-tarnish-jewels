"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Protected({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading, isAdmin } = useAuth();
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShowSpinner(false);
      return;
    }
    // Only show spinner if loading takes more than 300ms
    const t = setTimeout(() => setShowSpinner(true), 300);
    return () => clearTimeout(t);
  }, [loading]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-champagne border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stoneGray text-sm tracking-wide">Loading secure area...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-champagne/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-champagne" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-2xl font-serif font-semibold text-champagne tracking-wide">Please Login</h1>
        <p className="mt-3 text-stoneGray text-sm leading-relaxed mb-8">You need an account to access this page.</p>
        
        <div className="flex flex-col gap-3 max-w-sm mx-auto">
          <Link href="/login" className="flex items-center justify-center gap-2 rounded-full border border-champagne bg-champagne/10 px-6 py-3 font-semibold text-champagne hover:bg-champagne/20 transition-colors">
            Continue with Google
          </Link>
          <Link href="/login" className="flex items-center justify-center gap-2 rounded-full bg-champagne px-6 py-3 font-semibold text-charcoalBrown hover:bg-champagne/90 transition-colors">
            Login with Email
          </Link>
          <Link href="/signup" className="flex items-center justify-center gap-2 rounded-full border border-goldBeige/60 bg-warmwhite px-6 py-3 font-semibold text-charcoalBrown hover:border-champagne transition-colors">
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-dustyRose/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-dustyRose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.193 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-serif font-semibold text-dustyRose tracking-wide">Admin Only</h1>
        <p className="mt-3 text-stoneGray text-sm leading-relaxed">This dashboard is protected for the store owner only.</p>
        <Link href="/" className="mt-8 inline-block rounded-full bg-champagne px-7 py-3 font-semibold text-charcoalBrown hover:bg-champagne/90 transition-all shadow-jewel">
          Return Home
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
