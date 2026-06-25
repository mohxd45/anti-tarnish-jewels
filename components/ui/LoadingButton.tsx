import React from "react";
import { HeartLoader } from "./HeartLoader";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButton({ loading, loadingText = "Loading...", children, className, ...props }: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={cn("relative flex items-center justify-center transition-all", className)}
    >
      <span className={cn("flex items-center justify-center gap-2", loading ? "opacity-0" : "opacity-100")}>
        {children}
      </span>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <HeartLoader size="sm" text={loadingText} />
        </div>
      )}
    </button>
  );
}
