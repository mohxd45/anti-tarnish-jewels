import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { AnnouncementTicker } from "@/components/storefront/AnnouncementTicker";
import { NewsletterPopup } from "@/components/storefront/NewsletterPopup";
import { WhatsAppButton } from "@/components/storefront/WhatsAppButton";
import { getSiteSettings } from "@/lib/firestore";

export const revalidate = 60;

export default async function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <>
      <Navbar settings={settings || {}} />
      <AnnouncementTicker />
      <NewsletterPopup settings={settings as any} />
      <main className="pb-16 pt-28">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
