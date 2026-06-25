"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { 
  getHomepageProducts, 
  getCategories, 
  getReviews, 
} from "@/lib/firestore";
import { Product, Category } from "@/types";
import { ArrowRight, Gift, Shield, Sparkles, Truck, Star, Droplets } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

// --- Background Decorative Jewelry ---
const backgroundJewelryItems = [
  { id: 1, image: "/product-stack.jpg", depth: "back", className: "top-[10%] left-[5%] w-32 h-32 md:w-48 md:h-48", rotate: 15, delay: 0 },
  { id: 2, image: "/product-ring.jpg", depth: "mid", className: "top-[30%] right-[10%] w-24 h-24 md:w-40 md:h-40", rotate: -10, delay: 1 },
  { id: 3, image: "/product-necklace.jpg", depth: "front", className: "bottom-[15%] left-[15%] w-20 h-20 md:w-32 md:h-32", rotate: 25, delay: 0.5 },
  { id: 4, image: "/product-stack.jpg", depth: "back", className: "bottom-[20%] right-[5%] w-36 h-36 md:w-56 md:h-56", rotate: -20, delay: 1.5 },
];

function BackgroundJewels() {
  const { scrollY } = useScroll();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {backgroundJewelryItems.map(j => {
        const depthMul = j.depth === "back" ? 0.25 : j.depth === "mid" ? 0.6 : 1.1;
        const blur = j.depth === "back" ? 18 : j.depth === "mid" ? 6 : 1.5;
        const opacity = j.depth === "back" ? 0.32 : j.depth === "mid" ? 0.55 : 0.8;
        const z = j.depth === "back" ? -30 : j.depth === "mid" ? -20 : -10;
        const y = useTransform(scrollY, [0, 1000], [0, -200 * depthMul]);
        return (
          <motion.div
            key={j.id}
            style={{
              y,
              filter: `blur(${blur}px) saturate(115%)`,
              opacity,
              zIndex: z,
              transform: `rotate(${j.rotate}deg)`,
              animationDelay: `${j.delay}s`,
            }}
            className={`absolute select-none float-slow ${j.className}`}
          >
            <div className="relative h-full w-full">
              {j.depth === "front" && (
                <div className="absolute -inset-4 rounded-full opacity-50 blur-2xl" style={{ background: "var(--gradient-gold)" }} />
              )}
              <img src={j.image} alt="" className="relative h-full w-full rounded-[2rem] object-cover" loading="eager" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// --- Clickable Showcase ---
const heroShowcaseItems = [
  { id: 1, image: "/product-necklace.jpg", title: "Pearl Drop", label: "Necklaces", link: "/shop?category=Necklaces", depth: 1, className: "top-[15%] right-[25%] w-40 h-56 hidden lg:block", delay: 0 },
  { id: 2, image: "/product-ring.jpg", title: "Eternity Band", label: "Rings", link: "/shop?category=Rings", depth: 1.5, className: "bottom-[25%] left-[25%] w-48 h-64 hidden lg:block", delay: 0.3 },
  { id: 3, image: "/product-stack.jpg", title: "Signature Stack", label: "Bracelets", link: "/shop?category=Bracelets", depth: 0.8, className: "bottom-[10%] right-[15%] w-36 h-48 hidden md:block", delay: 0.6 },
];

function HeroShowcase() {
  const { scrollY } = useScroll();
  return (
    <>
      {heroShowcaseItems.map(item => {
        const y = useTransform(scrollY, [0, 800], [0, -120 * item.depth]);
        const rot = useTransform(scrollY, [0, 800], [0, 14 * item.depth]);
        return (
          <motion.div
            key={item.id}
            style={{ y, rotate: rot, animationDelay: `${item.delay}s` }}
            className={`absolute z-10 float-slow ${item.className}`}
          >
            <Link href={item.link} aria-label={item.label} className="group relative block h-full w-full">
              <div className="absolute -inset-6 rounded-full opacity-0 blur-2xl transition duration-500 group-hover:opacity-80" style={{ background: "var(--gradient-gold)" }} />
              <div className="relative h-full w-full overflow-hidden rounded-[2rem] glass p-2 shadow-[var(--shadow-soft)] transition-transform duration-500 group-hover:scale-[1.07] group-hover:-rotate-3 group-active:scale-95">
                <img src={item.image} alt={item.title} className="h-full w-full rounded-[1.5rem] object-cover" loading="eager" />
                <span className="pointer-events-none absolute inset-x-2 bottom-2 translate-y-2 rounded-2xl bg-ink/70 px-3 py-2 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-white opacity-0 backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  {item.label}
                </span>
              </div>
              <div className="pointer-events-none absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full glass px-3 py-1.5 text-[11px] font-medium text-ink opacity-0 transition-all duration-300 group-hover:-bottom-10 group-hover:opacity-100">
                {item.title} <span className="ml-1 text-[var(--rose-gold)]">→</span>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const panelY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const panelOp = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative isolate min-h-[100svh] w-full overflow-hidden pt-28 sm:pt-32">
      <motion.div className="absolute inset-0 -z-40" style={{ scale: imgScale, y: imgY }}>
        <img src="/hero-showroom.jpg" alt="Luxury jewellery showroom" className="h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, oklch(0.95 0.04 20 / 0.35) 0%, oklch(0.93 0.06 20 / 0.05) 35%, oklch(0.88 0.08 20 / 0.6) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "var(--gradient-spotlight)" }} />
      </motion.div>
      <BackgroundJewels />
      <HeroShowcase />
      <motion.div style={{ y: panelY, opacity: panelOp }} className="relative z-20 mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs uppercase tracking-[0.3em] text-ink/70">
          <Sparkles className="h-3.5 w-3.5 text-[var(--gold)]" /> Anti-Tarnish
        </span>
        <h1 className="font-display text-5xl font-light leading-[1.05] text-ink sm:text-7xl md:text-[5.5rem]">
          Jewels that <em className="font-medium italic text-gold">never fade,</em><br /> only deepen.
        </h1>
        <p className="mt-6 max-w-xl text-base text-ink/70 sm:text-lg">
          A cinematic collection of waterproof rose gold, champagne and pearl — crafted to outshine showers, sweat and time itself.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/shop" className="shine group inline-flex items-center gap-3 rounded-full px-8 py-4 text-sm font-medium text-white transition-transform hover:-translate-y-0.5" style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-glow)" }}>
            Explore the Collection <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/sale" className="inline-flex items-center gap-2 rounded-full glass px-7 py-4 text-sm font-medium text-ink transition hover:text-[var(--rose-gold)]">
            Shop the Sale
          </Link>
        </div>
        <div className="mt-16 grid w-full max-w-2xl grid-cols-3 gap-3">
          {[{ k: "365d", v: "Tarnish-Free" }, { k: "100%", v: "Waterproof" }, { k: "18K", v: "Gold Plated" }].map(s => (
            <div key={s.v} className="glass rounded-2xl px-3 py-4">
              <div className="font-display text-2xl font-semibold text-gold">{s.k}</div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-ink/60">{s.v}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const [allProds, allCats, allReviews] = await Promise.all([
        getHomepageProducts(),
        getCategories(),
        getReviews()
      ]);
      setProducts(allProds.filter(p => p.isActive !== false));
      setCategories(allCats.filter(c => c.isActive && c.slug !== "all" && c.slug !== "sale"));
      setReviews(allReviews.filter(r => r.active !== false));
    }
    loadData();
  }, []);

  const bestsellers = products.filter(p => p.isBestSeller).slice(0, 3);
  const fallbackCategories = [
    { slug: "rings", name: "Rings", image: "https://images.unsplash.com/photo-1605100804763-247f673f224e?q=80&w=600&auto=format&fit=crop" },
    { slug: "necklaces", name: "Necklaces", image: "https://images.unsplash.com/photo-1599643478514-4a1101861366?q=80&w=600&auto=format&fit=crop" },
    { slug: "earrings", name: "Earrings", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop" }
  ];
  const catsToUse = categories.length > 0 ? categories : fallbackCategories;

  return (
    <div className="relative">
      <Hero />

      {/* Categories */}
      <section className="relative overflow-hidden py-28" style={{ background: "linear-gradient(180deg, oklch(0.93 0.045 20) 0%, oklch(0.86 0.08 18) 100%)" }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs uppercase tracking-[0.4em] text-[var(--rose-gold)]">Browse</p>
            <h2 className="font-display text-4xl text-ink sm:text-5xl">A journey through <em className="italic text-gold">categories.</em></h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
            {catsToUse.slice(0, 5).map((c, i) => (
              <motion.div key={c.slug} initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}>
                <Link href={`/shop?category=${encodeURIComponent(c.name)}`} className="group relative block aspect-[3/4] overflow-hidden rounded-3xl" style={{ boxShadow: "var(--shadow-soft)" }}>
                  <div className="absolute inset-0 rounded-3xl p-px" style={{ background: "var(--gradient-gold)" }}>
                    <div className="relative h-full w-full overflow-hidden rounded-[1.875rem]">
                      <img src={(c as any).image || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop"} alt={c.name} className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <h3 className="font-display text-xl text-white sm:text-2xl">{c.name}</h3>
                        <span className="mt-1 inline-flex items-center gap-1 text-xs text-white/80">Explore <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" /></span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
        <section className="relative py-28" style={{ background: "var(--gradient-luxe)" }}>
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="mb-3 text-xs uppercase tracking-[0.4em] text-[var(--rose-gold)]">Bestsellers</p>
                <h2 className="font-display text-4xl text-ink sm:text-5xl">Curated for the <em className="italic text-gold">forever</em> wardrobe.</h2>
              </div>
              <Link href="/shop" className="group inline-flex items-center gap-2 text-sm text-ink/75 hover:text-[var(--rose-gold)]">
                Shop all <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {bestsellers.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Story */}
      <section className="relative overflow-hidden py-28" style={{ background: "linear-gradient(180deg, oklch(0.86 0.08 18) 0%, oklch(0.93 0.045 20) 100%)" }}>
        <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.4em] text-[var(--rose-gold)]">The Craft</p>
            <h2 className="font-display text-4xl text-ink sm:text-6xl">Engineered to <em className="italic text-gold">outshine time.</em></h2>
            <p className="mt-6 max-w-md text-ink/70">Each Anti-Tarnish piece is forged through a 7-stage PVD process that bonds gold at a molecular level — promising a finish that does not fade, dull or react.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              { icon: Droplets, t: "Waterproof", d: "Shower, swim, sweat — your shine stays untouched." },
              { icon: Shield, t: "Anti-Tarnish", d: "PVD-sealed finishes resist oxidation for 365+ days." },
              { icon: Sparkles, t: "Hypoallergenic", d: "Nickel-free alloys, kind to sensitive skin." },
              { icon: Star, t: "18K Gold Plated", d: "Triple-layered gold for a forever luxurious glow." },
            ].map((b, i) => (
              <motion.div key={b.t} initial={{ opacity: 0, y: 60, rotateX: -10 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }} className="glass group relative overflow-hidden rounded-3xl p-7">
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-40 blur-2xl transition group-hover:opacity-70" style={{ background: "var(--gradient-gold)" }} />
                <div className="relative">
                  <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl text-white" style={{ background: "var(--gradient-gold)" }}>
                    <b.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-2xl text-ink">{b.t}</h3>
                  <p className="mt-2 text-sm text-ink/65">{b.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="relative overflow-hidden py-28" style={{ background: "linear-gradient(180deg, oklch(0.93 0.045 20) 0%, oklch(0.88 0.07 25) 100%)" }}>
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 text-center">
              <p className="mb-3 text-xs uppercase tracking-[0.4em] text-[var(--rose-gold)]">Loved by 40,000+</p>
              <h2 className="font-display text-4xl text-ink sm:text-5xl">Quiet luxury, <em className="italic text-gold">loud reviews.</em></h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {reviews.slice(0, 3).map((rv, i) => (
                <motion.div key={rv.id} initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.1 }} className="glass rounded-3xl p-7" style={{ transform: `translateY(${i % 2 ? "1.5rem" : "0"})` }}>
                  <div className="flex gap-0.5 text-[var(--gold)]">
                    {[...Array(rv.rating || 5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}
                  </div>
                  <h3 className="mt-4 font-display text-xl text-ink">Verified Excellence</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70">{rv.comment}</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full font-medium text-white" style={{ background: "var(--gradient-gold)" }}>{rv.name[0]}</div>
                    <div>
                      <p className="text-sm font-medium text-ink">{rv.name}</p>
                      <p className="text-xs text-ink/55">Verified buyer</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
