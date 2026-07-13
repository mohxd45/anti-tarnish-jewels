"use client";


import { useEffect, useState } from "react";
import { getHomepageSections, saveHomepageSections, getProducts, getCategories , logActivity } from "@/lib/firestore";
import { HomepageSection, Product, Category } from "@/types";
import { Save, ArrowUp, ArrowDown, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { HeartLoader } from "@/components/ui/HeartLoader";
import { Button } from "@/components/ui/button";

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
      } catch (err: any) {
        console.error("Home Layout fetch error:", err);
        showToast("error", "Failed to fetch homepage sections structure. " + (err.message || ""));
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
      <div className="flex h-[50vh] items-center justify-center text-adminMuted">
        <HeartLoader text="Loading layout setup..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl px-5 py-3 shadow-sm border text-sm transition-all ${
          toast.type === "success" 
            ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
            : "bg-red-50 text-red-600 border-red-200"
        }`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-adminSidebar tracking-tight">Homepage Layout Manager</h1>
          <p className="text-adminMuted mt-1">Configure active sections, rename headings, and change layout display sequences.</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full shadow-sm bg-adminRose text-white hover:bg-adminRose/90 border-none shrink-0"
        >
          {saving ? <HeartLoader size="sm" text="Saving..." /> : <><Save className="h-4 w-4 mr-2" />Save Layout</>}
        </Button>
      </div>

      <div className="space-y-4 max-w-4xl">
        {sections.map((section, idx) => (
          <div
            key={section.id}
            className={`rounded-2xl border p-5 bg-white transition-all shadow-sm ${
              section.isActive ? "border-adminBorder" : "border-adminBorder/50 opacity-60"
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
                  className="p-1 rounded-full hover:bg-adminBg text-adminMuted hover:text-adminSidebar disabled:opacity-20 transition-all"
                  title="Move Up"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  disabled={idx === sections.length - 1}
                  onClick={() => moveSection(idx, "down")}
                  className="p-1 rounded-full hover:bg-adminBg text-adminMuted hover:text-adminSidebar disabled:opacity-20 transition-all"
                  title="Move Down"
                >
                  <ArrowDown size={14} />
                </button>
              </div>

              {/* Status Eye Toggler */}
              <button
                type="button"
                onClick={() => handleToggle(section.id)}
                className={`p-3 rounded-full border transition-all ${
                  section.isActive 
                    ? "bg-adminRose/10 text-adminRose border-adminRose/20" 
                    : "bg-adminBg text-adminMuted border-adminBorder"
                }`}
                title={section.isActive ? "Disable Section" : "Enable Section"}
              >
                {section.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>

              {/* Details info */}
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-adminMuted block">
                  Section {section.order} • {section.type}
                </span>
                <input
                  value={section.title}
                  onChange={(e) => handleTitleChange(section.id, e.target.value)}
                  className="mt-1 font-serif text-lg font-semibold text-adminSidebar bg-transparent border-b border-transparent hover:border-adminBorder focus:border-adminGold outline-none py-0.5 px-1 w-full max-w-xs"
                />
              </div>
            </div>

            {/* Right Col: Filtering parameters */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              {/* Max Products shown */}
              {["flash-deals", "trending", "new-arrivals", "best-sellers", "custom-category"].includes(section.type) && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-adminMuted uppercase tracking-wider font-semibold">Max Items</span>
                  <input
                    type="number"
                    value={section.maxProducts}
                    onChange={(e) => handleMaxProductsChange(section.id, Number(e.target.value))}
                    className="w-20 rounded-md border border-adminBorder bg-white focus:ring-1 focus:ring-adminGold px-3 py-1.5 outline-none text-adminSidebar"
                    min={1}
                    max={24}
                  />
                </div>
              )}

              {/* Category Filter dropdown */}
              {["custom-category", "category-grid"].includes(section.type) && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-adminMuted uppercase tracking-wider font-semibold">Filter Category</span>
                  <select
                    value={section.categoryFilter || ""}
                    onChange={(e) => handleCategoryFilterChange(section.id, e.target.value)}
                    className="rounded-md border border-adminBorder bg-white focus:ring-1 focus:ring-adminGold px-3 py-1.5 outline-none text-adminSidebar cursor-pointer min-w-[120px]"
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
