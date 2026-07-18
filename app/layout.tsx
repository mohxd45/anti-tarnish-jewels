import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { CapacitorListener } from "@/components/CapacitorListener";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  metadataBase: new URL("https://anti-tarnish-jewels-livid.vercel.app/"),
  title: "LONA JEWELS | Fashion Jewellery & Hair Accessories",
  description: "Shop trendy, budget-friendly fashion jewellery, Korean design pieces, earrings, rings, necklaces, bracelets, and stylish hair accessories at LONA JEWELS.",
  manifest: "/site.webmanifest",
  openGraph: {
    title: "LONA JEWELS | Fashion Jewellery & Hair Accessories",
    description: "Shop trendy, budget-friendly fashion jewellery, Korean design pieces, earrings, rings, necklaces, bracelets, and stylish hair accessories at LONA JEWELS.",
    url: "https://anti-tarnish-jewels-livid.vercel.app/",
    siteName: "LONA JEWELS",
    images: [
      {
        url: "/logo-pink.png",
        width: 800,
        height: 600,
        alt: "LONA JEWELS Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
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
