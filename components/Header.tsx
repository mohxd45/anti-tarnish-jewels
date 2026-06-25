"use client";

import Link from "next/link";
import { Gem, Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "All Jewellery", href: "/shop" },
  { label: "Rings", href: "/shop?category=Rings" },
  { label: "Earrings", href: "/shop?category=Earrings" },
  { label: "Necklaces", href: "/shop?category=Necklaces" },
  { label: "Bracelets", href: "/shop?category=Bracelets" },
  { label: "Daily Wear", href: "/shop?category=Daily Wear Jewellery" },
  { label: "Sale", href: "/sale" },
  { label: "Track Order", href: "/track-order" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { items } = useCart();
  const wishlist = useWishlist();
  const { user, isAdmin, logout } = useAuth();

  const isAdminPage = pathname?.startsWith("/admin");

  useEffect(() => {
    setMounted(true);
    const f = () => setScrolled(window.scrollY > 30);
    f(); 
    window.addEventListener("scroll", f); 
    return () => window.removeEventListener("scroll", f);
  }, []);

  // Use body lock for search/drawer, but check if we're not on mobile nav overlap
  useEffect(() => { 
    if (open || searchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [open, searchOpen]);

  if (isAdminPage) {
    return null; // Keep admin clean
  }

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "py-2" : "py-4"}`}>
      <div className={`mx-auto max-w-7xl px-4 sm:px-6`}>
        <div className={`flex items-center justify-between gap-3 ${scrolled ? "glass rounded-full px-4 py-2.5" : "px-2 py-2"}`}>
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full" style={{ background: "var(--gradient-gold)" }}>
              <Gem className="h-4 w-4 text-white" />
            </span>
            <span className="hidden truncate font-display text-xl font-semibold tracking-wide text-ink sm:block">Anti Tarnish</span>
          </Link>

          <nav className="hidden items-center gap-6 text-[13px] text-ink/75 xl:flex">
            {NAV_LINKS.map(l => {
              const isActive = pathname === l.href.split('?')[0] && !l.href.includes('?');
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative whitespace-nowrap transition-colors hover:text-ink after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-[var(--rose-gold)] after:transition-all hover:after:w-full ${isActive ? "text-[var(--rose-gold)]" : ""}`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <button aria-label="Search" onClick={() => setSearchOpen(true)} className="grid h-10 w-10 place-items-center rounded-full glass text-ink/80 transition hover:text-[var(--rose-gold)]">
              <Search className="h-4 w-4" />
            </button>
            <Link href="/wishlist" aria-label="Wishlist" className="hidden relative h-10 w-10 place-items-center rounded-full glass text-ink/80 transition hover:text-[var(--rose-gold)] sm:grid">
              <Heart className="h-4 w-4" />
              {mounted && wishlist.items.length > 0 && (
                <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full text-[10px] font-semibold text-white" style={{ background: "var(--gradient-gold)" }}>{wishlist.items.length}</span>
              )}
            </Link>
            <Link href="/cart" aria-label="Cart" className="relative grid h-10 w-10 place-items-center rounded-full glass text-ink/80 transition hover:text-[var(--rose-gold)]">
              <ShoppingBag className="h-4 w-4" />
              {mounted && items.length > 0 && (
                <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full text-[10px] font-semibold text-white" style={{ background: "var(--gradient-gold)" }}>{items.length}</span>
              )}
            </Link>
            
            <div className="relative group hidden sm:block">
              <Link href={user ? "/account" : "/login"} aria-label="Profile" className="grid h-10 w-10 place-items-center rounded-full glass text-ink/80 transition hover:text-[var(--rose-gold)]">
                <User className="h-4 w-4" />
              </Link>
              {/* Profile Dropdown */}
              <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right">
                <div className="glass rounded-2xl p-2 w-48 shadow-[var(--shadow-soft)] flex flex-col gap-1">
                  {user ? (
                    <>
                      <Link href="/account" className="px-4 py-2 text-sm text-ink/80 hover:bg-white/40 hover:text-[var(--rose-gold)] rounded-xl transition-colors">My Profile</Link>
                      <Link href="/orders" className="px-4 py-2 text-sm text-ink/80 hover:bg-white/40 hover:text-[var(--rose-gold)] rounded-xl transition-colors">My Orders</Link>
                      {isAdmin && (
                        <Link href="/admin" className="px-4 py-2 text-sm font-semibold text-[var(--gold)] hover:bg-white/40 rounded-xl transition-colors">Admin Dashboard</Link>
                      )}
                      <button onClick={logout} className="px-4 py-2 text-left text-sm text-red-500/80 hover:bg-white/40 hover:text-red-500 rounded-xl transition-colors">Logout</button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="px-4 py-2 text-sm text-ink/80 hover:bg-white/40 hover:text-[var(--rose-gold)] rounded-xl transition-colors">Login</Link>
                      <Link href="/signup" className="px-4 py-2 text-sm text-ink/80 hover:bg-white/40 hover:text-[var(--rose-gold)] rounded-xl transition-colors">Sign Up</Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button aria-label="Menu" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-full glass text-ink/80 xl:hidden">
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[60] xl:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" />
          <div onClick={e => e.stopPropagation()} className="absolute right-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto p-6"
            style={{ background: "var(--gradient-deep)" }}>
            <div className="flex items-center justify-between">
              <span className="font-display text-xl text-white">Menu</span>
              <button aria-label="Close" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full glass text-white/80 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-1">
              {NAV_LINKS.map(l => {
                const isActive = pathname === l.href.split('?')[0] && !l.href.includes('?');
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-2xl px-4 py-3.5 font-display text-2xl transition ${isActive ? "text-[var(--rose-gold)] bg-white/10" : "text-white/85 hover:bg-white/10"}`}
                  >
                    {l.label}
                  </Link>
                );
              })}
              {isAdmin && (
                <Link href="/admin" onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3.5 font-display text-2xl text-[var(--gold)] hover:bg-white/10 transition mt-4">
                  Admin Dashboard
                </Link>
              )}
            </nav>
            <div className="mt-8 grid grid-cols-2 gap-2 mb-24">
              <Link href="/wishlist" onClick={() => setOpen(false)} className="flex flex-col items-center gap-1 rounded-2xl glass py-3 text-xs text-white/75 hover:text-white transition-colors"><Heart className="h-4 w-4" /> Wishlist</Link>
              {user ? (
                <button onClick={() => { logout(); setOpen(false); }} className="flex flex-col items-center gap-1 rounded-2xl glass py-3 text-xs text-red-300 hover:text-red-400 transition-colors"><User className="h-4 w-4" /> Logout</button>
              ) : (
                <Link href="/login" onClick={() => setOpen(false)} className="flex flex-col items-center gap-1 rounded-2xl glass py-3 text-xs text-white/75 hover:text-white transition-colors"><User className="h-4 w-4" /> Login</Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60]" onClick={() => setSearchOpen(false)}>
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-md" />
          <div onClick={e => e.stopPropagation()} className="absolute inset-x-0 top-0 p-6">
            <div className="mx-auto max-w-2xl glass rounded-3xl p-2">
              <div className="flex items-center gap-3 px-4 py-2">
                <Search className="h-5 w-5 text-ink/60" />
                <input autoFocus placeholder="Search rings, pearls, gold…" className="flex-1 bg-transparent py-3 text-base text-ink placeholder:text-ink/40 focus:outline-none" />
                <button onClick={() => setSearchOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-white/40"><X className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
