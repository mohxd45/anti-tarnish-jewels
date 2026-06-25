const fs = require('fs');

// Fix app/page.tsx
let page = fs.readFileSync('app/page.tsx', 'utf8');
page = page.replace('import { sampleProducts } from "@/data/products";', '');
page = page.replace('const [products, setProducts] = useState<Product[]>(cachedProducts || sampleProducts);', 'const [products, setProducts] = useState<Product[]>(cachedProducts || []);');
page = page.replace('filteredProducts = sampleProducts;', 'filteredProducts = [];');
fs.writeFileSync('app/page.tsx', page);

// Fix HeroSlider.tsx
let slider = fs.readFileSync('components/HeroSlider.tsx', 'utf8');
slider = slider.replace('import { Slide } from "@/types";', 'interface Slide { id: string; image?: string; tagline: string; title: string; description: string; ctaText: string; link: string; }');
fs.writeFileSync('components/HeroSlider.tsx', slider);
