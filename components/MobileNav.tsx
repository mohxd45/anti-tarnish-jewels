"use client";

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
  const { items: cart } = useCart();
  const { user } = useAuth();
  
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Close on route change automatically by just keeping the state in parent
  // We can just rely on the user clicking links to unmount or trigger state change.

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed top-0 right-0 w-[85%] max-w-[320px] h-[100dvh] bg-gradient-to-b from-[var(--pink-50)] to-[var(--cream)] z-[110] transition-transform duration-400 ease-in-out shadow-2xl overflow-y-auto ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
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
                className={`block py-3 px-4 rounded-xl hover:bg-[var(--pink-100)] transition-colors ${link.label === "Sale" ? "text-[var(--rose)] font-semibold" : "text-[var(--ink)] font-medium"}`}
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
