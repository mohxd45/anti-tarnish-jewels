"use client";

import { Protected } from "@/components/Protected";
import { AdminLayout as LayoutComponent } from "@/components/admin/AdminLayout";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-adminBg text-adminSidebar flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 bg-[var(--gradient-spotlight)] pointer-events-none opacity-50" />
        {children}
      </div>
    );
  }

  const staffRestrictedPaths = [
    "/admin/analytics",
    "/admin/site-content",
    "/admin/banners",
    "/admin/homepage-sections",
    "/admin/categories",
    "/admin/users",
    "/admin/staff",
    "/admin/coupons",
    "/admin/seo",
    "/admin/announcements",
    "/admin/settings"
  ];
  
  const isRestrictedForStaff = staffRestrictedPaths.some(p => pathname.startsWith(p));
  const roles = isRestrictedForStaff ? ["owner_admin", "partner_admin", "developer_admin"] : undefined;

  return (
    <Protected allowedRoles={roles as any} adminOnly={!roles}>
      <LayoutComponent>
        {children}
      </LayoutComponent>
    </Protected>
  );
}
