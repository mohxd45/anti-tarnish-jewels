import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { CapacitorListener } from "@/components/CapacitorListener";
import { Analytics } from "@vercel/analytics/react";

import { SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | LONA JEWELS",
    default: "LONA JEWELS | Anti-Tarnish Jewellery Online in India",
  },
  description: "Shop anti-tarnish jewellery from LONA JEWELS, including earrings, rings, bangles, necklaces, hair accessories, and curated bundles, available online in India.",
  keywords: ["anti tarnish jewellery", "anti tarnish jewellery India", "earrings", "rings", "bangles", "necklaces", "jewellery bundles", "fashion jewellery", "LONA JEWELS"],
  manifest: "/site.webmanifest",
  openGraph: {
    title: "LONA JEWELS | Anti-Tarnish Jewellery Online in India",
    description: "Shop anti-tarnish jewellery from LONA JEWELS, including earrings, rings, bangles, necklaces, hair accessories, and curated bundles, available online in India.",
    url: SITE_URL,
    siteName: "LONA JEWELS",
    images: [
      {
        url: "/lona-hero-bg.png",
        width: 1200,
        height: 630,
        alt: "LONA JEWELS Collection",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LONA JEWELS | Anti-Tarnish Jewellery Online in India",
    description: "Shop anti-tarnish jewellery from LONA JEWELS, including earrings, rings, bangles, necklaces, hair accessories, and curated bundles, available online in India.",
    images: ["/lona-hero-bg.png"],
  },
  robots: {
    index: true,
    follow: true,
  }
};

export const viewport = {
  themeColor: "#FFF0F5"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener("unhandledrejection", function(e) {
                if (e.reason instanceof Event) {
                  e.preventDefault();
                  console.error("Caught Event in unhandledrejection!", {
                    target: e.reason.target,
                    type: e.reason.type,
                    message: e.reason.message || "No message"
                  });
                  // Optionally throw a proper Error so Next.js shows a better stack trace
                  // throw new Error("Unhandled Rejection with Event type: " + e.reason.type);
                }
              });
            `,
          }}
        />
      </head>
      <body className="antialiased overflow-x-hidden" suppressHydrationWarning>
        <Providers>
          <CapacitorListener />
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
