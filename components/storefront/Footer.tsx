import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { getSiteSettings, getSiteContent } from "@/lib/firestore";
import { MobileFooterAccordion } from "./MobileFooterAccordion";

export async function Footer() {
  const settings = await getSiteSettings();
  const content = await getSiteContent("home");

  const brandName = "LONA JEWELS";
  const logoText = settings?.logoText || "L";
  const footerText = "Trendy, budget-friendly fashion jewellery and hair accessories crafted for everyday style.";

  return (
    <footer className="bg-[#FFF0F5] px-4 pb-28 md:pb-8 pt-12 md:pt-16 border-t border-[#E8D7C8]/50">
      <div className="mx-auto max-w-7xl">
        
        {/* Mobile Layout (Accordion) */}
        <MobileFooterAccordion 
          brandName={brandName}
          logoText={logoText}
          footerText={footerText}
          settings={settings}
        />

        {/* Desktop Layout */}
        <div className="hidden md:grid mb-12 grid-cols-4 gap-8">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="mb-4">
              <Link href="/" className="inline-block relative w-32 h-32 md:w-40 md:h-40">
                <Image src="/lona-logo.jpg" alt="LONA JEWELS" fill sizes="160px" className="object-contain" />
              </Link>
            </div>
            <p className="text-sm text-brandMutedText whitespace-pre-wrap">
              {footerText}
            </p>
          </div>
          <FooterCol title="Shop" links={[
            { href: "/shop?category=Rings", label: "Rings" },
            { href: "/shop?category=Earrings", label: "Earrings" },
            { href: "/shop?category=Necklaces", label: "Necklaces" },
            { href: "/shop?category=Bracelets", label: "Bracelets" },
          ]}/>
          <FooterCol title="Help" links={[
            { href: "/track-order", label: "Track Order" },
            { href: "/contact", label: "Contact Us" },
            { href: "/faq", label: "FAQ" },
            { href: "/return-policy", label: "Returns" },
          ]}/>
          <div>
            <h4 className="mb-4 font-semibold text-brandEspresso">Connect</h4>
            <ul className="space-y-3 text-sm text-brandMutedText">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-brandGold shrink-0" />Support@lonajewels.com</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-brandGold shrink-0" />+91 8100558024</li>
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 text-brandGold mt-0.5 shrink-0" /><span className="leading-relaxed">BMST Enterprise, 96/H/7 Cossipore Road, Kolkata, West Bengal - 700002</span></li>
            </ul>
          </div>
        </div>

        {/* Copyright & Links - Shared across mobile and desktop */}
        <div className="mt-8 md:mt-0 flex flex-col items-center justify-between gap-4 border-t border-[#E8D7C8]/50 pt-6 md:flex-row pb-6">
          <div className="flex flex-col gap-1 text-sm text-brandMutedText text-center md:text-left">
            <p>© 2026 LONA JEWELS. All rights reserved.</p>
            <p>LONA JEWELS is owned and operated by BMST Enterprise.</p>
          </div>
          <div className="flex gap-4 text-sm text-brandMutedText mb-4 md:mb-0">
            {settings?.deliveryText && <span className="mr-2 border-r border-[#E8D7C8] pr-4 hidden md:inline">{settings.deliveryText}</span>}
            <Link href="/privacy-policy" className="hover:text-brandGoldDeep transition-colors">Privacy</Link>
            <Link href="/return-policy" className="hover:text-brandGoldDeep transition-colors">Returns</Link>
            <Link href="/contact" className="hover:text-brandGoldDeep transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="mb-4 font-semibold text-brandEspresso">{title}</h4>
      <ul className="space-y-2 text-sm text-brandMutedText">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="hover:text-brandGoldDeep transition-colors">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
