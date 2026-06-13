"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { getBanners } from "@/lib/firestore";
import { Banner } from "@/types";
import { BrandLogo } from "./BrandLogo";

interface Slide {
  id: string;
  tagline: string;
  title: string;
  description: string;
  image: string;
  ctaText: string;
  link: string;
}

const defaultSlides: Slide[] = [
  {
    id: "default-1",
    tagline: "Waterproof & Tarnish-Free",
    title: "Premium Anti-Tarnish Jewellery for Everyday Shine",
    description: "Shop waterproof, tarnish-free, non-fading jewellery designed for daily wear and lasting elegance.",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200&auto=format&fit=crop",
    ctaText: "Shop Now",
    link: "/shop?category=Jewellery"
  },
  {
    id: "default-2",
    tagline: "Waterproof & Non-Fading",
    title: "Anti-Tarnish Luxury Monogram Rings",
    description: "Discover our signature waterproof rings that preserve their golden champagne shine without ever fading or tarnishing.",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1200&auto=format&fit=crop",
    ctaText: "Shop Rings",
    link: "/shop?category=Jewellery"
  },
  {
    id: "default-3",
    tagline: "Elegant Everyday Styling",
    title: "Tarnish-Free Necklaces & Earrings",
    description: "Accentuate your daily look with necklaces and earrings that combine minimalist aesthetics with unmatched waterproofing.",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1200&auto=format&fit=crop",
    ctaText: "Shop Best Sellers",
    link: "/shop?category=Jewellery"
  }
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState<Slide[]>(defaultSlides);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadBanners();
  }, []);

  async function loadBanners() {
    try {
      const banners = await getBanners();
      const heroBanners = banners.filter(b => b.isActive && b.placement === "hero");
      
      if (heroBanners.length > 0) {
        // Sort by priority ascending
        const sorted = [...heroBanners].sort((a, b) => a.priority - b.priority);
        const mapped: Slide[] = sorted.map((b) => ({
          id: b.id,
          tagline: b.subtitle || "Exclusive Collection",
          title: b.title,
          description: "Discover our premium handpicked products. High build-quality and luxury selection.",
          image: b.imageUrl,
          ctaText: b.buttonText || "Shop Collection",
          link: b.link
        }));
        setSlides(mapped);
      }
    } catch (err) {
      console.error("Error loading banners for slider:", err);
    }
  }

  useEffect(() => {
    if (!mounted || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5500); // Premium luxury pacing
    return () => clearInterval(timer);
  }, [mounted, slides.length]);



  const next = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative overflow-hidden px-4 py-8 md:py-16">
      {/* Background radial gradient element */}
      <div className="absolute inset-0 -z-10 bg-gold-radial opacity-30" />

      <div className="mx-auto max-w-7xl relative">
        {/* Slides Outer Container */}
        <div className="relative w-full min-h-[280px] sm:min-h-[400px] flex items-center">
          {slides.map((slide, idx) => {
            const isActive = idx === current;
            return (
              <div
                key={slide.id}
                className={`w-full transition-all duration-1000 ease-in-out grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center ${
                  isActive
                    ? "relative opacity-100 translate-x-0 pointer-events-auto z-10"
                    : "absolute top-0 left-0 opacity-0 translate-x-8 pointer-events-none z-0"
                }`}
              >
                {/* Text Content */}
                <div className="flex flex-col justify-center">
                  {/* Brand Monogram Emblem */}
                  <div className="mb-6 flex items-center gap-3 w-fit">
                    <BrandLogo size={52} withBg={true} />
                    <div className="flex flex-col items-start">
                      <span className="font-serif text-xs font-semibold tracking-[0.25em] text-champagne uppercase">Anti Tarnish Jewels</span>
                      <span className="text-[9px] uppercase tracking-[0.15em] text-stoneGray/80 mt-0.5">Waterproof & Non-Fading</span>
                    </div>
                  </div>

                  <span className="text-xs md:text-sm font-medium uppercase tracking-[0.2em] md:tracking-[0.45em] text-champagne inline-flex items-center gap-2">
                    <span className="h-[1px] w-6 bg-champagne/50" /> {slide.tagline}
                  </span>
                  <h1 className="mt-3 md:mt-5 max-w-3xl text-[clamp(1.35rem,5vw,2.75rem)] font-semibold leading-tight text-charcoalBrown">
                    {slide.title}
                  </h1>
                  <p className="mt-4 md:mt-6 max-w-2xl text-sm md:text-lg leading-relaxed md:leading-8 text-charcoalBrown/70">
                    {slide.description}
                  </p>
                  <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3">
                    <Link
                      href={slide.link}
                      className="group rounded-full bg-champagne px-5 py-3 md:px-7 md:py-4 text-xs md:text-sm font-semibold text-charcoalBrown hover:bg-champagne/90 transition-all flex items-center justify-center gap-2 shadow-jewel hover:shadow-champagne/25 w-full sm:w-auto text-center"
                    >
                      {slide.ctaText}
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform shrink-0" />
                    </Link>
                    <Link
                      href="/shop"
                      className="rounded-full border border-goldBeige/60 px-5 py-3 md:px-7 md:py-4 text-xs md:text-sm font-semibold text-champagne hover:bg-champagne/10 transition-colors w-full sm:w-auto text-center"
                    >
                      Explore All Store
                    </Link>
                  </div>
                </div>

                {/* Banner/Image Content */}
                <div className="rounded-[2rem] border border-goldBeige/60 bg-warmwhite p-4 shadow-jewel relative group/image max-w-md lg:max-w-none mx-auto w-full">
                  <div className="aspect-[3/2] md:aspect-[4/5] relative rounded-[1.5rem] overflow-hidden bg-ivory flex items-center justify-center">
                    {slide.image ? (
                      <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        priority={idx === 0}
                        className="object-cover transition-transform duration-700 group-hover/image:scale-105"
                        sizes="(max-w-7xl) 100vw, 50vw"
                      />
                    ) : (
                      <ImageIcon className="text-champagne/20" size={60} />
                    )}
                  </div>
                  {/* Subtle glass reflection overlay */}
                  <div className="absolute inset-0 rounded-[2rem] pointer-events-none bg-gradient-to-tr from-white/[0.03] to-white/[0.1]" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between mt-10 z-20 relative">
          {/* Dots Indicator */}
          <div className="flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === current ? "w-8 bg-champagne" : "w-2 bg-champagne/30 hover:bg-champagne/50"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Arrow Buttons */}
          <div className="flex gap-3">
            <button
              onClick={prev}
              className="p-2 sm:p-3 rounded-full border border-goldBeige/50 text-champagne bg-ivory/60 hover:bg-champagne hover:text-charcoalBrown transition-all"
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className="p-2 sm:p-3 rounded-full border border-goldBeige/50 text-champagne bg-ivory/60 hover:bg-champagne hover:text-charcoalBrown transition-all"
              aria-label="Next slide"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
