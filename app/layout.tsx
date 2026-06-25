import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CapacitorListener } from "@/components/CapacitorListener";
import { GlobalJewelryBackground } from "@/components/ui/GlobalJewelryBackground";

export const metadata: Metadata = {
  metadataBase: new URL("https://anti-tarnish-jewels-livid.vercel.app/"),
  title: "Anti Tarnish Jewels | Waterproof & Tarnish-Free Jewellery Online",
  description: "Shop premium anti-tarnish, waterproof, non-fading jewellery for daily wear, office wear, party wear, and bridal occasions.",
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Anti Tarnish Jewels | Waterproof & Tarnish-Free Jewellery Online",
    description: "Shop premium anti-tarnish, waterproof, non-fading jewellery for daily wear, office wear, party wear, and bridal occasions.",
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
      <body className="bg-ivory bg-gold-radial pb-24 lg:pb-0" suppressHydrationWarning>
        <Providers>
          <GlobalJewelryBackground />
          <CapacitorListener />
          <AnnouncementBar />
          <Header />
          <main>{children}</main>
          <Footer />
          <MobileNav />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
