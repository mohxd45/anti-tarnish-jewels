import Link from "next/link";
import { X, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export function MobileNav({ open, onClose, openDrawer }: { open: boolean; onClose: () => void; openDrawer: () => void }) {
  const { user } = useAuth();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const shopLinks = [
    { href: "/shop", label: "All Jewellery" },
    { href: "/shop?category=rings", label: "Rings" },
    { href: "/shop?category=earrings", label: "Earrings" },
    { href: "/shop?category=necklaces", label: "Necklaces" },
    { href: "/shop?category=bracelets", label: "Bracelets" },
    { href: "/shop?category=bangles", label: "Bangles" },
    { href: "/shop?category=hair-accessories", label: "Hair Accessories" },
    { href: "/shop?category=gift-sets", label: "Gift Sets" },
    { href: "/bundles", label: "Bundles & Combos" },
    { href: "/shop?category=sale", label: "Sale", highlight: true },
  ];

  const helpLinks = [
    { href: "/track-order", label: "Track Order" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
    { href: "/return-policy", label: "Return Policy" },
  ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[140] bg-[#3A2428]/20 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed right-0 top-0 z-[150] h-screen w-[85%] max-w-[340px] overflow-y-auto transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{ background: "#FFF9FB", boxShadow: "-10px 0 40px rgba(58,36,40,0.15)" }}
      >
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-medium text-[#3A2428]">Menu</h2>
            <button onClick={onClose} className="rounded-full p-2 text-[#3A2428] hover:bg-[#E8D7C8]/30" aria-label="Close menu">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6 pb-20">
            {/* Shop Section */}
            <div className="overflow-hidden rounded-2xl bg-white p-4 shadow-[0_4px_20px_rgba(58,36,40,0.03)] ring-1 ring-[#E8D7C8]/50">
              <h3 className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-[#B8955E]">Shop</h3>
              <nav className="flex flex-col space-y-1">
                {shopLinks.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    onClick={onClose}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-[#FFF9FB] ${
                      l.highlight ? "font-semibold text-[#B8955E]" : "font-medium text-[#3A2428]"
                    }`}
                  >
                    {l.label}
                    <ChevronRight className="h-4 w-4 text-[#8F817B]/50" />
                  </Link>
                ))}
              </nav>
            </div>

            {/* Help Section */}
            <div className="overflow-hidden rounded-2xl bg-white p-4 shadow-[0_4px_20px_rgba(58,36,40,0.03)] ring-1 ring-[#E8D7C8]/50">
              <h3 className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-[#B8955E]">Help</h3>
              <nav className="flex flex-col space-y-1">
                {helpLinks.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    onClick={onClose}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-[#3A2428] transition-colors hover:bg-[#FFF9FB]"
                  >
                    {l.label}
                    <ChevronRight className="h-4 w-4 text-[#8F817B]/50" />
                  </Link>
                ))}
              </nav>
            </div>

            {/* Account Section */}
            <div className="overflow-hidden rounded-2xl bg-white p-4 shadow-[0_4px_20px_rgba(58,36,40,0.03)] ring-1 ring-[#E8D7C8]/50">
              <h3 className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-[#B8955E]">Account</h3>
              <nav className="flex flex-col space-y-1">
                <Link
                  href={user ? "/account" : "/login"}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-[#3A2428] transition-colors hover:bg-[#FFF9FB]"
                >
                  {user ? "My Account" : "Login / Signup"}
                  <ChevronRight className="h-4 w-4 text-[#8F817B]/50" />
                </Link>
                <Link
                  href="/wishlist"
                  onClick={onClose}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-[#3A2428] transition-colors hover:bg-[#FFF9FB]"
                >
                  Wishlist
                  <ChevronRight className="h-4 w-4 text-[#8F817B]/50" />
                </Link>
                <button
                  onClick={() => {
                    onClose();
                    openDrawer();
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#3A2428] transition-colors hover:bg-[#FFF9FB]"
                >
                  Cart
                  <ChevronRight className="h-4 w-4 text-[#8F817B]/50" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
