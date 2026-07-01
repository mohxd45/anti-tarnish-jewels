"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, FileText, Image as ImageIcon, LayoutGrid, Package, Plus,
  FolderTree, ShoppingBag, Users, Ticket, Star, MessageSquare, Search,
  Megaphone, Settings, LogOut, Bell, Menu, Gem, ChevronRight, LineChart
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const nav: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/analytics", label: "Analytics", icon: LineChart },
  { to: "/admin/site-content", label: "Website Text", icon: FileText },
  { to: "/admin/banners", label: "Banner & Ads", icon: ImageIcon },
  { to: "/admin/homepage-sections", label: "Home Layout", icon: LayoutGrid },
  { to: "/admin/products", label: "Product Catalog", icon: Package },
  { to: "/admin/add-product", label: "Add Product", icon: Plus },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/orders", label: "Orders Tracking", icon: ShoppingBag },
  { to: "/admin/users", label: "Users & Customers", icon: Users },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/admin/seo", label: "SEO Settings", icon: Search },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { to: "/admin/settings", label: "System Settings", icon: Settings },
];

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/admin/login");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border/60">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white" style={{ background: "var(--gradient-rose, linear-gradient(135deg, #d8a7b1, #3a2428))" }}>
          <Gem className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-display text-lg leading-tight truncate">Anti Tarnish</p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Jewels Admin</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 scrollbar-thin">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              href={item.to}
              onClick={onNavigate}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-[rgba(232,154,170,0.1)] text-[#3a2428] font-medium shadow-[inset_0_0_0_1px_rgba(184,149,94,0.3)]"
                  : "text-foreground/75 hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[#b8955e]" : ""}`} />
              <span className="truncate">{item.label}</span>
              {active && <ChevronRight className="ml-auto h-3.5 w-3.5 text-[#b8955e]" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/60 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground/70 hover:bg-secondary"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}

export function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const currentNavItem = nav.find(item => item.exact ? pathname === item.to : pathname.startsWith(item.to)) || nav[0];
  const title = currentNavItem.label;

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="relative z-10 flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen border-r border-border/60 bg-[rgba(255,255,255,0.7)] backdrop-blur-xl">
          <SidebarBody />
        </aside>

        {/* Main column */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-20 border-b border-border/60 bg-[rgba(255,255,255,0.7)] backdrop-blur-xl">
            <div className="flex items-center gap-3 px-4 sm:px-6 py-3">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <SheetHeader className="sr-only"><SheetTitle>Navigation</SheetTitle></SheetHeader>
                  <SidebarBody onNavigate={() => setOpen(false)} />
                </SheetContent>
              </Sheet>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  <span>Admin</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="truncate">{title}</span>
                </div>
                <h1 className="font-display text-xl sm:text-2xl leading-tight truncate text-[#3a2428] font-bold">{title}</h1>
              </div>

              <div className="hidden md:flex items-center relative">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search…" className="pl-9 w-56 bg-card/60" />
              </div>

              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#b8955e]" />
              </Button>

              <div className="h-9 w-9 shrink-0 rounded-full grid place-items-center text-sm font-semibold text-white" style={{ background: "var(--gradient-gold, linear-gradient(135deg, #b8955e, #d8a7b1))" }}>
                AJ
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
