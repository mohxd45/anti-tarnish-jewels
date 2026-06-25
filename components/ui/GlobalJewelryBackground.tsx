"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const SceneCanvas = dynamic(() => import("@/components/three/SceneCanvas"), { ssr: false });

export function GlobalJewelryBackground() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Do not render on admin routes or homepage
  if (pathname?.startsWith("/admin") || pathname === "/") {
    return null;
  }

  // Do not render global WebGL on mobile (we will use per-section MobileJewelryBackground instead)
  if (isMobile) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <SceneCanvas 
        interactiveParallax={false} 
        itemCount="medium" 
        className="w-full h-full opacity-60" 
        disableMobileFallback={true} 
      />
    </div>
  );
}
