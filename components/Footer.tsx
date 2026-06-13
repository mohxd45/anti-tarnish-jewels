"use client";

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
  // ✅ ALL hooks unconditionally at the top — React rules of hooks
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [footerCopy, setFooterCopy] = useState("");
  const [mounted, setMounted] = useState(false);

  const isAdminPage = pathname?.startsWith("/admin");

  // useEffect MUST come before any conditional returns
  useEffect(() => {
    if (isAdminPage) return; // Skip data loading on admin pages
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

  // ✅ Safe to conditionally return null now — all hooks already called above
  if (isAdminPage) {
    return null;
  }

  const brandName = settings?.logoText || "Anti Tarnish Jewels";

  return (
    <footer className="mt-20 border-t border-goldBeige/40 bg-beige px-4 pt-12 pb-28 lg:pb-12">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">

        {/* Brand Info */}
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-3">
            <BrandLogo size={48} />
            <span className="text-xl sm:text-2xl font-serif font-semibold tracking-wider sm:tracking-[0.2em] text-champagne uppercase">{brandName}</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-charcoalBrown/70">
            {footerCopy}
          </p>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-semibold text-charcoalBrown">Shop Categories</h4>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-charcoalBrown/70">
            {mounted && categories.length > 0 ? (
              categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="hover:text-champagne transition-colors text-xs"
                >
                  {cat.name}
                </Link>
              ))
            ) : (
              defaultFooterCategories.map((cat) => (
                <Link
                  key={cat}
                  href={`/shop?category=${encodeURIComponent(cat)}`}
                  className="hover:text-champagne transition-colors text-xs"
                >
                  {cat}
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-semibold text-charcoalBrown">Help & Support</h4>
          <div className="mt-4 grid gap-2 text-sm text-charcoalBrown/70">
            <Link href="/track-order" className="hover:text-champagne transition-colors text-xs">Track Order</Link>
            <Link href="/faq" className="hover:text-champagne transition-colors text-xs">FAQ</Link>
            <Link href="/return-policy" className="hover:text-champagne transition-colors text-xs">Return Policy</Link>
            <Link href="/contact" className="hover:text-champagne transition-colors text-xs">Contact Us</Link>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="font-semibold text-charcoalBrown">Newsletter</h4>
          <p className="mt-2 text-xs text-stoneGray mb-3">Subscribe to receive updates, access to exclusive deals, and more.</p>
          <form onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing!"); }} className="flex overflow-hidden rounded-full border border-goldBeige bg-warmwhite">
            <input
              required
              type="email"
              className="w-full bg-transparent px-4 py-3 text-xs outline-none text-charcoalBrown"
              placeholder="Email address"
            />
            <button type="submit" className="bg-champagne px-4 text-xs font-semibold text-charcoalBrown hover:bg-champagne/90 transition-colors">Join</button>
          </form>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="mx-auto max-w-7xl mt-10 pt-6 border-t border-goldBeige/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stoneGray/60">
        <p>© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
        <div className="flex items-center gap-5">
          <Link href="/privacy-policy" className="hover:text-champagne transition-colors">Privacy Policy</Link>
          <Link href="/return-policy" className="hover:text-champagne transition-colors">Return Policy</Link>
          <Link href="/faq" className="hover:text-champagne transition-colors">FAQ</Link>
        </div>
      </div>
    </footer>
  );
}
