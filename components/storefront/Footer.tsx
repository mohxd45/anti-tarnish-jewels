import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { getSiteSettings, getSiteContent } from "@/lib/firestore";

export async function Footer() {
  const settings = await getSiteSettings();
  const content = await getSiteContent("home");

  const brandName = settings?.brandName || "Anti Tarnish Jewels";
  const logoText = settings?.logoText || brandName.charAt(0);
  const footerText = content?.footerText || "Premium anti-tarnish jewellery crafted for everyday elegance. Stay radiant, always.";

  return (
    <footer
      className="px-4 pb-8 pt-16"
      style={{ background: "linear-gradient(180deg, #FCE7F3, #FBCFE8)" }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="gold-trim flex h-10 w-10 items-center justify-center rounded-full">
                <span className="font-serif text-lg font-bold text-white">{logoText}</span>
              </div>
              <div>
                <h3 className="font-serif text-lg text-stone-900">{brandName}</h3>
                {settings?.subtitle && <p className="-mt-1 text-xs text-stoneGray">{settings.subtitle}</p>}
              </div>
            </div>
            <p className="text-sm text-stoneGray whitespace-pre-wrap">
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
            <h4 className="mb-4 font-semibold text-stone-900">Connect</h4>
            <ul className="space-y-2 text-sm text-stoneGray">
              {settings?.email && <li className="flex items-center gap-2"><Mail className="h-4 w-4" />{settings.email}</li>}
              {settings?.whatsAppNumber && <li className="flex items-center gap-2"><Phone className="h-4 w-4" />{settings.whatsAppNumber}</li>}
              {settings?.businessAddress && <li className="flex items-center gap-2"><MapPin className="h-4 w-4" />{settings.businessAddress}</li>}
              {(!settings?.email && !settings?.whatsAppNumber && !settings?.businessAddress) && (
                <>
                  <li className="flex items-center gap-2"><Mail className="h-4 w-4" />hello@antitarnishjewels.com</li>
                  <li className="flex items-center gap-2"><Phone className="h-4 w-4" />+91 98765 43210</li>
                  <li className="flex items-center gap-2"><MapPin className="h-4 w-4" />Mumbai, India</li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-stone-200/50 pt-6 md:flex-row">
          <p className="text-sm text-stoneGray">© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-stoneGray">
            {settings?.deliveryText && <span className="mr-2 border-r border-pink-400 pr-4">{settings.deliveryText}</span>}
            <Link href="/privacy-policy" className="hover:text-stone-900">Privacy</Link>
            <Link href="/return-policy" className="hover:text-stone-900">Returns</Link>
            <Link href="/contact" className="hover:text-stone-900">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="mb-4 font-semibold text-stone-900">{title}</h4>
      <ul className="space-y-2 text-sm text-stoneGray">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="hover:text-stone-900">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
