"use client";

import React, { ReactNode, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

interface DepthCardProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

// Mouse-tracking 3D tilt card for desktop only
export function DepthCard({ children, className = "", disabled = false }: DepthCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Mouse position values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for fluid movement
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  // Map mouse position (-0.5 to 0.5) to rotation degrees (-15 to 15)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  // Map mouse position to shine overlay position
  const shineX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const shineY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  if (disabled || prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    
    // Calculate relative mouse position (-0.5 to 0.5)
    const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    // Reset to center smoothly
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={ref}
      className={`perspective-1200 relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 
        We only apply the 3D transforms on medium screens and up.
        On mobile touch screens, it behaves like a standard div.
      */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="w-full h-full will-change-transform hidden md:block rounded-[inherit] overflow-hidden"
      >
        {children}
        
        {/* Soft interactive shine overlay that follows the mouse */}
        <motion.div
          style={{
            background: "radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 60%)",
            left: shineX,
            top: shineY,
            x: "-50%",
            y: "-50%",
          }}
          className="pointer-events-none absolute w-[200%] h-[200%] z-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        />
      </motion.div>
      
      {/* Mobile fallback: static render */}
      <div className="w-full h-full md:hidden">
        {children}
      </div>
    </div>
  );
}
