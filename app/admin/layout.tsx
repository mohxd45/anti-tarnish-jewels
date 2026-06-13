"use client";

import { Protected } from "@/components/Protected";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, FileText, Image as ImageIcon, Palette, Layers,
  ShoppingBag, PlusCircle, FolderTree, ClipboardList, Users,
  Tag, Star, Mail, Search, Megaphone, Settings, LogOut, Menu, X
} from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";

const menuItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Website Text", href: "/admin/site-content", icon: FileText },
  { label: "Banners & Ads", href: "/admin/banners", icon: ImageIcon },
  { label: "Theme Settings", href: "/admin/theme", icon: Palette },
  { label: "Homepage Layout", href: "/admin/homepage-sections", icon: Layers },
  { label: "Products Catalog", href: "/admin/products", icon: ShoppingBag },
  { label: "Add Product", href: "/admin/add-product", icon: PlusCircle },
  { label: "Categories Manager", href: "/admin/categories", icon: FolderTree },
  { label: "Orders Tracking", href: "/admin/orders", icon: ClipboardList },
  { label: "Users & Customers", href: "/admin/users", icon: Users },
  { label: "Discount Coupons", href: "/admin/coupons", icon: Tag },
  { label: "Reviews Moderation", href: "/admin/reviews", icon: Star },
  { label: "Customer Messages", href: "/admin/messages", icon: Mail },
  { label: "SEO Settings", href: "/admin/seo", icon: Search },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { label: "System Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Header Logo */}
        <div className="flex items-center gap-3 border-b border-goldBeige/40 pb-6 mb-6">
          <BrandLogo size={44} />
          <div>
            <span className="font-serif text-lg font-semibold tracking-wider text-champagne uppercase block">Anti Tarnish Jewels</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-stoneGray/75 block">Control Center</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? "bg-champagne text-charcoalBrown font-semibold shadow-jewel scale-[1.02]"
                    : "text-charcoalBrown/70 hover:text-champagne hover:bg-champagne/5"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium text-dustyRose hover:bg-dustyRose/10 hover:text-dustyRose transition-all border border-dustyRose/20 mt-6"
      >
        <LogOut size={18} />
        <span>Logout Admin</span>
      </button>
    </div>
  );

  return (
    <Protected adminOnly>
      <div className="min-h-screen bg-ivory text-charcoalBrown flex flex-col lg:flex-row">
        {/* Mobile Header Bar */}
        <header className="lg:hidden flex items-center justify-between border-b border-goldBeige/40 bg-warmwhite px-5 py-4 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <BrandLogo size={32} />
            <span className="font-serif font-semibold text-champagne tracking-widest text-sm uppercase">ATJ Admin</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-full border border-goldBeige p-2 text-champagne hover:bg-champagne/10"
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
        </header>

        {/* Desktop Persistent Left Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0 border-r border-goldBeige/40 bg-beige/65 p-6 sticky top-0 h-screen overflow-y-auto">
          {renderSidebarContent()}
        </aside>

        {/* Mobile Sidebar Navigation Drawer Overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 flex justify-start lg:hidden">
            <div className="fixed inset-0" onClick={() => setMobileOpen(false)} />
            <aside className="relative h-full w-80 max-w-[85vw] border-r border-goldBeige/40 bg-warmwhite p-6 shadow-jewel overflow-y-auto">
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-4 top-4 text-champagne p-1"
                aria-label="Close navigation"
              >
                <X size={20} />
              </button>
              {renderSidebarContent()}
            </aside>
          </div>
        )}

        {/* Main Content Workspace Panel */}
        <main className="flex-1 min-w-0 px-4 py-8 md:px-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </Protected>
  );
}
