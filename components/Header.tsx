"use client";

import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { getCategories, getSiteSettings } from "@/lib/firestore";
import { Category, SiteSettings } from "@/types";

// Module-level cache — fetched once per browser session, not on every mount
let cachedCategories: Category[] | null = null;
let cachedSettings: SiteSettings | null = null;

const defaultDesktopCategories = [
  { name: "Earrings" },
  { name: "Rings" },
  { name: "Necklaces" },
  { name: "Bracelets" }
];

export function Header() {
  // ✅ ALL hooks must be called unconditionally at the top — React rules of hooks
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [mounted, setMounted] = useState(false);
  const { items } = useCart();
  const wishlist = useWishlist();
  const { user, logout, isAdmin } = useAuth();

  const isAdminPage = pathname?.startsWith("/admin");

  // useEffect MUST come before any conditional returns
  useEffect(() => {
    if (isAdminPage) return; // Skip data loading on admin pages
    setMounted(true);
    loadData();
  }, [isAdminPage]);

  async function loadData() {
    try {
      if (cachedCategories && cachedSettings) {
        setCategories(cachedCategories);
        setSettings(cachedSettings);
        return;
      }
      const [cats, siteSettings] = await Promise.all([
        getCategories(),
        getSiteSettings()
      ]);
      const activeCats = cats.filter(c => c.isActive);
      cachedCategories = activeCats;
      cachedSettings = siteSettings;
      setCategories(activeCats);
      setSettings(siteSettings);
    } catch (err) {
      console.error("Error loading header data:", err);
    }
  }

  // ✅ NOW it's safe to return null conditionally — all hooks already called above
  if (isAdminPage) {
    return null;
  }

  const brandName = settings?.logoText || "Anti Tarnish Jewels";

  const renderNavLinks = (isMobile: boolean) => {
    const list = [];

    list.push({ label: "All Jewellery", href: "/shop" });

    if (isMobile) {
      list.push({ label: "Earrings", href: "/shop?category=Earrings" });
      list.push({ label: "Rings", href: "/shop?category=Rings" });
      list.push({ label: "Necklaces", href: "/shop?category=Necklaces" });
      list.push({ label: "Bracelets", href: "/shop?category=Bracelets" });
      list.push({ label: "Bangles", href: "/shop?category=Bangles" });
      list.push({ label: "Anklets", href: "/shop?category=Anklets" });
      list.push({ label: "Daily Wear", href: "/shop?category=Daily Wear Jewellery" });
      list.push({ label: "Waterproof Jewellery", href: "/shop?category=Waterproof Jewellery" });
      list.push({ label: "Bridal Collection", href: "/shop?category=Bridal Sets" });
      list.push({ label: "New Arrivals", href: "/shop?newArrivals=true" });
      list.push({ label: "Best Sellers", href: "/shop?bestSellers=true" });
    } else {
      list.push({ label: "Earrings", href: "/shop?category=Earrings" });
      list.push({ label: "Rings", href: "/shop?category=Rings" });
      list.push({ label: "Necklaces", href: "/shop?category=Necklaces" });
      list.push({ label: "Bracelets", href: "/shop?category=Bracelets" });
      list.push({ label: "Daily Wear", href: "/shop?category=Daily Wear Jewellery" });
    }

    list.push({ label: "Sale", href: "/sale" });
    list.push({ label: "Track Order", href: "/track-order" });

    if (isMobile) {
      list.push({ label: "Contact", href: "/contact" });
    }

    return list.map((link) => (
      <Link
        key={link.href}
        href={link.href}
        onClick={() => setOpen(false)}
        className="hover:text-champagne transition-colors"
      >
        {link.label}
      </Link>
    ));
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-goldBeige/40 bg-ivory/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-2.5 py-3 sm:px-4 sm:py-4">
          <Link href="/" className="text-xs min-[320px]:text-sm min-[375px]:text-base sm:text-2xl font-serif font-semibold tracking-wider sm:tracking-[0.25em] text-champagne hover:text-champagne/90 transition-colors uppercase max-w-none">
            <span className="hidden sm:inline">{brandName}</span>
            <span className="inline sm:hidden">
              {brandName.length > 12 ? "AT Jewels" : brandName}
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-charcoalBrown/85 lg:flex">
            {renderNavLinks(false)}
            {isAdmin && <Link href="/admin" className="text-champagne font-semibold">Admin</Link>}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link href="/shop" aria-label="Search" className="rounded-full border border-goldBeige/60 p-1.5 sm:p-2 hover:bg-champagne/10 text-champagne transition-colors">
              <Search className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </Link>
            <Link href="/wishlist" aria-label="Wishlist" className="relative rounded-full border border-goldBeige/60 p-2 hover:bg-champagne/10 text-champagne transition-colors hidden sm:block">
              <Heart size={18} />
              {wishlist.items.length > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-dustyRose px-1.5 text-xs text-white">{wishlist.items.length}</span>}
            </Link>
            <Link href="/cart" aria-label="Cart" className="relative rounded-full border border-goldBeige/60 p-1.5 sm:p-2 hover:bg-champagne/10 text-champagne transition-colors">
              <ShoppingBag className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
              {items.length > 0 && (
                <span className="absolute -right-1 -top-1 rounded-full bg-champagne px-1.5 text-[10px] sm:text-xs text-charcoalBrown font-semibold leading-none py-0.5">
                  {items.length}
                </span>
              )}
            </Link>
            <Link href={user ? "/account" : "/login"} aria-label="Account" className="hidden rounded-full border border-goldBeige/60 p-2 hover:bg-champagne/10 text-champagne transition-colors sm:block">
              <User size={18} />
            </Link>
            <button onClick={() => setOpen(true)} className="rounded-full border border-goldBeige/60 p-1.5 sm:p-2 text-champagne lg:hidden" aria-label="Menu">
              <Menu className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] bg-black/70">
          <aside className="ml-auto h-full w-80 max-w-[85vw] border-l border-goldBeige/40 bg-warmwhite p-6 shadow-jewel overflow-y-auto">
            <div className="flex items-center justify-between border-b border-goldBeige/20 pb-4">
              <span className="text-base min-[375px]:text-lg font-serif font-semibold tracking-wider text-champagne uppercase">{brandName === "Anti Tarnish Jewels" ? "AT Jewels" : brandName} Menu</span>
              <button onClick={() => setOpen(false)} className="text-champagne"><X /></button>
            </div>
            <div className="mt-8 flex flex-col gap-5 text-charcoalBrown/90 font-medium">
              <Link onClick={() => setOpen(false)} href="/" className="hover:text-champagne">Home</Link>
              {renderNavLinks(true)}
              <Link onClick={() => setOpen(false)} href="/wishlist" className="hover:text-champagne">Wishlist</Link>
              {isAdmin && <Link onClick={() => setOpen(false)} href="/admin" className="text-champagne">Admin Dashboard</Link>}
              {user ? (
                <button onClick={() => { logout(); setOpen(false); }} className="text-left text-dustyRose">Logout</button>
              ) : (
                <Link onClick={() => setOpen(false)} href="/login" className="hover:text-champagne">Login / Signup</Link>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
