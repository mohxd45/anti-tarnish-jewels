"use client";

import { useEffect, useState } from "react";
import { getSEOSettings, saveSEOSettings, uploadImage } from "@/lib/firestore";
import { SEOSettings } from "@/types";
import { Save, Search, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { PageLoader } from "@/components/ui/PageLoader";
import { LoadingButton } from "@/components/ui/LoadingButton";

export default function SEOPage() {
  const [seo, setSeo] = useState<SEOSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ogFile, setOgFile] = useState<File | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    loadSEOSettings();
  }, []);

  async function loadSEOSettings() {
    setLoading(true);
    try {
      const data = await getSEOSettings();
      setSeo(data);
    } catch (err: any) {
      console.error("SEO Settings fetch error:", err);
      showToast("error", "Failed to fetch SEO settings. " + (err.message || ""));
    }
    setLoading(false);
  }

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!seo) return;

    setSaving(true);
    try {
      let ogImage = seo.ogImage || "";
      if (ogFile) {
        ogImage = await uploadImage(ogFile);
      }

      const payload = {
        ...seo,
        ogImage
      };

      await saveSEOSettings(payload);
      setSeo(payload);
      setOgFile(null);
      showToast("success", "SEO configurations updated successfully!");
    } catch {
      showToast("error", "Failed to save SEO settings.");
    }
    setSaving(false);
  }

  if (loading) {
    return <PageLoader text="Loading SEO metrics..." />;
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

      <div>
        <h1 className="text-3xl font-serif font-semibold text-gold tracking-wide">Search Engine Optimization (SEO)</h1>
        <p className="text-sm text-cream/55 mt-1">Manage global search parameters, title tags, and social media link preview images.</p>
      </div>

      {seo && (
        <form onSubmit={handleSave} className="rounded-[2rem] border border-gold/15 bg-white/[0.03] p-6 md:p-8 shadow-jewel space-y-6">
          <div className="flex items-center gap-2 text-gold border-b border-gold/10 pb-3">
            <Search size={18} />
            <h2 className="text-lg font-serif font-semibold">Metadata & OpenGraph Customization</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Homepage Title */}
            <div>
              <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Homepage SEO Title</label>
              <input
                required
                value={seo.homepageTitle || ""}
                onChange={(e) => setSeo({ ...seo, homepageTitle: e.target.value })}
                className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 text-sm outline-none text-cream focus:border-gold/50"
                placeholder="Anti Tarnish Jewels | Waterproof & Tarnish-Free Jewellery Online"
              />
            </div>

            {/* Homepage Description */}
            <div>
              <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Homepage Meta Description</label>
              <input
                required
                value={seo.homepageDescription || ""}
                onChange={(e) => setSeo({ ...seo, homepageDescription: e.target.value })}
                className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 text-sm outline-none text-cream focus:border-gold/50"
                placeholder="Brief meta snippet describing Anti Tarnish Jewels..."
              />
            </div>

            {/* Category Template */}
            <div>
              <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Category Title Template</label>
              <input
                required
                value={seo.categoryTitleTemplate || ""}
                onChange={(e) => setSeo({ ...seo, categoryTitleTemplate: e.target.value })}
                className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 text-sm outline-none text-cream focus:border-gold/50"
                placeholder="%s | Anti Tarnish Jewels"
              />
              <span className="text-[10px] text-cream/40 mt-1 block">Use `%s` as a placeholder for the category name.</span>
            </div>

            {/* Product Template */}
            <div>
              <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Product Title Template</label>
              <input
                required
                value={seo.productTitleTemplate || ""}
                onChange={(e) => setSeo({ ...seo, productTitleTemplate: e.target.value })}
                className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 text-sm outline-none text-cream focus:border-gold/50"
                placeholder="%s | Buy at Anti Tarnish Jewels"
              />
              <span className="text-[10px] text-cream/40 mt-1 block">Use `%s` as a placeholder for the product name.</span>
            </div>

            {/* Social Sharing Text */}
            <div className="md:col-span-2">
              <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Social Sharing Text</label>
              <input
                value={seo.socialText || ""}
                onChange={(e) => setSeo({ ...seo, socialText: e.target.value })}
                className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 text-sm outline-none text-cream focus:border-gold/50"
                placeholder="Text displayed when users share links on WhatsApp/Facebook."
              />
            </div>

            {/* OpenGraph Image Upload */}
            <div className="md:col-span-2">
              <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">OpenGraph Social Preview Image</label>
              <div className="flex gap-2">
                <input
                  value={seo.ogImage || ""}
                  onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                  className="flex-1 rounded-full border border-gold/20 bg-noir px-4 py-2 text-xs outline-none text-cream focus:border-gold/50"
                  placeholder="Image URL link for social preview cards"
                />
                <label className="rounded-full bg-gold/15 hover:bg-gold/25 px-4 py-2 text-xs font-semibold text-gold cursor-pointer flex items-center gap-1">
                  <Upload size={12} />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setOgFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
              {ogFile && <p className="text-[10px] text-emerald-400 mt-1">Pending: {ogFile.name}</p>}
              
              {/* Preview image */}
              {seo.ogImage && (
                <div className="mt-4 max-w-sm rounded-xl overflow-hidden border border-gold/15 aspect-[1.91/1] relative bg-noir">
                  <img src={seo.ogImage} alt="OG Social Preview" className="object-cover w-full h-full" />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <LoadingButton
              type="submit"
              loading={saving}
              loadingText="Saving..."
              className="rounded-full bg-gold px-6 py-3 font-semibold text-noir hover:bg-gold-light transition-all flex items-center gap-2 shadow-jewel"
            >
              <Save size={16} />
              Save SEO Metadata Settings
            </LoadingButton>
          </div>
        </form>
      )}
    </div>
  );
}
