import type { ReactNode } from "react";
import { AnnouncementTicker } from "./AnnouncementTicker";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { WhatsAppButton } from "./WhatsAppButton";

export function StoreLayout({ children }: { children: ReactNode }) {
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

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-4">
      <h1 className="font-serif text-4xl text-charcoalBrown md:text-5xl">{title}</h1>
      {subtitle && <p className="mt-2 text-stoneGray">{subtitle}</p>}
    </div>
  );
}
