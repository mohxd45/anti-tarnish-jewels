"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from "react";

export function TiltCard({ children, className, style, max = 18 }: { children: ReactNode; className?: string; style?: CSSProperties; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sy = useSpring(ry, { stiffness: 200, damping: 20 });
  
  const handle = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current; 
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ry.set(x * max); 
    rx.set(-y * max);
  };
  
  const reset = () => { 
    rx.set(0); 
    ry.set(0); 
  };
  
  return (
    <motion.div
      ref={ref}
      onMouseMove={handle}
      onMouseLeave={reset}
      style={{ rotateX: sx, rotateY: sy, transformPerspective: 1000, transformStyle: "preserve-3d", ...style }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
