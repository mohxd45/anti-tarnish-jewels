import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { CapacitorListener } from "@/components/CapacitorListener";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  metadataBase: new URL("https://anti-tarnish-jewels-livid.vercel.app/"),
  title: "Anti Tarnish Jewels | Luxury That Lasts Forever",
  description: "Waterproof, non-fading rose gold, champagne and pearl jewellery — crafted to outshine time.",
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Anti Tarnish Jewels | Luxury That Lasts Forever",
    description: "Waterproof, non-fading rose gold, champagne and pearl jewellery — crafted to outshine time.",
    url: "https://anti-tarnish-jewels-livid.vercel.app/",
    siteName: "Anti Tarnish Jewels",
    images: [
      {
        url: "/logo-pink.png",
        width: 800,
        height: 600,
        alt: "Anti Tarnish Jewels Logo",
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
