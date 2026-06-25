"use client";

import { useEffect, useState } from "react";
import { MobileJewelryBackground } from "./MobileJewelryBackground";
import { usePathname } from "next/navigation";

interface PublicJewelryBackgroundProps {
  children: React.ReactNode;
  variant?: "hero" | "section" | "subtle" | "footer" | "shop";
  intensity?: "low" | "medium" | "high";
  className?: string;
  contentClassName?: string;
}

export function PublicJewelryBackground({ 
  children, 
  variant = "section", 
  intensity = "medium",
  className = "",
  contentClassName = ""
}: PublicJewelryBackgroundProps) {
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isAdmin = pathname?.startsWith("/admin");

  // Admin pages remain clean and solid.
  if (isAdmin) {
    return <div className={className}>{children}</div>;
  }

  // Define how translucent the background should be depending on the variant/intensity
  // The global WebGL background will shine through this translucency on desktop/tablet.
  let backdropClass = "";
  if (!isMobile) {
    if (variant === "hero") backdropClass = "bg-transparent"; 
    else if (variant === "shop") backdropClass = "bg-ivory/50 backdrop-blur-md border border-[#F1CFCF]/40 shadow-[0_20px_60px_rgba(224,169,165,0.15)]";
    else if (variant === "footer") backdropClass = "bg-white/45 backdrop-blur-md border-t border-[#F1CFCF]/50 shadow-[0_-10px_40px_rgba(224,169,165,0.15)]";
    else if (variant === "subtle" || intensity === "low") backdropClass = "bg-white/45 backdrop-blur-md";
    else backdropClass = "bg-ivory/50 backdrop-blur-md border border-[#F1CFCF]/40 shadow-[0_20px_60px_rgba(224,169,165,0.15)]";
  }

  return (
    <section className={`relative overflow-hidden ${backdropClass} ${className}`}>
      {/* Mobile CSS Fallback per-section */}
      {isMobile && (
        <MobileJewelryBackground className={intensity === "low" ? "opacity-50" : ""} />
      )}
      
      {/* Content Layer */}
      <div className={`relative z-10 ${contentClassName}`}>
        {children}
      </div>
    </section>
  );
}
