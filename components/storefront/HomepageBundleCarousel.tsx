"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Local configuration for bundle promotional slides
const CAROUSEL_SLIDES = [
  {
    id: "slide-1",
    image: "/product-stack.jpg",
    alt: "Curated Jewellery Bundles - Mix & Match",
    href: "/bundles",
    heading: "CURATED BUNDLES",
    subheading: "Mix, match, and save on your favorite pieces.",
    cta: "Shop Bundles",
  },
  {
    id: "slide-2",
    image: "/product-ring.jpg",
    alt: "Ring Stacks - Buy Together and Save",
    href: "/bundles",
    heading: "RING STACKS",
    subheading: "Create the perfect stack with our bundle offers.",
    cta: "Explore Now",
  },
  {
    id: "slide-3",
    image: "/product-earrings.jpg",
    alt: "Earring Sets - Perfect Pairings",
    href: "/bundles",
    heading: "EARRING SETS",
    subheading: "Complete your look with matching sets.",
    cta: "View Sets",
  }
];

export function HomepageBundleCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" }, [
    Autoplay({ delay: 5000, stopOnInteraction: true }),
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on("reInit", onInit);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onInit, onSelect]);

  return (
    <section className="relative w-full overflow-hidden bg-[#FFF9FB] py-4 md:py-8">
      <div className="mx-auto w-full max-w-7xl relative group px-4 md:px-8">
        <div className="overflow-hidden rounded-2xl relative shadow-sm" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {CAROUSEL_SLIDES.map((slide, index) => (
              <div
                key={slide.id}
                className="relative flex-[0_0_100%] min-w-0"
              >
                <Link href={slide.href} className="block relative w-full h-[300px] md:h-[400px] lg:h-[450px] overflow-hidden group/slide">
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    priority={index === 0}
                    className="object-cover object-center transition-transform duration-1000 group-hover/slide:scale-105"
                    sizes="(max-width: 768px) 100vw, 1280px"
                  />
                  {/* Overlay for text readability */}
                  <div className="absolute inset-0 bg-black/30 transition-colors duration-500 group-hover/slide:bg-black/40" />
                  
                  {/* Content Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 md:p-12 z-10">
                    <p className="text-white/90 text-xs md:text-sm uppercase tracking-widest font-semibold mb-2 drop-shadow-sm">
                      {slide.subheading}
                    </p>
                    <h2 className="text-white font-serif text-3xl md:text-5xl lg:text-6xl mb-6 leading-tight drop-shadow-md">
                      {slide.heading}
                    </h2>
                    <span className="inline-block bg-white text-charcoalBrown px-6 py-3 text-xs md:text-sm font-semibold tracking-wide uppercase hover:bg-adminGold hover:text-white transition-colors rounded-sm shadow-sm">
                      {slide.cta}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Navigation Arrows (Hidden on very small screens, visible on hover/always on larger) */}
          <button
            onClick={(e) => { e.preventDefault(); scrollPrev(); }}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-white/70 text-charcoalBrown backdrop-blur-sm shadow-sm transition-all hover:bg-white md:opacity-0 md:group-hover:opacity-100 z-20 focus:outline-none focus:ring-2 focus:ring-[#B8955E]"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); scrollNext(); }}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-white/70 text-charcoalBrown backdrop-blur-sm shadow-sm transition-all hover:bg-white md:opacity-0 md:group-hover:opacity-100 z-20 focus:outline-none focus:ring-2 focus:ring-[#B8955E]"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          {/* Pagination Dots */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.preventDefault(); scrollTo(index); }}
                className={`h-2 transition-all rounded-full ${
                  index === selectedIndex
                    ? "w-6 bg-white shadow-sm"
                    : "w-2 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === selectedIndex ? "true" : "false"}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
