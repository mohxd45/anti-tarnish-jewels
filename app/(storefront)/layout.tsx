import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { AnnouncementTicker } from "@/components/storefront/AnnouncementTicker";
import { WhatsAppButton } from "@/components/storefront/WhatsAppButton";

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <AnnouncementTicker />
      <main className="pb-16 pt-28">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
