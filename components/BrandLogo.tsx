import Link from "next/link";
import { Gem } from "lucide-react";

export function BrandLogo({ className = "", isWhite = false, size = 36 }: { className?: string; isWhite?: boolean; size?: number }) {
  return (
    <Link href="/" className={`flex items-center gap-2 min-w-0 ${className}`}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full" style={{ background: "var(--gradient-gold)" }}>
        <Gem className="h-4 w-4 text-white" />
      </span>
      <span className={`truncate font-display text-xl font-semibold tracking-wide ${isWhite ? "text-white" : "text-ink"}`}>
        Anti Tarnish
      </span>
    </Link>
  );
}
