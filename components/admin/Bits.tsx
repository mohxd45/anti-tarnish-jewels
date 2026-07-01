import type { ReactNode } from "react";

const tones: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800 ring-amber-200",
  Processing: "bg-sky-100 text-sky-800 ring-sky-200",
  Shipped: "bg-indigo-100 text-indigo-800 ring-indigo-200",
  Delivered: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  Cancelled: "bg-rose-100 text-rose-800 ring-rose-200",
  Active: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  Inactive: "bg-stone-200 text-stone-700 ring-stone-300",
  Unread: "bg-rose-100 text-rose-800 ring-rose-200",
  Read: "bg-stone-100 text-stone-700 ring-stone-200",
  Replied: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  Approved: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  Rejected: "bg-rose-100 text-rose-800 ring-rose-200",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = tones[status] ?? "bg-stone-100 text-stone-700 ring-stone-200";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${cls}`}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

export function AdminCard({ children, className = "", title, action }: { children: ReactNode; className?: string; title?: string; action?: ReactNode }) {
  return (
    <section className={`glass-card p-5 ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 mb-4">
          {title && <h2 className="font-display text-lg">{title}</h2>}
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
