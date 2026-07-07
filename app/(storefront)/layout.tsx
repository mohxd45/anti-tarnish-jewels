import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { AnnouncementTicker } from "@/components/storefront/AnnouncementTicker";
import { PromoPopup } from "@/components/storefront/PromoPopup";
import { WhatsAppButton } from "@/components/storefront/WhatsAppButton";
import { getSiteSettings, getAnnouncements } from "@/lib/firestore";

export const revalidate = 60;

export default async function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const announcements = await getAnnouncements();

  return (
    <>
      <Navbar settings={settings || {}} />
      <AnnouncementTicker />
      <PromoPopup settings={announcements} />
      <main className="pb-16 pt-28">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
