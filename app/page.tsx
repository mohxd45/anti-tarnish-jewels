"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ArrowRight, Sparkles, Droplets, Shield, Gem, Star } from "lucide-react";

import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/firestore";
import { Product } from "@/types";

// Static data imported directly matching Lovable prototype
const heroShowcaseItems = [
  {
    id: "showcase-1",
    title: "18K Gold Plated Emerald Ring",
    image: "/product-ring.jpg",
    link: "/shop?category=Rings",
    label: "Rings",
    depth: 1,
    className: "right-[15%] top-[10%] w-40 aspect-[4/5] -rotate-6",
    delay: 0.2
  },
  {
    id: "showcase-2",
    title: "Layered Pearl Necklace",
    image: "/product-necklace.jpg",
    link: "/shop?category=Necklaces",
    label: "Necklaces",
    depth: 1.5,
    className: "left-[8%] top-[35%] w-48 aspect-square rotate-3",
    delay: 0.4
  },
  {
    id: "showcase-3",
    title: "Rose Gold Classic Bangle",
    image: "/product-bracelet.jpg",
    link: "/shop?category=Bracelets",
    label: "Bracelets",
    depth: 0.8,
    className: "right-[5%] bottom-[15%] w-44 aspect-[4/3] -rotate-3",
    delay: 0.6
  }
];

const backgroundJewelryItems = [
  { id: "bg-1", image: "/product-stack.jpg", depth: "back", className: "left-[5%] top-[15%] w-32 -rotate-12", delay: 0 },
  { id: "bg-2", image: "/product-earrings.jpg", depth: "mid", className: "right-[8%] top-[25%] w-40 rotate-12", delay: 0.2 },
  { id: "bg-3", image: "/product-anklet.jpg", depth: "front", className: "left-[12%] bottom-[20%] w-48 -rotate-6", delay: 0.4 },
  { id: "bg-4", image: "/product-ring.jpg", depth: "back", className: "right-[15%] bottom-[25%] w-36 rotate-6", delay: 0.6 },
  { id: "bg-5", image: "/product-necklace.jpg", depth: "mid", className: "left-[30%] top-[5%] w-24 -rotate-12", delay: 0.8 },
  { id: "bg-6", image: "/product-bracelet.jpg", depth: "back", className: "right-[40%] bottom-[10%] w-28 rotate-12", delay: 1.0 },
];

const CATEGORIES = [
  { slug: "Earrings", label: "Earrings", cover: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80" },
  { slug: "Rings", label: "Rings", cover: "https://images.unsplash.com/photo-1605100804763-247f66120ee4?w=800&q=80" },
  { slug: "Necklaces", label: "Necklaces", cover: "https://images.unsplash.com/photo-1599643478524-fb66f7f6f176?w=800&q=80" },
  { slug: "Bracelets", label: "Bracelets", cover: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80" },
  { slug: "Daily Wear Jewellery", label: "Daily Wear", cover: "https://images.unsplash.com/photo-1596944924616-7b38e7cf0be1?w=800&q=80" },
];

/* ============ Background decorative jewellery — NOT clickable ============ */
function BackgroundJewels() {
  const { scrollY } = useScroll();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden hidden md:block">
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
              transform: `rotate(${j.className.includes("rotate") ? j.className.match(/-?rotate-\d+/)?.[0]?.replace("rotate-", "") || 0 : 0}deg)`,
              animationDelay: `${j.delay ?? 0}s`,
            }}
            className={`absolute select-none float-slow ${j.className.replace(/-?rotate-\d+/, "")}`}
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

/* ============ Front showcase items — CLICKABLE ============ */
function HeroShowcase() {
  const { scrollY } = useScroll();
  return (
    <div className="hidden md:block">
      {heroShowcaseItems.map(item => {
        const y = useTransform(scrollY, [0, 800], [0, -120 * item.depth]);
        const rot = useTransform(scrollY, [0, 800], [0, 14 * item.depth]);
        return (
          <motion.div
            key={item.id}
            style={{ y, rotate: rot, animationDelay: `${item.delay ?? 0}s` }}
            className={`absolute z-10 float-slow ${item.className}`}
          >
            <Link
              href={item.link}
              aria-label={item.label}
              className="group relative block h-full w-full"
            >
              <div className="absolute -inset-6 rounded-full opacity-0 blur-2xl transition duration-500 group-hover:opacity-80" style={{ background: "var(--gradient-gold)" }} />
              <div className="relative h-full w-full overflow-hidden rounded-[2rem] glass p-2 shadow-[var(--shadow-soft)] transition-transform duration-500 group-hover:scale-[1.07] group-hover:-rotate-3 group-active:scale-95">
                <img src={item.image} alt={item.title} className="h-full w-full rounded-[1.5rem] object-cover" loading="eager" />
                <span className="pointer-events-none absolute inset-x-2 bottom-2 translate-y-2 rounded-2xl bg-ink/70 px-3 py-2 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-white opacity-0 backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  {item.label}
                </span>
              </div>
              {/* tooltip card */}
              <div className="pointer-events-none absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full glass px-3 py-1.5 text-[11px] font-medium text-ink opacity-0 transition-all duration-300 group-hover:-bottom-10 group-hover:opacity-100">
                {item.title} <span className="ml-1 text-[var(--rose-gold)]">→</span>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ============ Hero ============ */
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const panelY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const panelOp = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative isolate min-h-[100svh] w-full overflow-hidden pt-28 sm:pt-32">
      {/* Background image */}
      <motion.div className="absolute inset-0 -z-40" style={{ scale: imgScale, y: imgY }}>
        <img src="/hero-showroom.jpg" alt="Luxury jewellery showroom" className="h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, oklch(0.95 0.04 20 / 0.35) 0%, oklch(0.93 0.06 20 / 0.05) 35%, oklch(0.88 0.08 20 / 0.6) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "var(--gradient-spotlight)" }} />
      </motion.div>

      {/* Decorative jewellery layer */}
      <BackgroundJewels />

      {/* Clickable showcase layer */}
      <HeroShowcase />

      {/* Foreground content */}
      <motion.div style={{ y: panelY, opacity: panelOp }} className="relative z-20 mx-auto flex max-w-3xl flex-col items-center px-6 text-center pt-10 md:pt-20">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs uppercase tracking-[0.3em] text-ink/70">
          <Sparkles className="h-3.5 w-3.5 text-[var(--gold)]" /> ANTI-TARNISH
        </span>
        <h1 className="font-display text-5xl font-light leading-[1.05] text-ink sm:text-7xl md:text-[5.5rem]">
          Jewels that <em className="font-medium italic text-gold">never fade,</em>
          <br /> only deepen.
        </h1>
        <p className="mt-6 max-w-xl text-base text-ink/70 sm:text-lg">
          A cinematic collection of waterproof rose gold, champagne and pearl —
          crafted to outshine showers, sweat and time itself.
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
          {[{ k: "365d+", v: "Tarnish-Free" }, { k: "100%", v: "Waterproof" }, { k: "18K", v: "Gold Plated" }].map(s => (
            <div key={s.v} className="glass rounded-2xl px-3 py-4">
              <div className="font-display text-2xl font-semibold text-gold">{s.k}</div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-ink/60">{s.v}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center hidden sm:flex">
        <div className="flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-ink/50">
          Scroll
          <span className="h-10 w-px bg-gradient-to-b from-[var(--rose-gold)] to-transparent" />
        </div>
      </div>
    </section>
  );
}

/* ============ Categories ============ */
function Categories() {
  return (
    <section className="relative overflow-hidden py-28" style={{ background: "linear-gradient(180deg, oklch(0.93 0.045 20) 0%, oklch(0.86 0.08 18) 100%)" }}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.4em] text-[var(--rose-gold)]">Browse</p>
          <h2 className="font-display text-4xl text-ink sm:text-5xl">A journey through <em className="italic text-gold">categories.</em></h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href={`/shop?category=${encodeURIComponent(c.slug)}`} className="group relative block aspect-[3/4] overflow-hidden rounded-3xl" style={{ boxShadow: "var(--shadow-soft)" }}>
                <div className="absolute inset-0 rounded-3xl p-px" style={{ background: "var(--gradient-gold)" }}>
                  <div className="relative h-full w-full overflow-hidden rounded-[1.875rem]">
                    <img src={c.cover} alt={c.label} className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <h3 className="font-display text-xl text-white sm:text-2xl">{c.label}</h3>
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
  );
}

/* ============ Bestsellers grid ============ */
function Bestsellers() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then(products => {
      // Get products marked as bestselling or just top 3
      let bestsellers = products.filter(p => p.isBestselling || p.tags?.includes("bestseller"));
      if (bestsellers.length < 3) {
        bestsellers = products; // Fallback if no bestsellers marked
      }
      setItems(bestsellers.slice(0, 3));
      setLoading(false);
    });
  }, []);

  return (
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
        
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[4/5] animate-pulse bg-champagne/20 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </section>
  );
}

/* ============ Story ============ */
function Story() {
  const benefits = [
    { icon: Droplets, t: "Waterproof", d: "Shower, swim, sweat — your shine stays untouched." },
    { icon: Shield, t: "Anti-Tarnish", d: "PVD-sealed finishes resist oxidation for 365+ days." },
    { icon: Sparkles, t: "Hypoallergenic", d: "Nickel-free alloys, kind to sensitive skin." },
    { icon: Gem, t: "18K Gold Plated", d: "Triple-layered gold for a forever luxurious glow." },
  ];
  return (
    <section className="relative overflow-hidden py-28" style={{ background: "linear-gradient(180deg, oklch(0.86 0.08 18) 0%, oklch(0.93 0.045 20) 100%)" }}>
      <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.4em] text-[var(--rose-gold)]">The Craft</p>
          <h2 className="font-display text-4xl text-ink sm:text-6xl">Engineered to <em className="italic text-gold">outshine time.</em></h2>
          <p className="mt-6 max-w-md text-ink/70">
            Each Anti-Tarnish piece is forged through a 7-stage PVD process that bonds gold at a
            molecular level — promising a finish that does not fade, dull or react.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {benefits.map((b, i) => (
            <motion.div
              key={b.t}
              initial={{ opacity: 0, y: 60, rotateX: -10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="glass group relative overflow-hidden rounded-3xl p-7"
            >
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
  );
}

/* ============ Reviews ============ */
function Reviews() {
  const r = [
    { n: "Anika R.", t: "Wore through monsoon — still glowing.", b: "The rose gold pendant survived rain, gym, and sea. Zero tarnish." },
    { n: "Meera S.", t: "My new everyday pieces.", b: "I haven't taken these earrings off in 4 months. Brand new." },
    { n: "Tara K.", t: "Beyond worth it.", b: "Packaging is editorial. The bracelet feels like a museum piece." },
  ];
  return (
    <section className="relative overflow-hidden py-28" style={{ background: "linear-gradient(180deg, oklch(0.93 0.045 20) 0%, oklch(0.88 0.07 25) 100%)" }}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.4em] text-[var(--rose-gold)]">Loved by 40,000+</p>
          <h2 className="font-display text-4xl text-ink sm:text-5xl">Quiet luxury, <em className="italic text-gold">loud reviews.</em></h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {r.map((rv, i) => (
            <motion.div
              key={rv.n}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="glass rounded-3xl p-7 md:-mt-6"
              style={{ transform: `translateY(${i % 2 ? "1.5rem" : "0"})` }}
            >
              <div className="flex gap-0.5 text-[var(--gold)]">
                {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}
              </div>
              <h3 className="mt-4 font-display text-xl text-ink">{rv.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">{rv.b}</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full font-medium text-white" style={{ background: "var(--gradient-gold)" }}>
                  {rv.n[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{rv.n}</p>
                  <p className="text-xs text-ink/55">Verified buyer</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="relative">
      <Hero />
      <Categories />
      <Bestsellers />
      <Story />
      <Reviews />
    </div>
  );
}
