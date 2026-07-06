"use client";

import { Product } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { useMemo, useState, useEffect } from "react";
import { getCategories } from "@/lib/firestore";
import { Filter, X, ChevronDown, ChevronUp, Star, RotateCcw, Search, PackageSearch } from "lucide-react";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";


interface ProductGridProps {
  products: Product[];
  title?: string;
  initialCategory?: string;
  initialSearch?: string;
  initialPrice?: string;
  initialDiscount?: number | null;
}

export function ProductGrid({
  products,
  title = "Explore Catalog",
  initialCategory = "All",
  initialSearch = "",
  initialPrice = "All",
  initialDiscount = null,
}: ProductGridProps) {
  // State for all filters
  const [search, setSearch] = useState(initialSearch);
  const [localSearch, setLocalSearch] = useState(initialSearch);
  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory && initialCategory !== "All" ? [initialCategory] : []
  );
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string>(initialPrice); // "All", "under199", "under499", "under999", "custom"
  const [customMinPrice, setCustomMinPrice] = useState<string>("");
  const [customMaxPrice, setCustomMaxPrice] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedDiscount, setSelectedDiscount] = useState<number | null>(initialDiscount);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [waterproofOnly, setWaterproofOnly] = useState<boolean>(false);
  const [antiTarnishOnly, setAntiTarnishOnly] = useState<boolean>(false);
  const [flags, setFlags] = useState({
    isNewArrival: false,
    isBestSeller: false,
    isFlashDeal: false,
  });
  const [sort, setSort] = useState("newest");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [categoriesList, setCategoriesList] = useState<string[]>([
    "Earrings", "Rings", "Necklaces", "Necklace Sets", "Bracelets", "Bangles", "Anklets", "Nose Pins", "Pendants", "Chains", "Chokers", "Hair Accessories", "Maang Tikka", "Haathphool", "Bridal Sets", "Daily Wear Jewellery", "Office Wear Jewellery", "Party Wear Jewellery", "Festive Jewellery", "Waterproof Jewellery", "Anti-Tarnish Jewellery", "Tarnish-Free Jewellery", "New Arrivals", "Best Sellers", "Sale"
  ]);

  // Accordion open/close states
  const [openSections, setOpenSections] = useState({
    categories: true,
    price: true,
    rating: true,
    attributes: true,
    stock: true,
    materials: true,
    occasions: true,
    collections: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Fetch active categories dynamically
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await getCategories();
        const activeCats = cats.filter(c => c.isActive).map(c => c.name);
        if (activeCats.length > 0) {
          setCategoriesList(activeCats);
        } else {
          setCategoriesList([
            "Earrings", "Rings", "Necklaces", "Necklace Sets", "Bracelets", "Bangles", "Anklets", "Nose Pins", "Pendants", "Chains", "Chokers", "Hair Accessories", "Maang Tikka", "Haathphool", "Bridal Sets", "Daily Wear Jewellery", "Office Wear Jewellery", "Party Wear Jewellery", "Festive Jewellery", "Waterproof Jewellery", "Anti-Tarnish Jewellery", "Tarnish-Free Jewellery", "New Arrivals", "Best Sellers", "Sale"
          ]);
        }
      } catch (err) {
        console.error("Error loading categories in grid:", err);
        setCategoriesList([
          "Earrings", "Rings", "Necklaces", "Necklace Sets", "Bracelets", "Bangles", "Anklets", "Nose Pins", "Pendants", "Chains", "Chokers", "Hair Accessories", "Maang Tikka", "Haathphool", "Bridal Sets", "Daily Wear Jewellery", "Office Wear Jewellery", "Party Wear Jewellery", "Festive Jewellery", "Waterproof Jewellery", "Anti-Tarnish Jewellery", "Tarnish-Free Jewellery", "New Arrivals", "Best Sellers", "Sale"
        ]);
      }
    }
    loadCategories();
  }, []);

  // Sync category state when initialCategory prop changes
  useEffect(() => {
    if (initialCategory && initialCategory !== "All") {
      setSelectedCategories([initialCategory]);
    } else {
      setSelectedCategories([]);
    }
  }, [initialCategory]);

  // Lock body scroll when filter drawer is open
  useEffect(() => {
    if (isFilterDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFilterDrawerOpen]);

  // Debounce search query changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(localSearch);
      setVisibleCount(12);
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch]);

  // Extract materials, occasions, collections, and colors dynamically from products list
  const colors = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.color) set.add(p.color);
    });
    return Array.from(set).sort();
  }, [products]);

  const materials = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.material) set.add(p.material);
    });
    return Array.from(set).sort();
  }, [products]);

  const occasions = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.occasion) set.add(p.occasion);
    });
    return Array.from(set).sort();
  }, [products]);

  const collections = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.collection) set.add(p.collection);
    });
    return Array.from(set).sort();
  }, [products]);

  // Reset all filters
  const resetFilters = () => {
    setSearch("");
    setLocalSearch("");
    setVisibleCount(12);
    setSelectedCategories([]);
    setSelectedMaterials([]);
    setSelectedOccasions([]);
    setSelectedCollections([]);
    setPriceRange("All");
    setCustomMinPrice("");
    setCustomMaxPrice("");
    setSelectedRating(null);
    setSelectedDiscount(null);
    setSelectedColors([]);
    setInStockOnly(false);
    setWaterproofOnly(false);
    setAntiTarnishOnly(false);
    setFlags({
      isNewArrival: false,
      isBestSeller: false,
      isFlashDeal: false,
    });
    setSort("newest");
  };

  // Filtering and Sorting logic
  const filtered = useMemo(() => {
    let list = products;

    // Search Keyword
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          (p.material && p.material.toLowerCase().includes(term)) ||
          (p.collection && p.collection.toLowerCase().includes(term)) ||
          (p.occasion && p.occasion.toLowerCase().includes(term)) ||
          (p.category && p.category.toLowerCase().includes(term))
      );
    }

    // Categories
    if (selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.includes(p.category));
    }

    // Materials
    if (selectedMaterials.length > 0) {
      list = list.filter((p) => p.material && selectedMaterials.includes(p.material));
    }

    // Occasions
    if (selectedOccasions.length > 0) {
      list = list.filter((p) => p.occasion && selectedOccasions.includes(p.occasion));
    }

    // Collections
    if (selectedCollections.length > 0) {
      list = list.filter((p) => p.collection && selectedCollections.includes(p.collection));
    }

    // Price Range
    if (priceRange !== "All") {
      if (priceRange === "under199") {
        list = list.filter((p) => p.salePrice < 199);
      } else if (priceRange === "under499") {
        list = list.filter((p) => p.salePrice < 499);
      } else if (priceRange === "under999") {
        list = list.filter((p) => p.salePrice < 999);
      } else if (priceRange === "custom") {
        const min = parseFloat(customMinPrice);
        const max = parseFloat(customMaxPrice);
        if (!isNaN(min)) {
          list = list.filter((p) => p.salePrice >= min);
        }
        if (!isNaN(max)) {
          list = list.filter((p) => p.salePrice <= max);
        }
      }
    }

    // Rating
    if (selectedRating !== null) {
      list = list.filter((p) => p.rating >= selectedRating);
    }

    // Discount
    if (selectedDiscount !== null) {
      list = list.filter((p) => p.discountPercentage >= selectedDiscount);
    }

    // Colors
    if (selectedColors.length > 0) {
      list = list.filter((p) => p.color && selectedColors.includes(p.color));
    }

    // Stock
    if (inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }

    // Waterproof
    if (waterproofOnly) {
      list = list.filter((p) => p.waterproof === true);
    }

    // Anti Tarnish
    if (antiTarnishOnly) {
      list = list.filter((p) => p.antiTarnish === true);
    }

    // Flags
    if (flags.isNewArrival) {
      list = list.filter((p) => p.isNewArrival);
    }
    if (flags.isBestSeller) {
      list = list.filter((p) => p.isBestSeller);
    }
    if (flags.isFlashDeal) {
      list = list.filter((p) => p.isFlashDeal);
    }

    // Sorting
    if (sort === "newest") {
      list = [...list].sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime());
    } else if (sort === "low") {
      list = [...list].sort((a, b) => (a.salePrice || 0) - (b.salePrice || 0));
    } else if (sort === "high") {
      list = [...list].sort((a, b) => (b.salePrice || 0) - (a.salePrice || 0));
    } else if (sort === "popular") {
      list = [...list].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    } else if (sort === "discount") {
      list = [...list].sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
    } else if (sort === "rating") {
      list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return list;
  }, [
    products,
    search,
    selectedCategories,
    selectedMaterials,
    selectedOccasions,
    selectedCollections,
    priceRange,
    customMinPrice,
    customMaxPrice,
    selectedRating,
    selectedDiscount,
    selectedColors,
    inStockOnly,
    waterproofOnly,
    antiTarnishOnly,
    flags,
    sort,
  ]);

  // Multiselect toggler
  const toggleMultiSelect = (item: string, list: string[], setter: (val: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((x) => x !== item));
    } else {
      setter([...list, item]);
    }
  };

  const renderFiltersContent = () => (
    <div className="flex flex-col gap-6 text-charcoalBrown/85">
      {/* Reset button */}
      <div className="flex items-center justify-between border-b border-ink/10 pb-4">
        <span className="text-lg font-serif font-medium text-champagne uppercase tracking-wider">Filters</span>
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 text-xs text-[#C98484] hover:text-[#C98484]/90 transition-colors"
        >
          <RotateCcw size={12} />
          Reset All
        </button>
      </div>

      {/* Categories Section */}
      <div className="border-b border-ink/10 pb-4">
        <button
          onClick={() => toggleSection("categories")}
          className="flex w-full items-center justify-between font-medium text-[#3B2B2B] hover:text-[#C98484] transition-colors"
        >
          <span>Category</span>
          {openSections.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {openSections.categories && (
          <div className="mt-3 flex flex-col gap-2 pl-1">
            {categoriesList.map((cat) => {
              const isChecked = selectedCategories.includes(cat);
              return (
                <label key={cat} className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleMultiSelect(cat, selectedCategories, setSelectedCategories)}
                    className="accent-champagne h-4 w-4 rounded border-stone-200/60 bg-white/70 backdrop-blur-md text-champagne"
                  />
                  <span className={isChecked ? "text-[#C98484] font-semibold" : "hover:text-[#3B2B2B]/90"}>{cat}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Materials Section */}
      {materials.length > 0 && (
        <div className="border-b border-ink/10 pb-4">
          <button
            onClick={() => toggleSection("materials")}
            className="flex w-full items-center justify-between font-medium text-[#3B2B2B] hover:text-[#C98484] transition-colors"
          >
            <span>Material</span>
            {openSections.materials ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {openSections.materials && (
            <div className="mt-3 flex flex-col gap-2 pl-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {materials.map((m) => {
                const isChecked = selectedMaterials.includes(m);
                return (
                  <label key={m} className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleMultiSelect(m, selectedMaterials, setSelectedMaterials)}
                      className="accent-champagne h-4 w-4 rounded border-stone-200/60 bg-white/70 backdrop-blur-md text-champagne"
                    />
                    <span className={isChecked ? "text-[#C98484] font-semibold" : "hover:text-[#3B2B2B]/90"}>{m}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Occasions Section */}
      {occasions.length > 0 && (
        <div className="border-b border-ink/10 pb-4">
          <button
            onClick={() => toggleSection("occasions")}
            className="flex w-full items-center justify-between font-medium text-[#3B2B2B] hover:text-[#C98484] transition-colors"
          >
            <span>Occasion</span>
            {openSections.occasions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {openSections.occasions && (
            <div className="mt-3 flex flex-col gap-2 pl-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {occasions.map((o) => {
                const isChecked = selectedOccasions.includes(o);
                return (
                  <label key={o} className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleMultiSelect(o, selectedOccasions, setSelectedOccasions)}
                      className="accent-champagne h-4 w-4 rounded border-stone-200/60 bg-white/70 backdrop-blur-md text-champagne"
                    />
                    <span className={isChecked ? "text-[#C98484] font-semibold" : "hover:text-[#3B2B2B]/90"}>{o}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Collections Section */}
      {collections.length > 0 && (
        <div className="border-b border-ink/10 pb-4">
          <button
            onClick={() => toggleSection("collections")}
            className="flex w-full items-center justify-between font-medium text-[#3B2B2B] hover:text-[#C98484] transition-colors"
          >
            <span>Collection</span>
            {openSections.collections ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {openSections.collections && (
            <div className="mt-3 flex flex-col gap-2 pl-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {collections.map((col) => {
                const isChecked = selectedCollections.includes(col);
                return (
                  <label key={col} className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleMultiSelect(col, selectedCollections, setSelectedCollections)}
                      className="accent-champagne h-4 w-4 rounded border-stone-200/60 bg-white/70 backdrop-blur-md text-champagne"
                    />
                    <span className={isChecked ? "text-[#C98484] font-semibold" : "hover:text-[#3B2B2B]/90"}>{col}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Price Range Section */}
      <div className="border-b border-ink/10 pb-4">
        <button
          onClick={() => toggleSection("price")}
          className="flex w-full items-center justify-between font-medium text-[#3B2B2B] hover:text-[#C98484] transition-colors"
        >
          <span>Price Range</span>
          {openSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {openSections.price && (
          <div className="mt-3 flex flex-col gap-2 pl-1">
            {[
              { label: "All Prices", value: "All" },
              { label: "Under ₹199", value: "under199" },
              { label: "Under ₹499", value: "under499" },
              { label: "Under ₹999", value: "under999" },
              { label: "Custom Range", value: "custom" },
            ].map((pOpt) => (
              <label key={pOpt.value} className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                <input
                  type="radio"
                  name="priceRange"
                  checked={priceRange === pOpt.value}
                  onChange={() => setPriceRange(pOpt.value)}
                  className="accent-champagne h-4 w-4 border-stone-200/60 bg-white/70 backdrop-blur-md text-champagne"
                />
                <span className={priceRange === pOpt.value ? "text-[#C98484] font-semibold" : ""}>{pOpt.label}</span>
              </label>
            ))}

            {priceRange === "custom" && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={customMinPrice}
                  onChange={(e) => setCustomMinPrice(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-white/70 backdrop-blur-md px-2.5 py-1.5 text-xs text-[#3B2B2B] outline-none focus:border-[#C98484]"
                />
                <span className="text-[#6F5555]">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={customMaxPrice}
                  onChange={(e) => setCustomMaxPrice(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-white/70 backdrop-blur-md px-2.5 py-1.5 text-xs text-[#3B2B2B] outline-none focus:border-[#C98484]"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Customer Ratings Section */}
      <div className="border-b border-ink/10 pb-4">
        <button
          onClick={() => toggleSection("rating")}
          className="flex w-full items-center justify-between font-medium text-[#3B2B2B] hover:text-[#C98484] transition-colors"
        >
          <span>Customer Rating</span>
          {openSections.rating ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {openSections.rating && (
          <div className="mt-3 flex flex-col gap-2 pl-1">
            {[4.5, 4.0, 3.0].map((starVal) => (
              <label key={starVal} className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                <input
                  type="radio"
                  name="rating"
                  checked={selectedRating === starVal}
                  onChange={() => setSelectedRating(starVal)}
                  className="accent-champagne h-4 w-4 border-stone-200/60 bg-white/70 backdrop-blur-md text-champagne"
                />
                <span className="flex items-center gap-1 text-[#3B2B2B]">
                  {starVal}★ & above
                </span>
              </label>
            ))}
            <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
              <input
                type="radio"
                name="rating"
                checked={selectedRating === null}
                onChange={() => setSelectedRating(null)}
                className="accent-champagne h-4 w-4 border-stone-200/60 bg-white/70 backdrop-blur-md text-champagne"
              />
              <span className="text-[#3B2B2B]">Any Rating</span>
            </label>
          </div>
        )}
      </div>

      {/* Attributes Section (Colors Only) */}
      {colors.length > 0 && (
        <div className="border-b border-ink/10 pb-4">
          <button
            onClick={() => toggleSection("attributes")}
            className="flex w-full items-center justify-between font-medium text-[#3B2B2B] hover:text-[#C98484] transition-colors"
          >
            <span>Color Specs</span>
            {openSections.attributes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {openSections.attributes && (
            <div className="mt-3 flex flex-col gap-4">
              <div>
                <div className="flex flex-wrap gap-1.5">
                  {colors.map((c) => {
                    const isSel = selectedColors.includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => toggleMultiSelect(c, selectedColors, setSelectedColors)}
                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                          isSel
                            ? "bg-[#E0A9A5] text-white border-[#E0A9A5] font-semibold"
                            : "border-stone-200/60 bg-ivory hover:border-[#F1CFCF] hover:text-[#C98484]"
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stock & Offer Section */}
      <div className="pb-4">
        <button
          onClick={() => toggleSection("stock")}
          className="flex w-full items-center justify-between font-medium text-[#3B2B2B] hover:text-[#C98484] transition-colors"
        >
          <span>Availability & Attributes</span>
          {openSections.stock ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {openSections.stock && (
          <div className="mt-3 flex flex-col gap-2.5 pl-1">
            <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={() => setInStockOnly(!inStockOnly)}
                className="accent-champagne h-4 w-4 rounded border-stone-200/60 bg-white/70 backdrop-blur-md text-champagne"
              />
              <span className={inStockOnly ? "text-[#C98484] font-semibold" : "text-[#3B2B2B]"}>In Stock Only</span>
            </label>
            <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={waterproofOnly}
                onChange={() => setWaterproofOnly(!waterproofOnly)}
                className="accent-champagne h-4 w-4 rounded border-stone-200/60 bg-white/70 backdrop-blur-md text-champagne"
              />
              <span className={waterproofOnly ? "text-[#C98484] font-semibold" : "text-[#3B2B2B]"}>Waterproof Only</span>
            </label>
            <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={antiTarnishOnly}
                onChange={() => setAntiTarnishOnly(!antiTarnishOnly)}
                className="accent-champagne h-4 w-4 rounded border-stone-200/60 bg-white/70 backdrop-blur-md text-champagne"
              />
              <span className={antiTarnishOnly ? "text-[#C98484] font-semibold" : "text-[#3B2B2B]"}>Anti-Tarnish Only</span>
            </label>
            <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={flags.isNewArrival}
                onChange={() => setFlags((prev) => ({ ...prev, isNewArrival: !prev.isNewArrival }))}
                className="accent-champagne h-4 w-4 rounded border-stone-200/60 bg-white/70 backdrop-blur-md text-champagne"
              />
              <span className={flags.isNewArrival ? "text-[#C98484] font-semibold" : "text-[#3B2B2B]"}>New Arrivals</span>
            </label>
            <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={flags.isBestSeller}
                onChange={() => setFlags((prev) => ({ ...prev, isBestSeller: !prev.isBestSeller }))}
                className="accent-champagne h-4 w-4 rounded border-stone-200/60 bg-white/70 backdrop-blur-md text-champagne"
              />
              <span className={flags.isBestSeller ? "text-[#C98484] font-semibold" : "text-[#3B2B2B]"}>Best Sellers</span>
            </label>
            <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={flags.isFlashDeal}
                onChange={() => setFlags((prev) => ({ ...prev, isFlashDeal: !prev.isFlashDeal }))}
                className="accent-champagne h-4 w-4 rounded border-stone-200/60 bg-white/70 backdrop-blur-md text-champagne"
              />
              <span className={flags.isFlashDeal ? "text-[#C98484] font-semibold" : "text-[#3B2B2B]"}>Flash Deals Only</span>
            </label>

            <div>
              <span className="text-xs text-[#6F5555] uppercase tracking-wider block mb-2 mt-1">Discount Offer</span>
              <div className="flex flex-wrap gap-1.5">
                {[10, 25, 50].map((dVal) => (
                  <button
                    key={dVal}
                    onClick={() => setSelectedDiscount(selectedDiscount === dVal ? null : dVal)}
                    className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                      selectedDiscount === dVal
                        ? "bg-[#E0A9A5] text-white border-[#E0A9A5] font-semibold"
                        : "border-[#F1CFCF]/60 bg-ivory hover:border-[#C98484]/50 hover:text-[#C98484]"
                    }`}
                  >
                    {dVal}%+ Off
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative min-h-[100svh] w-full pb-20 pt-28 sm:pt-36" style={{ background: "var(--gradient-luxe)" }}>
      <div className="mx-auto max-w-7xl px-6">
      
      {/* Title block */}
      <div className="relative z-10 mb-6 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-champagne font-semibold">Anti Tarnish Jewels Collections</p>
          <h1 className="mt-1 text-3xl md:text-4xl font-serif font-semibold tracking-wide text-charcoalBrown">{title}</h1>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Keyword Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border border-ink/10 glass pl-10 pr-4 py-2.5 text-sm outline-none text-[#3B2B2B] focus:border-[#C98484] focus:ring-1 focus:ring-[#C98484] placeholder:text-[#9B7A7A]"
            />
            <Search size={16} className="absolute left-3.5 top-3 text-[#C98484]/80" />
          </div>

          {/* Sort Selector */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-full border border-ink/10 glass px-4 py-2.5 text-sm outline-none text-[#3B2B2B] cursor-pointer focus:border-[#C98484]"
          >
            <option value="newest">Sort by: Newest</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="popular">Popularity</option>
            <option value="discount">Discount Offer</option>
            <option value="rating">Rating Score</option>
          </select>

          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex items-center gap-2 rounded-full border border-ink/10 glass px-4 py-2.5 text-sm text-[#C98484] hover:bg-[#C98484]/10 lg:hidden transition-colors font-semibold"
          >
            <Filter size={16} />
            Filters
            {filtered.length !== products.length && (
              <span className="h-2 w-2 rounded-full bg-dustyRose inline-block" />
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-64 shrink-0 rounded-3xl border border-ink/10 glass p-6 shadow-[0_20px_60px_rgba(224,169,165,0.15)] h-fit sticky top-24 max-h-[80vh] overflow-y-auto scrollbar-thin">
          {renderFiltersContent()}
        </aside>

        {/* Products Grid Pane */}
        <div className="flex-1">
          {/* Active filter count banner */}
          <div className="mb-4 flex items-center justify-between text-xs text-stoneGray/75">
            <span>
              Showing {filtered.length} of {products.length} Products
            </span>
            {filtered.length !== products.length && (
              <button onClick={resetFilters} className="text-champagne hover:underline font-semibold">
                Clear all filters
              </button>
            )}
          </div>

          {products.length === 0 ? (
            <div className="py-12">
              <EmptyStateCard 
                icon={PackageSearch} 
                text="No products available yet" 
                subtext="Please check back soon." 
              />
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 min-[320px]:grid-cols-2 min-[540px]:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
                {filtered.slice(0, visibleCount).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {filtered.length > visibleCount && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    className="rounded-full border border-[#F1CFCF]/60 glass px-8 py-3 text-sm font-semibold text-[#3B2B2B] hover:bg-white/70 hover:-translate-y-0.5 transition-all shadow-[0_10px_30px_rgba(224,169,165,0.1)] inline-flex items-center gap-2"
                  >
                    Load More Products ({filtered.length - visibleCount} Remaining)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12">
              <EmptyStateCard 
                icon={Search} 
                text="No products match your filters" 
                subtext="Try widening your price range, choosing another category, or clearing the search terms." 
              >
                <button
                  onClick={resetFilters}
                  className="rounded-full bg-champagne px-6 py-2.5 text-sm font-semibold text-charcoalBrown hover:bg-champagne/90 transition-colors"
                >
                  Reset All Filters
                </button>
              </EmptyStateCard>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Sheet Filters Overlay */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-end justify-center lg:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 animate-fade-in" onClick={() => setIsFilterDrawerOpen(false)} />
          
          {/* Bottom Sheet */}
          <aside className="relative w-full bg-white/95 backdrop-blur-sm backdrop-blur-md rounded-t-[2rem] border-t border-ink/10 p-5 shadow-[0_-10px_40px_rgba(224,169,165,0.15)] max-h-[80vh] flex flex-col justify-between z-10 overflow-hidden animate-slide-up">
            {/* Drag Handle Bar */}
            <div className="w-12 h-1 bg-champagne/30 mx-auto rounded-full mb-3 shrink-0" />
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200/20 pb-3 mb-4 shrink-0">
              <span className="text-lg font-serif font-semibold text-champagne uppercase tracking-wider">Refine & Sort</span>
              <button 
                onClick={() => setIsFilterDrawerOpen(false)} 
                className="rounded-full border border-stone-200 p-1 text-champagne hover:bg-champagne/10"
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Filters Content */}
            <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
              {renderFiltersContent()}
            </div>

            {/* Sticky Bottom Actions */}
            <div className="border-t border-stone-200/40 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] mt-4 grid grid-cols-2 gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  resetFilters();
                  setIsFilterDrawerOpen(false);
                }}
                className="rounded-full border border-dustyRose/30 py-2.5 text-xs font-semibold text-dustyRose hover:bg-dustyRose/10 transition-all"
              >
                Clear Filters
              </button>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="rounded-full bg-[#E0A9A5] text-white py-2.5 text-xs font-semibold hover:bg-[#C98484] transition-all"
              >
                Apply ({filtered.length})
              </button>
            </div>
          </aside>
        </div>
      )}
          </div>
    </div>
  );
}
