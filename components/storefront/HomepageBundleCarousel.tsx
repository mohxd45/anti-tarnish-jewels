"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getBanners } from "@/lib/firestore";
import { Banner } from "@/types";

export function HomepageBundleCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const allBanners = await getBanners(true);
        const activeBanners = allBanners
          .filter(b => b.placement === "homepage-banner" && !!b.imageUrl)
          .filter(b => typeof b.isActive === "boolean" ? b.isActive : b.active !== false)
          .sort((a, b) => {
            const orderA = typeof a.priority === "number" ? a.priority : (a.order ?? 0);
            const orderB = typeof b.priority === "number" ? b.priority : (b.order ?? 0);
            return orderA - orderB;
          })
          .slice(0, 3);
        setBanners(activeBanners);
      } catch (err) {
        console.error("Error loading homepage banners:", err);
      } finally {
        setLoading(false);
      }
    };
    loadBanners();
  }, []);

  if (loading) {
    return null;
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full overflow-hidden bg-[#FFF9FB] py-4 md:py-8">
      <div className="mx-auto w-full max-w-7xl relative group px-4 md:px-8">
        <div className="overflow-hidden rounded-2xl relative shadow-sm" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {banners.map((slide, index) => {
              const href = slide.linkUrl || slide.link;
              const mobileImageUrl = slide.mobileImageUrl || slide.imageUrl;
              const hasHref = !!href;
              const ctaText = slide.ctaText || slide.buttonText || "Shop Now";

              const innerContent = (
                <>
                  {/* Desktop Image */}
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title || "Promotional Banner"}
                    fill
                    priority={index === 0}
                    className="hidden md:block object-cover object-center transition-transform duration-1000 group-hover/slide:scale-105"
                    sizes="(max-width: 768px) 100vw, 1280px"
                  />
                  {/* Mobile Image */}
                  <Image
                    src={mobileImageUrl}
                    alt={slide.title || "Promotional Banner"}
                    fill
                    priority={index === 0}
                    className="block md:hidden object-cover object-center transition-transform duration-1000 group-hover/slide:scale-105"
                    sizes="(max-width: 768px) 100vw, 1280px"
                  />
                  {/* Overlay for text readability */}
                  <div className="absolute inset-0 bg-black/30 transition-colors duration-500 group-hover/slide:bg-black/40" />
                  
                  {/* Content Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 md:p-12 z-10">
                    {slide.subtitle && (
                      <p className="text-white/90 text-xs md:text-sm uppercase tracking-widest font-semibold mb-2 drop-shadow-sm">
                        {slide.subtitle}
                      </p>
                    )}
                    {slide.title && (
                      <h2 className="text-white font-serif text-3xl md:text-5xl lg:text-6xl mb-6 leading-tight drop-shadow-md">
                        {slide.title}
                      </h2>
                    )}
                    <span className="inline-block bg-white text-charcoalBrown px-6 py-3 text-xs md:text-sm font-semibold tracking-wide uppercase hover:bg-adminGold hover:text-white transition-colors rounded-sm shadow-sm">
                      {ctaText}
                    </span>
                  </div>
                </>
              );

              return (
                <div
                  key={slide.id}
                  className="relative flex-[0_0_100%] min-w-0"
                >
                  {hasHref ? (
                    <Link href={href as string} className="block relative w-full h-[300px] md:h-[400px] lg:h-[450px] overflow-hidden group/slide">
                      {innerContent}
                    </Link>
                  ) : (
                    <div className="block relative w-full h-[300px] md:h-[400px] lg:h-[450px] overflow-hidden group/slide">
                      {innerContent}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          {banners.length > 1 && (
            <>
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
            </>
          )}

          {/* Pagination Dots */}
          {banners.length > 1 && (
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
          )}
        </div>
      </div>
    </section>
  );
}
