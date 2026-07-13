import type { ReactNode } from "react";

import { AdminBadge } from "./AdminBadge";

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase().replace(" ", "-");
  
  // Try to map known statuses to our AdminBadge variants
  const validVariants = ["active", "inactive", "pending", "processing", "shipped", "delivered", "cancelled", "low-stock", "featured", "bestseller", "paid", "cod"];
  const variant = validVariants.includes(normalized) ? (normalized as any) : "default";

  return (
    <AdminBadge variant={variant}>
      {status}
    </AdminBadge>
  );
}

export function AdminCard({ children, className = "", title, action }: { children: ReactNode; className?: string; title?: string; action?: ReactNode }) {
  return (
    <section className={`bg-adminCard shadow-sm border border-adminBorder rounded-2xl p-5 sm:p-6 ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 mb-6">
          {title && <h2 className="font-serif text-xl text-adminSidebar font-semibold">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto h-14 w-14 rounded-full bg-secondary grid place-items-center text-2xl">✨</div>
      <p className="mt-3 font-medium">{title}</p>
      {hint && <p className="text-sm text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}
