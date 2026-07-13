"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AdminBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: "active" | "inactive" | "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "low-stock" | "featured" | "bestseller" | "paid" | "cod" | "default";
}

export function AdminBadge({ children, variant = "default", className, ...props }: AdminBadgeProps) {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors";
  
  const variants = {
    "active": "bg-[#4F8F73]/15 text-[#4F8F73]", // Soft Emerald
    "inactive": "bg-stone-200 text-stone-600",
    "pending": "bg-[#D6A84F]/15 text-[#D6A84F]", // Warm Amber
    "processing": "bg-blue-500/15 text-blue-700",
    "shipped": "bg-indigo-500/15 text-indigo-700",
    "delivered": "bg-[#4F8F73]/15 text-[#4F8F73]",
    "cancelled": "bg-red-500/15 text-red-700",
    "low-stock": "bg-adminRose/20 text-[#B84A54]", // Rose gold tinted red
    "featured": "bg-adminGold/15 text-adminGold",
    "bestseller": "bg-adminGold/20 text-adminGold",
    "paid": "bg-[#4F8F73]/15 text-[#4F8F73]",
    "cod": "bg-[#D6A84F]/15 text-[#D6A84F]",
    "default": "bg-adminBorder/30 text-adminMuted",
  };

  return (
    <span 
      className={cn(baseStyles, variants[variant], className)} 
      {...props}
    >
      {children}
    </span>
  );
}
