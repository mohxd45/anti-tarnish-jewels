"use client";

import Link from "next/link";
import { Heart, Home, Menu, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

import { usePathname } from "next/navigation";

export function MobileNav() {
  const pathname = usePathname();
  const { items } = useCart();
  const { items: wish } = useWishlist();

  // Hide mobile bottom nav on product detail pages, checkout/auth flows, and admin
  const isDetail = pathname.startsWith("/product/");
  const isCheckout = pathname.startsWith("/checkout");
  const isAuth = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isSuccess = pathname.startsWith("/order-success");
  const isAdmin = pathname.startsWith("/admin");

  if (isDetail || isCheckout || isAuth || isSuccess || isAdmin) {
    return null;
  }

  const nav = [
    { href: "/", label: "Home", icon: Home },
    { href: "/shop", label: "Menu", icon: Menu },
    { href: "/cart", label: "Cart", icon: ShoppingBag, count: items.length },
    { href: "/wishlist", label: "Wishlist", icon: Heart, count: wish.length },
    { href: "/account", label: "Account", icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-goldBeige/50 bg-warmwhite/95 px-2 py-2 backdrop-blur-xl lg:hidden shadow-[0_-4px_20px_rgba(47,42,38,0.06)]">
      <div className="grid grid-cols-5">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-1 text-[10px] font-medium transition-colors min-h-[48px] py-2 ${
                isActive ? "text-champagne" : "text-stoneGray hover:text-champagne"
              }`}
            >
              <Icon size={18} className={isActive ? "text-champagne" : "text-stoneGray"} />
              <span>{item.label}</span>
              {!!item.count && <span className="absolute right-4 top-0 rounded-full bg-champagne px-1.5 text-[9px] text-charcoalBrown font-bold leading-tight">{item.count}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
