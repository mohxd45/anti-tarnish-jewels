"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AdminError]", error.message, error.stack);
  }, [error]);

  return (
    <div className="min-h-[60vh] bg-ivory flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-[2rem] border border-goldBeige bg-warmwhite p-10 shadow-jewel text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-dustyRose/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-dustyRose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        <h2 className="text-xl font-serif font-semibold text-champagne tracking-wide mb-2">
          Admin Panel Error
        </h2>
        <p className="text-stoneGray text-sm leading-relaxed mb-6">
          This admin section encountered an error. Your data is safe.
        </p>

        {/* Error detail in dev only */}
        {process.env.NODE_ENV === "development" && (
          <pre className="text-left text-xs bg-beige border border-goldBeige rounded-2xl p-4 mb-6 text-dustyRose overflow-auto max-h-32">
            {error.message}
          </pre>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="rounded-full bg-champagne px-6 py-2.5 text-sm font-semibold text-charcoalBrown hover:bg-champagne/90 transition-all shadow-jewel"
          >
            Retry
          </button>
          <Link
            href="/admin"
            className="rounded-full border border-goldBeige px-6 py-2.5 text-sm font-semibold text-champagne hover:bg-champagne/10 transition-colors"
          >
            Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
