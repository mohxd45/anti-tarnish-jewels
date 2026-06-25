"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { getBanners } from "@/lib/firestore";
interface Slide { id: string; image?: string; tagline: string; title: string; description: string; ctaText: string; link: string; }
import { BrandLogo } from "./BrandLogo";
import { PublicJewelryBackground } from "./ui/PublicJewelryBackground";
import { ParallaxLayer } from "./ui/ParallaxLayer";

const defaultSlides: Slide[] = [
  {
    id: "default-1",
    tagline: "Exclusive Collection",
    title: "Premium Anti-Tarnish Jewellery",
    description: "Shop premium jewellery designed for daily wear and lasting elegance.",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200&auto=format&fit=crop",
    ctaText: "Shop Now",
    link: "/shop?category=Jewellery"
  },
  {
    id: "default-2",
    tagline: "Exclusive Collection",
    title: "Luxury Monogram Rings",
    description: "Discover our signature rings that preserve their golden champagne shine.",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1200&auto=format&fit=crop",
    ctaText: "Shop Rings",
    link: "/shop?category=Jewellery"
  },
  {
    id: "default-3",
    tagline: "Elegant Everyday Styling",
    title: "Necklaces & Earrings",
    description: "Accentuate your daily look with necklaces and earrings that combine minimalist aesthetics.",
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
    }, 5500);
    return () => clearInterval(timer);
  }, [mounted, slides.length]);

  const next = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <PublicJewelryBackground variant="hero" className="w-screen max-w-none relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-ivory">
      {/* Background radial gradient element with parallax depth */}
      <ParallaxLayer speed={0.3} className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gold-radial opacity-30" />
      </ParallaxLayer>

      <div className="relative w-full">
        {/* Slides Outer Container */}
        <div className="relative w-full min-h-[600px] md:min-h-[800px] flex items-center justify-center overflow-hidden py-12 md:py-20">
          {slides.map((slide, idx) => {
            const isActive = idx === current;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out flex flex-col items-center justify-center px-4 ${
                  isActive
                    ? "opacity-100 z-10 pointer-events-auto"
                    : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <div className="relative z-20 flex flex-col items-center text-center max-w-6xl mx-auto w-full">
                  {/* Branding Block (Top) */}
                  <div className="mb-8 md:mb-10 flex flex-col items-center gap-3 w-fit mx-auto">
                    <BrandLogo size={56} withBg={true} />
                    <div className="flex flex-col items-center text-charcoalBrown mt-2">
                      <span className="font-serif text-sm md:text-base font-semibold tracking-[0.25em] uppercase">Anti Tarnish Jewels</span>
                      <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-charcoalBrown/70 mt-1">{slide.tagline}</span>
                    </div>
                  </div>

                  {/* Large Banner Image Section (Card) */}
                  <div className="w-full aspect-[16/9] md:aspect-[21/9] relative rounded-[2rem] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] mb-10 group bg-white/70 backdrop-blur-md border border-goldBeige/30">
                    {slide.image ? (
                      <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        priority={idx === 0}
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        sizes="(max-w-7xl) 100vw, 90vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="text-champagne/30" size={60} />
                      </div>
                    )}
                    {/* Subtle inner overlay for image richness */}
                    <div className="absolute inset-0 bg-charcoalBrown/5 pointer-events-none" />
                  </div>

                  {/* Main Text Content (Bottom) */}
                  <div className="flex flex-col items-center max-w-3xl mx-auto">
                    <h1 className="text-[clamp(1.75rem,5vw,3.5rem)] font-serif font-bold leading-tight text-charcoalBrown">
                      {slide.title}
                    </h1>
                    <p className="mt-4 md:mt-6 text-sm md:text-lg text-charcoalBrown/70 leading-relaxed">
                      {slide.description}
                    </p>
                    
                    <div className="mt-8 md:mt-10">
                      <Link
                        href={slide.link}
                        className="group inline-flex rounded-full bg-champagne px-8 py-4 text-sm md:text-base font-semibold text-charcoalBrown hover:bg-champagne/90 transition-all items-center justify-center gap-2 shadow-jewel hover:shadow-champagne/30"
                      >
                        {slide.ctaText}
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform shrink-0" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Controls */}
        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="flex items-center justify-between w-full max-w-7xl px-4 md:px-10 pointer-events-auto">
            {/* Dots */}
            <div className="flex gap-3">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`h-2 rounded-full transition-all duration-300 shadow-sm ${
                    idx === current ? "w-10 bg-champagne" : "w-3 bg-champagne/30 hover:bg-champagne/60"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex gap-4 hidden sm:flex">
              <button
                onClick={prev}
                className="p-3 rounded-full border border-champagne/30 text-charcoalBrown bg-ivory/80 hover:bg-champagne hover:border-champagne backdrop-blur-md transition-all shadow-md"
                aria-label="Previous slide"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={next}
                className="p-3 rounded-full border border-champagne/30 text-charcoalBrown bg-ivory/80 hover:bg-champagne hover:border-champagne backdrop-blur-md transition-all shadow-md"
                aria-label="Next slide"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </PublicJewelryBackground>
  );
}
