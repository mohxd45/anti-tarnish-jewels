"use client";

import Link from "next/link";
import { Heart, Search, ShoppingBag, User, Menu, Shield } from "lucide-react";
import { useState } from "react";
import { MobileNav } from "./MobileNav";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { SearchModal } from "./SearchModal";
import { CartDrawer } from "./CartDrawer";

export function Navbar({ settings }: { settings?: any }) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { items: cart, openDrawer } = useCart();
  const { items: wishlist } = useWishlist();
  const { user, isAdmin } = useAuth();
  
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  
  const brandName = "LONA JEWELS";
  const logoText = settings?.logoText || "L";
  const subtitle = settings?.subtitle || "Jewels";

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md border-b border-stone-100 shadow-sm fixed left-0 right-0 top-0 z-50 px-4 py-3 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 relative">
          <div className="flex min-w-0 items-center gap-3 relative z-10">
            <Link href="/" className="flex min-w-0 items-center gap-2">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-transparent overflow-hidden relative">
                <Image src="/lona-monogram.jpg" alt="LONA JEWELS" fill sizes="48px" className="object-contain" priority />
              </div>
              <div className="hidden min-w-0 sm:block">
                <h1 className="truncate font-serif text-lg leading-tight text-stone-900 md:text-xl">{brandName}</h1>
                {subtitle && <p className="-mt-1 text-xs text-stoneGray">{subtitle}</p>}
              </div>
            </Link>
          </div>

          {/* Centered Mobile Wordmark */}
          <div className="absolute left-16 right-16 top-0 bottom-0 flex items-center justify-center pointer-events-none z-0 sm:hidden">
             <Link href="/" className="pointer-events-auto flex flex-col items-center justify-center mt-0.5 max-w-full px-1">
                <h1 className="font-serif text-[14px] xs:text-[15px] leading-tight text-[#3A2428] tracking-[0.05em] font-bold truncate">{brandName}</h1>
             </Link>
          </div>



          <div className="flex items-center gap-1">
            <button
              className="rounded-full p-2 text-stone-900 transition hover:bg-stone-50/50/60"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </button>
            <Link href="/wishlist" className="hidden lg:flex relative rounded-full p-2 text-stone-900 transition hover:bg-stone-50/50/60" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-stone-500 px-1 text-[10px] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <button onClick={openDrawer} className="hidden lg:flex relative rounded-full p-2 text-stone-900 transition hover:bg-stone-50/50/60" aria-label="Cart">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span
                  className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #D4AF37, #B8860B)" }}
                >
                  {cartCount}
                </span>
              )}
            </button>
            <Link href={user ? "/account" : "/login"} className="hidden lg:flex rounded-full p-2 text-stone-900 transition hover:bg-stone-50/50/60" aria-label="Profile">
              <User className="h-5 w-5" />
            </Link>
            {isAdmin && (
              <Link href="/admin" className="rounded-full p-2 text-[color:var(--color-gold)] transition hover:bg-stone-50/50/60" aria-label="Admin Dashboard">
                <Shield className="h-5 w-5" />
              </Link>
            )}
            <button
              onClick={() => setOpen(true)}
              className="text-stone-900 lg:hidden rounded-full p-2 transition hover:bg-stone-50/50/60"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Desktop Category Nav (Pill Style) */}
        <div className="hidden lg:flex max-w-5xl mx-auto px-8 pb-3 items-center justify-center gap-3 xl:gap-5 border-t border-stone-100 pt-3 overflow-x-auto scrollbar-hide">
          <NavItemPill href="/shop" label="All Jewellery" />
          <NavItemPill href="/shop?category=rings" label="Rings" />
          <NavItemPill href="/shop?category=earrings" label="Earrings" />
          <NavItemPill href="/shop?category=necklaces" label="Necklaces" />
          <NavItemPill href="/shop?category=bracelets" label="Bracelets" />
          <NavItemPill href="/bundles" label="Bundles" />
          <NavItemPill href="/shop?category=sale" label="Sale" />
          <NavItemPill href="/track-order" label="Track Order" />
        </div>
      </nav>

      <MobileNav open={open} onClose={() => setOpen(false)} openDrawer={openDrawer} />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer />
    </>
  );
}

function NavItemPill({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-4 py-1.5 rounded-full text-[13px] font-medium tracking-wide border border-stone-200 text-stone-700 hover:border-[#B8955E] hover:text-[#B8955E] hover:bg-[#FFF9FB] transition-all whitespace-nowrap"
    >
      {label}
    </Link>
  );
}

function IconBtn({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      className="rounded-full p-2 text-stone-900 transition hover:bg-stone-50/50/60"
      aria-label={label}
    >
      {children}
    </button>
  );
}
