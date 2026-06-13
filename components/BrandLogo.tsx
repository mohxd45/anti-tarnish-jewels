import React from "react";

interface BrandLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  withBg?: boolean;
}

export function BrandLogo({ size = 64, showText = false, className = "", withBg = true }: BrandLogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Soft luxury monogram card container */}
      <div 
        className={`flex items-center justify-center rounded-[24%] transition-all duration-300 overflow-hidden ${
          withBg 
            ? "bg-[#FFF0F5] border border-[#F2C8D3]/50 shadow-[0_8px_25px_-5px_rgba(232,154,170,0.15),_0_3px_10px_-3px_rgba(58,36,40,0.03)]" 
            : "bg-transparent"
        }`}
        style={{ 
          width: size, 
          height: size,
        }}
      >
        <img
          src="/logo-pink.png"
          alt="Anti Tarnish Jewels Logo"
          className="w-full h-full object-contain select-none"
        />
      </div>
      {showText && (
        <span className="mt-3 font-serif text-[clamp(10px,2vw,13px)] font-medium tracking-[0.35em] text-[#3A2428] uppercase text-center">
          Anti Tarnish Jewels
        </span>
      )}
    </div>
  );
}
