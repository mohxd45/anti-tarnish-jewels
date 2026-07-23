import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { AnnouncementTicker } from "@/components/storefront/AnnouncementTicker";
import { PromoPopup } from "@/components/storefront/PromoPopup";
import { WhatsAppButton } from "@/components/storefront/WhatsAppButton";
import { MobileBottomNav } from "@/components/storefront/MobileBottomNav";
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
      <PromoPopup settings={announcements} />
      <div className="pt-[64px] lg:pt-[132px] flex flex-col w-full min-h-screen">
        <main className="flex-grow">{children}</main>
        <Footer />
        <WhatsAppButton />
      </div>
      <MobileBottomNav />
    </>
  );
}
