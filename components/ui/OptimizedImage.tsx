"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

interface OptimizedImageProps extends Omit<ImageProps, "onError" | "src"> {
  src: string | null | undefined;
  fallbackSrc?: string;
}

export function OptimizedImage({ 
  src, 
  fallbackSrc = "/product-stack.jpg", 
  alt = "Image",
  ...props 
}: OptimizedImageProps) {
  const getValidSrc = (val: string | null | undefined) => {
    return (val && val.trim() !== "") ? val : fallbackSrc;
  };
  
  const [imgSrc, setImgSrc] = useState<string>(getValidSrc(src));

  useEffect(() => {
    setImgSrc(getValidSrc(src));
  }, [src, fallbackSrc]);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
