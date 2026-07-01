"use client";

import { Protected } from "@/components/Protected";
import { AdminLayout as LayoutComponent } from "@/components/admin/AdminLayout";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 bg-[var(--gradient-spotlight)] pointer-events-none" />
        {children}
      </div>
    );
  }

  return (
    <Protected adminOnly>
      <LayoutComponent>
        {children}
      </LayoutComponent>
    </Protected>
  );
}
