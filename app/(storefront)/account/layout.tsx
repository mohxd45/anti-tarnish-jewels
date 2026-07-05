"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { User as UserIcon, Package, Heart, Settings, LogOut } from "lucide-react";
import { PageLoader } from "@/components/ui/PageLoader";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname, mounted]);

  if (!mounted || loading) {
    return <PageLoader text="Loading secure area..." />;
  }

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const navItems = [
    { name: "Dashboard", href: "/account", icon: UserIcon },
    { name: "My Profile", href: "/account/profile", icon: Settings },
    { name: "My Orders", href: "/account/orders", icon: Package },
    { name: "Wishlist", href: "/wishlist", icon: Heart },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <div className="glass bg-white/80 shadow-jewel border border-goldBeige p-6 rounded-[2rem] text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-champagne/20 border border-champagne text-champagne">
              <span className="font-serif text-3xl font-bold">
                {profile?.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <h2 className="font-serif text-xl font-semibold text-charcoalBrown truncate">
              {profile?.name || user?.email?.split('@')[0]}
            </h2>
            <p className="text-xs text-stoneGray mb-6 truncate">{user?.email}</p>
            
            <nav className="space-y-2 text-left">
              {navItems.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.name}
                    href={item.href} 
                    className={`flex items-center gap-3 w-full p-3 rounded-2xl transition-all font-medium text-sm ${
                      isActive 
                        ? "bg-champagne text-charcoalBrown shadow-sm" 
                        : "hover:bg-champagne/10 text-stoneGray hover:text-charcoalBrown"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? "text-charcoalBrown" : "text-champagne"}`} />
                    {item.name}
                  </Link>
                );
              })}
              
              <button 
                onClick={handleLogout}
                className="mt-4 flex items-center gap-3 w-full p-3 rounded-2xl hover:bg-dustyRose/10 hover:text-dustyRose transition-colors text-stoneGray font-medium text-sm"
              >
                <LogOut className="h-5 w-5 text-dustyRose" />
                Sign Out
              </button>
            </nav>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-3">
          {children}
        </div>
      </div>
    </div>
  );
}
