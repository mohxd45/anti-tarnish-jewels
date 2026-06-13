"use client";

import { useEffect, useState } from "react";
import { getHomepageSections, saveHomepageSections, getProducts, getCategories } from "@/lib/firestore";
import { HomepageSection, Product, Category } from "@/types";
import { Save, Loader, ArrowUp, ArrowDown, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

export default function HomepageSectionsPage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const fetchedSections = await getHomepageSections();
        const fetchedProducts = await getProducts();
        const fetchedCategories = await getCategories();
        
        // Sort sections by order ascending
        setSections(fetchedSections.sort((a, b) => a.order - b.order));
        setProducts(fetchedProducts);
        setCategories(fetchedCategories);
      } catch {
        showToast("error", "Failed to fetch homepage sections structure.");
      }
      setLoading(false);
    }
    loadData();
  }, []);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  const moveSection = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= sections.length) return;

    const list = [...sections];
    // Swap items
    const temp = list[index];
    list[index] = list[nextIndex];
    list[nextIndex] = temp;

    // Recompute orders
    const updated = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    setSections(updated);
  };

  const handleToggle = (id: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  const handleTitleChange = (id: string, newTitle: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, title: newTitle } : s));
  };

  const handleMaxProductsChange = (id: string, count: number) => {
    setSections(sections.map(s => s.id === id ? { ...s, maxProducts: count } : s));
  };

  const handleCategoryFilterChange = (id: string, cat: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, categoryFilter: cat } : s));
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveHomepageSections(sections);
      showToast("success", "Homepage layout structure updated successfully!");
    } catch {
      showToast("error", "Failed to save homepage layout.");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-gold">
        <Loader className="animate-spin" size={32} />
        <span className="ml-2 font-medium">Loading layout setup...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in pb-10">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl px-5 py-3 shadow-lg border text-sm transition-all ${
          toast.type === "success" 
            ? "bg-emerald-950/90 text-emerald-400 border-emerald-500/20" 
            : "bg-rose-950/90 text-rose-400 border-rose-500/20"
        }`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-gold tracking-wide">Homepage layout Manager</h1>
          <p className="text-sm text-cream/55 mt-1">Configure active sections, rename headings, and change layout display sequences.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-gold px-5 py-3 font-semibold text-noir hover:bg-gold-light transition-all flex items-center gap-2 shadow-jewel shrink-0 w-fit"
        >
          {saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
          Save Homepage Layout
        </button>
      </div>

      <div className="space-y-4">
        {sections.map((section, idx) => (
          <div
            key={section.id}
            className={`rounded-3xl border p-5 bg-white/[0.03] transition-all ${
              section.isActive ? "border-gold/20" : "border-gold/5 opacity-55"
            } flex flex-col md:flex-row md:items-center justify-between gap-4`}
          >
            {/* Left Col: Order and Visibility Toggle */}
            <div className="flex items-center gap-3">
              {/* Order Controls */}
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveSection(idx, "up")}
                  className="p-1 rounded-full hover:bg-gold/15 text-gold/60 hover:text-gold disabled:opacity-20 transition-all"
                  title="Move Up"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  disabled={idx === sections.length - 1}
                  onClick={() => moveSection(idx, "down")}
                  className="p-1 rounded-full hover:bg-gold/15 text-gold/60 hover:text-gold disabled:opacity-20 transition-all"
                  title="Move Down"
                >
                  <ArrowDown size={14} />
                </button>
              </div>

              {/* Status Eye Toggler */}
              <button
                type="button"
                onClick={() => handleToggle(section.id)}
                className={`p-3 rounded-2xl border transition-all ${
                  section.isActive 
                    ? "bg-gold/10 text-gold border-gold/20" 
                    : "bg-noir/30 text-cream/30 border-gold/5"
                }`}
                title={section.isActive ? "Disable Section" : "Enable Section"}
              >
                {section.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>

              {/* Details info */}
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gold block">
                  Section {section.order} • {section.type}
                </span>
                <input
                  value={section.title}
                  onChange={(e) => handleTitleChange(section.id, e.target.value)}
                  className="mt-1 font-serif text-lg font-semibold text-cream bg-transparent border-b border-transparent hover:border-gold/20 focus:border-gold outline-none py-0.5 px-1"
                />
              </div>
            </div>

            {/* Right Col: Filtering parameters */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              {/* Max Products shown */}
              {["flash-deals", "trending", "new-arrivals", "best-sellers", "custom-category"].includes(section.type) && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-cream/45 uppercase tracking-wider">Max Items</span>
                  <input
                    type="number"
                    value={section.maxProducts}
                    onChange={(e) => handleMaxProductsChange(section.id, Number(e.target.value))}
                    className="w-16 rounded-full border border-gold/20 bg-noir px-3 py-1.5 outline-none text-cream"
                    min={1}
                    max={24}
                  />
                </div>
              )}

              {/* Category Filter dropdown */}
              {["custom-category", "category-grid"].includes(section.type) && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-cream/45 uppercase tracking-wider">Filter Category</span>
                  <select
                    value={section.categoryFilter || ""}
                    onChange={(e) => handleCategoryFilterChange(section.id, e.target.value)}
                    className="rounded-full border border-gold/20 bg-noir px-3 py-1.5 outline-none text-cream cursor-pointer"
                  >
                    <option value="">Default All</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
