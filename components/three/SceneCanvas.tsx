"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { LuxuryJewelryScene } from "./LuxuryJewelryScene";
import { MobileJewelryBackground } from "../ui/MobileJewelryBackground";

interface SceneCanvasProps {
  interactiveParallax?: boolean;
  itemCount?: "light" | "medium" | "heavy";
  className?: string;
  disableMobileFallback?: boolean;
}

type DeviceMode = "desktop" | "tablet" | "mobile" | "reduced-motion" | null;

export default function SceneCanvas({ interactiveParallax = true, itemCount = "medium", className = "", disableMobileFallback = false }: SceneCanvasProps) {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>(null);

  useEffect(() => {
    const handleResize = () => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) {
        setDeviceMode("reduced-motion");
        return;
      }

      const width = window.innerWidth;
      
      // Strict configuration map based on device width
      if (width < 768) {
        setDeviceMode("mobile");
      } else if (width >= 768 && width <= 1024) {
        setDeviceMode("tablet");
      } else {
        setDeviceMode("desktop");
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!deviceMode) return null;

  if (deviceMode === "reduced-motion" || deviceMode === "mobile") {
    if (disableMobileFallback) return null;
    // Mobile phones and Android WebViews get pure CSS/SVG to save battery and avoid WebGL lag/crashes.
    return <MobileJewelryBackground className={className} />;
  }

  // WebGL configuration for Desktop and Tablet
  const isTablet = deviceMode === "tablet";
  const finalDpr: [number, number] = isTablet ? [1, 1.25] : [1, 1.5];
  const finalParallax = isTablet ? false : interactiveParallax; // Disable parallax on tablet for smoothness
  
  // Automatically step down the item count for tablets
  let finalItemCount = itemCount;
  if (isTablet) {
    if (itemCount === "heavy") finalItemCount = "medium";
    if (itemCount === "medium") finalItemCount = "light";
  }

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <Canvas
        shadows
        dpr={finalDpr}
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <LuxuryJewelryScene interactiveParallax={finalParallax} itemCount={finalItemCount} />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
