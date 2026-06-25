const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'components', 'Footer.tsx');

const content = `"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "./BrandLogo";
import { getCategories, getSiteSettings, getSiteContent } from "@/lib/firestore";
import { Category, SiteSettings } from "@/types";
import { usePathname } from "next/navigation";

const defaultFooterCategories = [
  "Earrings", "Rings", "Necklaces", "Bracelets", "Bangles", "Anklets", "Nose Pins", "Pendants"
];

export function Footer() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [footerCopy, setFooterCopy] = useState("");
  const [mounted, setMounted] = useState(false);

  const isAdminPage = pathname?.startsWith("/admin");

  useEffect(() => {
    if (isAdminPage) return;
    setMounted(true);
    loadData();
  }, [isAdminPage]);

  async function loadData() {
    try {
      const cats = await getCategories();
      setCategories(cats.filter(c => c.isActive));

      const siteSettings = await getSiteSettings();
      setSettings(siteSettings);

      const homeContent = await getSiteContent("home");
      if (homeContent?.footerText) {
        setFooterCopy(homeContent.footerText);
      } else {
        setFooterCopy("Your premium destination for luxury jewellery and accessories.");
      }
    } catch (err) {
      console.error("Error loading footer data:", err);
    }
  }

  if (isAdminPage) {
    return null;
  }

  const brandName = settings?.logoText || "Anti Tarnish Jewels";

  return (
    <footer className="relative mt-20 overflow-hidden pb-28 pt-20 lg:pb-12" style={{ background: "linear-gradient(180deg, oklch(0.95 0.04 20) 0%, oklch(0.86 0.08 18) 100%)" }}>
      <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: "url('/bg-atmosphere.jpg')", backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0" style={{ background: "var(--gradient-spotlight)" }} />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="glass rounded-[2rem] p-8 sm:p-12">
          <div className="grid gap-12 md:grid-cols-4">
            
            <div className="md:col-span-1">
              <Link href="/" className="inline-block text-2xl font-display uppercase tracking-[0.2em] text-ink hover:text-[var(--rose-gold)] transition-colors">
                {brandName}
              </Link>
              <p className="mt-6 text-sm leading-relaxed text-ink/70">
                {footerCopy}
              </p>
            </div>

            <div>
              <h4 className="font-display text-lg text-ink">Shop Categories</h4>
              <div className="mt-6 flex flex-col gap-3">
                {mounted && categories.length > 0 ? (
                  categories.slice(0, 8).map((cat) => (
                    <Link
                      key={cat.id}
                      href={\`/shop?category=\${encodeURIComponent(cat.name)}\`}
                      className="w-fit text-sm text-ink/70 transition-colors hover:text-[var(--rose-gold)]"
                    >
                      {cat.name}
                    </Link>
                  ))
                ) : (
                  defaultFooterCategories.map((cat) => (
                    <Link
                      key={cat}
                      href={\`/shop?category=\${encodeURIComponent(cat)}\`}
                      className="w-fit text-sm text-ink/70 transition-colors hover:text-[var(--rose-gold)]"
                    >
                      {cat}
                    </Link>
                  ))
                )}
              </div>
            </div>

            <div>
              <h4 className="font-display text-lg text-ink">Assistance</h4>
              <div className="mt-6 flex flex-col gap-3">
                <Link href="/track-order" className="w-fit text-sm text-ink/70 transition-colors hover:text-[var(--rose-gold)]">Track Order</Link>
                <Link href="/faq" className="w-fit text-sm text-ink/70 transition-colors hover:text-[var(--rose-gold)]">FAQ</Link>
                <Link href="/return-policy" className="w-fit text-sm text-ink/70 transition-colors hover:text-[var(--rose-gold)]">Return Policy</Link>
                <Link href="/contact" className="w-fit text-sm text-ink/70 transition-colors hover:text-[var(--rose-gold)]">Contact Us</Link>
              </div>
            </div>

            <div>
              <h4 className="font-display text-lg text-ink">Join the List</h4>
              <p className="mt-6 text-sm text-ink/70">Exclusive access to new collections and private sales.</p>
              <form onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing!"); }} className="mt-6">
                <div className="flex rounded-full bg-white/40 p-1 backdrop-blur ring-1 ring-ink/10 focus-within:ring-[var(--rose-gold)] transition-shadow">
                  <input type="email" required placeholder="Email Address" className="w-full bg-transparent px-4 text-sm text-ink placeholder-ink/40 outline-none" />
                  <button type="submit" className="rounded-full px-5 py-2.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5" style={{ background: "var(--gradient-gold)" }}>Join</button>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-ink/10 pt-8 sm:flex-row">
            <p className="text-xs text-ink/60">© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-ink/60">
              <Link href="/privacy-policy" className="hover:text-[var(--rose-gold)] transition-colors">Privacy Policy</Link>
              <Link href="/return-policy" className="hover:text-[var(--rose-gold)] transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
`;

fs.writeFileSync(file, content, 'utf8');
console.log('Footer.tsx rewritten to Lovable UI standard.');
