"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Protected({ 
  children, 
  adminOnly = false,
  allowedRoles
}: { 
  children: React.ReactNode; 
  adminOnly?: boolean;
  allowedRoles?: string[];
}) {
  const { user, loading, isAdmin, userRole, userStatus } = useAuth();
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShowSpinner(false);
      return;
    }
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
          {adminOnly || allowedRoles ? (
            <Link href="/admin/login" className="flex items-center justify-center gap-2 rounded-full bg-champagne px-6 py-3 font-semibold text-charcoalBrown hover:bg-champagne/90 transition-colors">
              Go to Admin Login
            </Link>
          ) : (
            <>
              <Link href="/login" className="flex items-center justify-center gap-2 rounded-full border border-champagne bg-champagne/10 px-6 py-3 font-semibold text-champagne hover:bg-champagne/20 transition-colors">
                Continue with Google
              </Link>
              <Link href="/login" className="flex items-center justify-center gap-2 rounded-full bg-champagne px-6 py-3 font-semibold text-charcoalBrown hover:bg-champagne/90 transition-colors">
                Login with Email
              </Link>
              <Link href="/signup" className="flex items-center justify-center gap-2 rounded-full border border-stone-200/60 bg-white/70 backdrop-blur-md px-6 py-3 font-semibold text-charcoalBrown hover:border-champagne transition-colors">
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  // Check for suspended or banned users trying to access secure routes
  if ((adminOnly || allowedRoles) && (userStatus === "suspended" || userStatus === "banned")) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-dustyRose/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-dustyRose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h1 className="text-2xl font-serif font-semibold text-dustyRose tracking-wide">Account {userStatus === "banned" ? "Banned" : "Suspended"}</h1>
        <p className="mt-3 text-stoneGray text-sm leading-relaxed">Your account has been {userStatus}. You cannot access this dashboard.</p>
        <Link href="/" className="mt-8 inline-block rounded-full bg-champagne px-7 py-3 font-semibold text-charcoalBrown hover:bg-champagne/90 transition-all shadow-sm">
          Return Home
        </Link>
      </div>
    );
  }

  // Check specific roles if allowedRoles is provided
  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      return (
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-dustyRose/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-dustyRose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.193 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-serif font-semibold text-dustyRose tracking-wide">Access Denied</h1>
          <p className="mt-3 text-stoneGray text-sm leading-relaxed">Your current role ({userRole || 'customer'}) does not have permission to view this page.</p>
          <Link href="/admin" className="mt-8 inline-block rounded-full bg-champagne px-7 py-3 font-semibold text-charcoalBrown hover:bg-champagne/90 transition-all shadow-sm">
            Return to Dashboard
          </Link>
        </div>
      );
    }
  } else if (adminOnly && !isAdmin && userRole !== "staff") {
    // If adminOnly is true but no allowedRoles provided, check isAdmin or staff
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-dustyRose/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-dustyRose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.193 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-serif font-semibold text-dustyRose tracking-wide">Staff / Admin Only</h1>
        <p className="mt-3 text-stoneGray text-sm leading-relaxed">This dashboard is protected for authorized staff only.</p>
        <Link href="/" className="mt-8 inline-block rounded-full bg-champagne px-7 py-3 font-semibold text-charcoalBrown hover:bg-champagne/90 transition-all shadow-sm">
          Return Home
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
