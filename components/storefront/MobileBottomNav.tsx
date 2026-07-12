"use client";

import Link from "next/link";
import { Home, User, LayoutGrid, Heart, ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { items: cart, openDrawer } = useCart();
  const { items: wishlist } = useWishlist();
  const { user } = useAuth();
  
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: user ? "/account" : "/login", label: user ? "Account" : "Log in", icon: User },
    { href: "/shop", label: "Collections", icon: LayoutGrid },
    { href: "/wishlist", label: "Wishlist", icon: Heart, count: wishlist.length },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#FFF9FB] border-t border-[#E8D7C8] shadow-[0_-6px_20px_rgba(58,36,40,0.08)] pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex items-center justify-around h-[72px] px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive ? "text-[#B8955E]" : "text-[#8F817B] hover:text-[#3A2428]"
              }`}
            >
              <div className="relative">
                <Icon className={`w-[22px] h-[22px] transition-transform ${isActive ? "scale-110" : "scale-100"}`} strokeWidth={isActive ? 2.5 : 2} />
                {!!item.count && (
                  <span className="absolute -top-1.5 -right-2 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-[#3A2428] px-1 text-[8px] font-bold text-white shadow-sm">
                    {item.count}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-wide ${isActive ? "font-semibold" : "font-medium"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
        
        {/* Cart Button */}
        <button
          onClick={(e) => {
            if (pathname !== "/cart") {
              e.preventDefault();
              openDrawer();
            }
          }}
          className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
            pathname === "/cart" ? "text-[#B8955E]" : "text-[#8F817B] hover:text-[#3A2428]"
          }`}
        >
          <div className="relative">
            <ShoppingBag className={`w-[22px] h-[22px] transition-transform ${pathname === "/cart" ? "scale-110" : "scale-100"}`} strokeWidth={pathname === "/cart" ? 2.5 : 2} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-gradient-to-tr from-[#B8860B] to-[#D4AF37] px-1 text-[8px] font-bold text-white shadow-sm">
                {cartCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] tracking-wide ${pathname === "/cart" ? "font-semibold" : "font-medium"}`}>
            Cart
          </span>
        </button>
      </div>
    </nav>
  );
}
