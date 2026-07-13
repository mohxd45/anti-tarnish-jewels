import type { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  trend,
  icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  trend?: { dir: "up" | "down"; value: string };
  icon?: ReactNode;
  tone?: "default" | "gold" | "rose" | "warn";
}) {
  const toneBg =
    tone === "gold"
      ? "linear-gradient(135deg, var(--admin-gold), #A98245)"
      : tone === "rose"
      ? "linear-gradient(135deg, var(--admin-rose), #B8955E)"
      : tone === "warn"
      ? "linear-gradient(135deg, #D6A84F, #B8955E)"
      : "linear-gradient(135deg, var(--admin-sidebar), #3A2428)";

  return (
    <div className="bg-adminCard border border-adminBorder rounded-2xl p-5 flex flex-col gap-3 min-w-0 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.14em] text-adminMuted font-medium">
          {label}
        </p>
        {icon && (
          <div
            className="h-9 w-9 shrink-0 grid place-items-center rounded-lg text-white shadow-sm"
            style={{ background: toneBg }}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="metric-number text-adminSidebar font-serif text-3xl truncate" title={String(value)}>{value}</div>
      </div>

      <div className="flex items-center justify-between gap-2 text-xs">
        {hint && <span className="text-adminMuted truncate">{hint}</span>}
        {trend && (
          <span
            className={`inline-flex items-center gap-1 font-medium shrink-0 ${
              trend.dir === "up" ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {trend.dir === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
