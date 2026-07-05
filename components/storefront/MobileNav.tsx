import Link from "next/link";
import { X } from "lucide-react";
import { useEffect } from "react";

const links = [
  { href: "/shop", label: "All Jewellery" },
  { href: "/shop?category=Rings", label: "Rings" },
  { href: "/shop?category=Earrings", label: "Earrings" },
  { href: "/shop?category=Necklaces", label: "Necklaces" },
  { href: "/shop?category=Bracelets", label: "Bracelets" },
  { href: "/shop?category=Daily-Wear", label: "Daily Wear" },
  { href: "/sale", label: "Sale", sale: true },
  { href: "/track-order", label: "Track Order" },
  { href: "/contact", label: "Contact" },
];

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[140] bg-pink-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed right-0 top-0 z-[150] h-screen w-[85%] max-w-[320px] overflow-y-auto transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{ background: "linear-gradient(180deg, #FDF2F8 0%, #FAF0E6 100%)", boxShadow: "-10px 0 40px rgba(0,0,0,0.1)" }}
      >
        <div className="p-6">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-serif text-2xl text-charcoalBrown">Menu</h2>
            <button onClick={onClose} className="text-charcoalBrown" aria-label="Close menu">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="space-y-1">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={onClose}
                className={`block rounded-xl px-4 py-3 text-sm transition hover:bg-beige/50 ${l.sale ? "font-semibold text-stoneGray" : "text-charcoalBrown"}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 space-y-3 border-t border-goldBeige pt-6">
            <Link href="/login" onClick={onClose} className="block rounded-xl bg-beige/50 py-3 text-center text-charcoalBrown">
              Login / Signup
            </Link>
            <Link
              href="/cart"
              onClick={onClose}
              className="block rounded-xl py-3 text-center font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #D4AF37, #B8860B)" }}
            >
              View Cart
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
