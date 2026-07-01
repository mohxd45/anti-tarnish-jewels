import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
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
                <span className="font-serif text-lg font-bold text-white">A</span>
              </div>
              <div>
                <h3 className="font-serif text-lg text-pink-900">Anti Tarnish</h3>
                <p className="-mt-1 text-xs text-pink-600">Jewels</p>
              </div>
            </div>
            <p className="text-sm text-pink-700">
              Premium anti-tarnish jewellery crafted for everyday elegance. Stay radiant, always.
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
            <h4 className="mb-4 font-semibold text-pink-900">Connect</h4>
            <ul className="space-y-2 text-sm text-pink-700">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" />hello@antitarnishjewels.com</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" />+91 98765 43210</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" />Mumbai, India</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-pink-300 pt-6 md:flex-row">
          <p className="text-sm text-pink-700">© {new Date().getFullYear()} Anti Tarnish Jewels. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-pink-700">
            <Link href="/privacy-policy" className="hover:text-pink-900">Privacy</Link>
            <Link href="/return-policy" className="hover:text-pink-900">Returns</Link>
            <Link href="/contact" className="hover:text-pink-900">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="mb-4 font-semibold text-pink-900">{title}</h4>
      <ul className="space-y-2 text-sm text-pink-700">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="hover:text-pink-900">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
