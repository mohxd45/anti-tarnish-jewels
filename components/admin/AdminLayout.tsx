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

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean; adminOnly?: boolean; devOnly?: boolean };
const nav: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/analytics", label: "Analytics", icon: LineChart, adminOnly: true },
  { to: "/admin/site-content", label: "Website Text", icon: FileText, adminOnly: true },
  { to: "/admin/banners", label: "Banner & Ads", icon: ImageIcon, adminOnly: true },
  { to: "/admin/homepage-sections", label: "Home Layout", icon: LayoutGrid, adminOnly: true },
  { to: "/admin/products", label: "Product Catalog", icon: Package },
  { to: "/admin/add-product", label: "Add Product", icon: Plus },
  { to: "/admin/categories", label: "Categories", icon: FolderTree, adminOnly: true },
  { to: "/admin/orders", label: "Orders Tracking", icon: ShoppingBag },
  { to: "/admin/users", label: "Users & Customers", icon: Users, adminOnly: true },
  { to: "/admin/staff", label: "Staff Management", icon: Users, adminOnly: true },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket, adminOnly: true },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/admin/seo", label: "SEO Settings", icon: Search, adminOnly: true },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone, adminOnly: true },
  { to: "/admin/audit-logs", label: "Activity Logs", icon: FileText, adminOnly: true },
  { to: "/admin/settings", label: "System Settings", icon: Settings, adminOnly: true },
];

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { logout, isAdmin, userRole } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/admin/login");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[color:var(--color-border)] bg-white">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white" style={{ background: "linear-gradient(135deg, var(--color-gold), var(--color-gold-deep))" }}>
          <Gem className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-serif text-lg leading-tight truncate text-[color:var(--color-espresso)] font-bold">Anti Tarnish</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-muted-text)] font-semibold">Jewels Admin</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin bg-white">
        {nav.filter(item => {
          if (item.adminOnly && !isAdmin) return false;
          if (item.devOnly && userRole !== "developer_admin") return false;
          return true;
        }).map((item) => {
          const Icon = item.icon;
          const active = item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              href={item.to}
              onClick={onNavigate}
              className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-200 ${
                active
                  ? "bg-beige text-[color:var(--color-espresso)] font-semibold shadow-sm border border-pink-100"
                  : "text-[color:var(--color-muted-text)] hover:bg-beige/50 hover:text-[color:var(--color-espresso)] border border-transparent"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[color:var(--color-gold)]" : "opacity-70 group-hover:text-[color:var(--color-gold)]"}`} />
              <span className="truncate">{item.label}</span>
              {active && <ChevronRight className="ml-auto h-3.5 w-3.5 text-[color:var(--color-gold)]" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[color:var(--color-border)] p-3 bg-white">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[color:var(--color-muted-text)] hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="font-medium">Logout</span>
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
    <div className="relative min-h-screen bg-[color:var(--color-main-bg)] text-[color:var(--color-espresso)]">
      <div className="relative z-10 flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen border-r border-[color:var(--color-border)] bg-white shadow-sm z-30">
          <SidebarBody />
        </aside>

        {/* Main column */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-20 border-b border-[color:var(--color-border)] bg-white/90 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-3 px-4 sm:px-6 py-3 h-16">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden text-[color:var(--color-espresso)] hover:bg-beige">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0 border-r border-[color:var(--color-border)]">
                  <SheetHeader className="sr-only"><SheetTitle>Navigation</SheetTitle></SheetHeader>
                  <SidebarBody onNavigate={() => setOpen(false)} />
                </SheetContent>
              </Sheet>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-muted-text)] font-semibold mb-0.5">
                  <span>Admin</span>
                  <ChevronRight className="h-3 w-3 opacity-50" />
                  <span className="truncate">{title}</span>
                </div>
                <h1 className="font-serif text-xl sm:text-2xl leading-none truncate text-[color:var(--color-espresso)] font-bold">{title}</h1>
              </div>

              <div className="hidden md:flex items-center relative">
                <Search className="absolute left-3 h-4 w-4 text-[color:var(--color-muted-text)]" />
                <Input placeholder="Search…" className="pl-9 w-64 bg-[color:var(--color-card-bg)] border-[color:var(--color-border)] focus-visible:ring-[color:var(--color-gold)] rounded-xl" />
              </div>

              <Button variant="ghost" size="icon" className="relative text-[color:var(--color-espresso)] hover:bg-beige rounded-full">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[color:var(--color-warning)]" />
              </Button>

              <div className="h-9 w-9 shrink-0 rounded-full grid place-items-center text-sm font-semibold text-white shadow-sm ml-2" style={{ background: "linear-gradient(135deg, var(--color-gold), var(--color-gold-deep))" }}>
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
