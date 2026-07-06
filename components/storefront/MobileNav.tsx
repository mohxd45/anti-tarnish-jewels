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

export function MobileNav({ open, onClose, openDrawer }: { open: boolean; onClose: () => void; openDrawer: () => void }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[140] bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed right-0 top-0 z-[150] h-screen w-[85%] max-w-[320px] overflow-y-auto transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{ background: "#FAF9F6", boxShadow: "-10px 0 40px rgba(0,0,0,0.1)" }}
      >
        <div className="p-6">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-serif text-2xl text-stone-900">Menu</h2>
            <button onClick={onClose} className="text-stone-900" aria-label="Close menu">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="space-y-1">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={onClose}
                className={`block rounded-xl px-4 py-3 text-sm transition hover:bg-stone-50/50 ${l.sale ? "font-semibold text-stoneGray" : "text-stone-900"}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 space-y-3 border-t border-stone-200 pt-6">
            <Link href="/login" onClick={onClose} className="block rounded-xl bg-stone-50/50 py-3 text-center text-stone-900">
              Login / Signup
            </Link>
            <button
              onClick={() => {
                onClose();
                openDrawer();
              }}
              className="block w-full rounded-xl bg-charcoalBrown py-3 text-center font-semibold text-white transition hover:bg-stone-800"
            >
              View Cart
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
