import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { getSiteSettings, getSiteContent } from "@/lib/firestore";
import { MobileFooterAccordion } from "./MobileFooterAccordion";

export async function Footer() {
  const settings = await getSiteSettings();
  const content = await getSiteContent("home");

  const brandName = settings?.brandName || "Anti Tarnish Jewels";
  const logoText = settings?.logoText || brandName.charAt(0);
  const footerText = content?.footerText || "Premium anti-tarnish jewellery crafted for everyday elegance. Stay radiant, always.";

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
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="gold-trim flex h-10 w-10 items-center justify-center rounded-full">
                <span className="font-serif text-lg font-bold text-white">{logoText}</span>
              </div>
              <div>
                <h3 className="font-serif text-lg text-brandEspresso">{brandName}</h3>
                {settings?.subtitle && <p className="-mt-1 text-xs text-brandMutedText">{settings.subtitle}</p>}
              </div>
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
            <ul className="space-y-2 text-sm text-brandMutedText">
              {settings?.email && <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-brandGold" />{settings.email}</li>}
              {settings?.whatsAppNumber && <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-brandGold" />{settings.whatsAppNumber}</li>}
              {settings?.businessAddress && <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brandGold shrink-0" />{settings.businessAddress}</li>}
              {(!settings?.email && !settings?.whatsAppNumber && !settings?.businessAddress) && (
                <>
                  <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-brandGold" />hello@antitarnishjewels.com</li>
                  <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-brandGold" />+91 98765 43210</li>
                  <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brandGold shrink-0" />Mumbai, India</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Copyright & Links - Shared across mobile and desktop */}
        <div className="mt-8 md:mt-0 flex flex-col items-center justify-between gap-4 border-t border-[#E8D7C8]/50 pt-6 md:flex-row">
          <p className="text-sm text-brandMutedText text-center md:text-left">
            © {new Date().getFullYear()} {brandName.toUpperCase()}. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-brandMutedText">
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
