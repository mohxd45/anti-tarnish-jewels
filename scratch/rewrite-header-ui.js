const fs = require('fs');

const headerContent = `"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, User, Heart, Menu } from "lucide-react";
import MobileNav from "./MobileNav";

const NAV_LINKS = [
  { label: "All Jewellery", href: "/shop" },
  { label: "Rings", href: "/shop?category=Rings" },
  { label: "Earrings", href: "/shop?category=Earrings" },
  { label: "Necklaces", href: "/shop?category=Necklaces" },
  { label: "Bracelets", href: "/shop?category=Bracelets" },
  { label: "Daily Wear", href: "/shop?category=Daily-Wear" },
];

export function Header() {
  const { cart } = useCart();
  const { items: wishlist } = useWishlist();
  const { user } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav className={\`fixed top-8 left-0 right-0 z-50 px-4 md:px-8 py-3 transition-all duration-300 \${scrolled ? "liquid-glass shadow-sm" : "bg-transparent"}\`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-2xl text-[var(--ink)]">
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full gold-trim flex items-center justify-center">
                <span className="font-display text-white font-bold text-lg">A</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-display text-lg md:text-xl text-[var(--ink)] leading-tight font-semibold">Anti Tarnish</h1>
                <p className="text-xs text-[var(--rose)] -mt-1 font-medium tracking-wider uppercase">Jewels</p>
              </div>
            </Link>
          </div>
          
          <div className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map(link => (
              <Link key={link.label} href={link.href} className="text-sm font-medium text-[var(--ink)] hover:text-[var(--rose)] transition-colors">
                {link.label}
              </Link>
            ))}
            <Link href="/sale" className="text-sm font-semibold text-[var(--rose)] hover:text-[var(--rose-gold)] transition-colors">
              Sale
            </Link>
            <Link href="/track-order" className="text-sm font-medium text-[var(--ink)] hover:text-[var(--rose)] transition-colors">
              Track Order
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/shop" className="p-2 rounded-full hover:bg-[var(--pink-100)] transition-colors text-[var(--ink)]">
              <Search className="w-5 h-5" />
            </Link>
            <Link href="/wishlist" className="p-2 rounded-full hover:bg-[var(--pink-100)] transition-colors relative text-[var(--ink)] hidden sm:block">
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--rose)] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link href="/cart" className="p-2 rounded-full hover:bg-[var(--pink-100)] transition-colors relative text-[var(--ink)]">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold)] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link href={user ? "/account" : "/login"} className="p-2 rounded-full hover:bg-[var(--pink-100)] transition-colors text-[var(--ink)]">
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </nav>

      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
`;

const mobileNavContent = `"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { X } from "lucide-react";
import { useEffect } from "react";

const NAV_LINKS = [
  { label: "All Jewellery", href: "/shop" },
  { label: "Rings", href: "/shop?category=Rings" },
  { label: "Earrings", href: "/shop?category=Earrings" },
  { label: "Necklaces", href: "/shop?category=Necklaces" },
  { label: "Bracelets", href: "/shop?category=Bracelets" },
  { label: "Daily Wear", href: "/shop?category=Daily-Wear" },
  { label: "Sale", href: "/sale" },
  { label: "Track Order", href: "/track-order" },
  { label: "Contact", href: "/contact" },
];

export default function MobileNav({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { cart } = useCart();
  const { user } = useAuth();
  
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Close on route change automatically by just keeping the state in parent
  // We can just rely on the user clicking links to unmount or trigger state change.

  return (
    <>
      {/* Overlay */}
      <div 
        className={\`fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-300 \${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}\`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={\`fixed top-0 right-0 w-[85%] max-w-[320px] h-[100dvh] bg-gradient-to-b from-[var(--pink-50)] to-[var(--cream)] z-[110] transition-transform duration-400 ease-in-out shadow-2xl overflow-y-auto \${isOpen ? "translate-x-0" : "translate-x-full"}\`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-display text-2xl text-[var(--ink)]">Menu</h2>
            <button onClick={onClose} className="p-2 -mr-2 text-[var(--ink)]">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <nav className="space-y-2">
            {NAV_LINKS.map(link => (
              <Link 
                key={link.label} 
                href={link.href}
                onClick={onClose}
                className={\`block py-3 px-4 rounded-xl hover:bg-[var(--pink-100)] transition-colors \${link.label === "Sale" ? "text-[var(--rose)] font-semibold" : "text-[var(--ink)] font-medium"}\`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 pt-6 border-t border-[var(--pink-200)] space-y-3">
            <Link 
              href={user ? "/account" : "/login"}
              onClick={onClose}
              className="block py-3 px-4 rounded-xl bg-[var(--pink-100)] text-center font-medium text-[var(--ink)] transition-colors hover:bg-[var(--pink-200)]"
            >
              {user ? "My Account" : "Login / Signup"}
            </Link>
            <Link 
              href="/cart"
              onClick={onClose}
              className="block py-3 px-4 rounded-xl text-center font-bold text-white shadow-md"
              style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-dark))" }}
            >
              Cart ({cartCount})
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
`;

fs.writeFileSync('components/Header.tsx', headerContent);
fs.writeFileSync('components/MobileNav.tsx', mobileNavContent);
