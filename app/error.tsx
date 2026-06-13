"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the real error for debugging — visible in Vercel Function Logs
    console.error("[AppError]", error.message, error.stack);
  }, [error]);

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-dustyRose/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-dustyRose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-serif font-semibold text-champagne tracking-wide mb-3">
          Something went wrong
        </h1>
        <p className="text-stoneGray text-sm leading-relaxed mb-8">
          An unexpected error occurred. Please try refreshing the page.
          If the problem continues, contact support.
        </p>

        {/* Error detail (only in dev) */}
        {process.env.NODE_ENV === "development" && (
          <pre className="text-left text-xs bg-beige border border-goldBeige rounded-2xl p-4 mb-6 text-dustyRose overflow-auto max-h-40">
            {error.message}
          </pre>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="rounded-full bg-champagne px-7 py-3 font-semibold text-charcoalBrown hover:bg-champagne/90 transition-all shadow-jewel text-sm"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="rounded-full border border-goldBeige px-7 py-3 font-semibold text-champagne hover:bg-champagne/10 transition-colors text-sm"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
