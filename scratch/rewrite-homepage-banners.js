const fs = require('fs');

let page = fs.readFileSync('app/page.tsx', 'utf8');

// Replace heroShowcaseItems array
const oldHeroShowcaseItemsStr = `const heroShowcaseItems = [
  {
    id: "showcase-1",
    title: "18K Gold Plated Emerald Ring",
    image: "/product-ring.jpg",
    link: "/shop?category=Rings",
    label: "Rings",
    depth: 1,
    className: "right-[8%] sm:right-[15%] top-[8%] sm:top-[10%] w-16 sm:w-40 aspect-[4/5] -rotate-6 scale-90 sm:scale-100 opacity-60 sm:opacity-100",
    delay: 0.2
  },
  {
    id: "showcase-2",
    title: "Layered Pearl Necklace",
    image: "/product-necklace.jpg",
    link: "/shop?category=Necklaces",
    label: "Necklaces",
    depth: 1.5,
    className: "left-[6%] sm:left-[8%] top-[25%] sm:top-[35%] w-16 sm:w-48 aspect-square rotate-3 scale-90 sm:scale-100 opacity-50 sm:opacity-100",
    delay: 0.4
  },
  {
    id: "showcase-3",
    title: "Rose Gold Classic Bangle",
    image: "/product-bracelet.jpg",
    link: "/shop?category=Bracelets",
    label: "Bracelets",
    depth: 0.8,
    className: "right-[10%] sm:right-[5%] bottom-[15%] sm:bottom-[15%] w-20 sm:w-44 aspect-[4/3] -rotate-3 scale-90 sm:scale-100 opacity-60 sm:opacity-100",
    delay: 0.6
  }
];`;

const newHeroShowcaseItemsStr = `const heroShowcaseItems = [
  {
    id: "showcase-1",
    title: "18K Gold Plated Emerald Ring",
    image: "/product-ring.jpg",
    link: "/shop?category=Rings",
    label: "Rings",
    depth: 1,
    className: "right-[2%] sm:right-[15%] top-[8%] sm:top-[10%] w-24 sm:w-40 aspect-[4/5] -rotate-6 shadow-lg shadow-black/10 opacity-90 sm:opacity-100",
    delay: 0.2
  },
  {
    id: "showcase-2",
    title: "Layered Pearl Necklace",
    image: "/product-necklace.jpg",
    link: "/shop?category=Necklaces",
    label: "Necklaces",
    depth: 1.5,
    className: "left-[1%] sm:left-[8%] top-[30%] sm:top-[35%] w-28 sm:w-48 aspect-[4/5] rotate-3 shadow-lg shadow-black/10 opacity-95 sm:opacity-100",
    delay: 0.4
  },
  {
    id: "showcase-3",
    title: "Rose Gold Classic Bangle",
    image: "/product-bracelet.jpg",
    link: "/shop?category=Bracelets",
    label: "Bracelets",
    depth: 0.8,
    className: "right-[2%] sm:right-[5%] bottom-[12%] sm:bottom-[15%] w-28 sm:w-44 aspect-[4/5] -rotate-3 shadow-lg shadow-black/10 opacity-90 sm:opacity-100",
    delay: 0.6
  }
];`;

page = page.replace(oldHeroShowcaseItemsStr, newHeroShowcaseItemsStr);

// Replace ShowcaseItem function
const oldShowcaseItemStr = `/* ============ Front showcase items — CLICKABLE ============ */
function ShowcaseItem({ item, scrollY }: { item: any, scrollY: any }) {
  const y = useTransform(scrollY, [0, 800], [0, -120 * item.depth]);
  const rot = useTransform(scrollY, [0, 800], [0, 14 * item.depth]);
  
  return (
    <motion.div
      style={{ y, rotate: rot, animationDelay: \`\${item.delay ?? 0}s\` }}
      className={\`absolute z-10 float-slow \${item.className}\`}
    >
      <Link
        href={item.link}
        aria-label={item.label}
        className="group relative block h-full w-full pointer-events-auto"
      >
        <div className="absolute -inset-6 rounded-full opacity-0 blur-2xl transition duration-500 group-hover:opacity-80" style={{ background: "var(--gradient-gold)" }} />
        <div className="relative h-full w-full overflow-hidden rounded-[2rem] liquid-glass p-2 shadow-[var(--shadow-soft)] transition-transform duration-500 group-hover:scale-[1.07] group-hover:-rotate-3 group-active:scale-95">
          <img src={item.image} alt={item.title} className="h-full w-full rounded-[1.5rem] object-cover" loading="eager" />
          <span className="pointer-events-none absolute inset-x-2 bottom-2 translate-y-2 rounded-2xl bg-ink/70 px-3 py-2 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-white opacity-0 backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            {item.label}
          </span>
        </div>
        <div className="pointer-events-none absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full glass-panel px-3 py-1.5 text-[11px] font-medium text-ink opacity-0 transition-all duration-300 group-hover:-bottom-10 group-hover:opacity-100">
          {item.title} <span className="ml-1 text-[var(--rose-gold)]">→</span>
        </div>
      </Link>
    </motion.div>
  );
}`;

const newShowcaseItemStr = `/* ============ Front showcase items — CLICKABLE ============ */
function ShowcaseItem({ item, scrollY }: { item: any, scrollY: any }) {
  const y = useTransform(scrollY, [0, 800], [0, -120 * item.depth]);
  const rot = useTransform(scrollY, [0, 800], [0, 14 * item.depth]);
  
  let destinationUrl = item.link || "/shop";
  if (item.bannerData) {
    const b = item.bannerData;
    if (b.linkType === "offer-page") destinationUrl = \`/offers/\${b.slug}\`;
    else if (b.linkType === "category" && b.categorySlug) destinationUrl = \`/shop?category=\${b.categorySlug}\`;
    else if (b.linkType === "product" && b.productSlug) destinationUrl = \`/product/\${b.productSlug}\`;
    else if (b.linkUrl) destinationUrl = b.linkUrl;
  }

  return (
    <motion.div
      style={{ y, rotate: rot, animationDelay: \`\${item.delay ?? 0}s\` }}
      className={\`absolute z-20 float-slow \${item.className}\`}
    >
      <Link
        href={destinationUrl}
        aria-label={item.label}
        className="group relative block h-full w-full pointer-events-auto"
      >
        <div className="absolute -inset-4 rounded-3xl opacity-20 blur-xl transition duration-500 group-hover:opacity-80" style={{ background: "var(--gradient-gold)" }} />
        <div className="relative h-full w-full overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] glass p-1.5 sm:p-2 border border-white/60 shadow-xl transition-transform duration-500 group-hover:scale-[1.07] group-hover:-rotate-3 group-active:scale-95">
          <img src={item.image} alt={item.title} className="h-full w-full rounded-[1.2rem] sm:rounded-[1.5rem] object-cover" loading="eager" onError={(e) => { e.currentTarget.src = '/hero-showroom.jpg'; }} />
          <span className="pointer-events-none absolute inset-x-1 sm:inset-x-2 bottom-1 sm:bottom-2 translate-y-0 sm:translate-y-2 rounded-xl sm:rounded-2xl bg-ink/70 px-2 py-1.5 sm:px-3 sm:py-2 text-center text-[9px] sm:text-[11px] font-medium uppercase tracking-[0.2em] text-white opacity-100 sm:opacity-0 backdrop-blur transition-all duration-500 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
            {item.label}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}`;

page = page.replace(oldShowcaseItemStr, newShowcaseItemStr);

// Also need to inject bannerData into the items so ShowcaseItem can read it
const oldBannerFetch = `          if (b.length > 0) {
            setHeroBanners(b.map((b, i) => ({
              id: b.id,
              title: b.title,
              image: b.imageUrl,
              link: b.link || "/shop",
              label: b.buttonText || b.subtitle || "Shop Now",
              depth: i === 0 ? 1 : i === 1 ? 1.5 : 0.8,
              className: heroShowcaseItems[i % 3].className, // Borrow the cool layout positions
              delay: heroShowcaseItems[i % 3].delay
            })));`;

const newBannerFetch = `          if (b.length > 0) {
            setHeroBanners(b.map((b, i) => ({
              id: b.id,
              title: b.title,
              image: b.imageUrl,
              link: b.link || "/shop",
              label: b.ctaText || b.buttonText || b.subtitle || "Shop Now",
              depth: i === 0 ? 1 : i === 1 ? 1.5 : 0.8,
              className: heroShowcaseItems[i % 3].className, // Borrow the cool layout positions
              delay: heroShowcaseItems[i % 3].delay,
              bannerData: b
            })));`;
            
page = page.replace(oldBannerFetch, newBannerFetch);

fs.writeFileSync('app/page.tsx', page);
