"use client";

import { useEffect, useState } from "react";
import { getBanners, addBanner, updateBanner, deleteBanner, uploadImage } from "@/lib/firestore";
import { Banner, BannerPlacement } from "@/types";
import { Save, Trash2, Edit, Plus, X, Upload, Loader, CheckCircle, AlertCircle } from "lucide-react";

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);
  
  // File Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    loadBanners();
  }, []);

  async function loadBanners() {
    setLoading(true);
    try {
      const data = await getBanners();
      setBanners(data);
    } catch (err) {
      showToast("error", "Failed to fetch banners.");
    }
    setLoading(false);
  }

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  function openCreate() {
    setEditingBanner({
      title: "",
      subtitle: "",
      imageUrl: "",
      mobileImageUrl: "",
      buttonText: "Shop Now",
      link: "/shop",
      placement: "hero",
      isActive: true,
      priority: 1
    });
    setImageFile(null);
    setMobileImageFile(null);
    setEditorOpen(true);
  }

  function openEdit(banner: Banner) {
    setEditingBanner({ ...banner });
    setImageFile(null);
    setMobileImageFile(null);
    setEditorOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      await deleteBanner(id);
      setBanners(banners.filter(b => b.id !== id));
      showToast("success", "Banner deleted successfully!");
    } catch {
      showToast("error", "Failed to delete banner.");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingBanner) return;

    setUploading(true);
    try {
      let finalImageUrl = editingBanner.imageUrl || "";
      let finalMobileImageUrl = editingBanner.mobileImageUrl || "";

      // Upload main image if chosen
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }
      
      // Upload mobile image if chosen
      if (mobileImageFile) {
        finalMobileImageUrl = await uploadImage(mobileImageFile);
      }

      if (!finalImageUrl) {
        showToast("error", "An image URL or uploaded file is required.");
        setUploading(false);
        return;
      }

      const payload = {
        ...editingBanner,
        imageUrl: finalImageUrl,
        mobileImageUrl: finalMobileImageUrl,
        updatedAt: new Date().toISOString()
      };

      if (editingBanner.id) {
        // Edit mode
        await updateBanner(editingBanner.id, payload);
        setBanners(banners.map(b => b.id === editingBanner.id ? ({ ...b, ...payload } as Banner) : b));
        showToast("success", "Banner updated successfully!");
      } else {
        // Create mode
        const newId = await addBanner({
          ...payload,
          createdAt: new Date().toISOString()
        } as Omit<Banner, "id">);
        setBanners([...banners, { id: newId, ...payload, createdAt: new Date().toISOString() } as Banner]);
        showToast("success", "Banner added successfully!");
      }
      setEditorOpen(false);
      setEditingBanner(null);
    } catch (err) {
      showToast("error", "Failed to save banner.");
    }
    setUploading(false);
  }

  return (
    <div className="space-y-8 animate-fade-in relative pb-10">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-2 rounded-2xl px-5 py-3 shadow-lg border text-sm transition-all ${
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
          <h1 className="text-3xl font-serif font-semibold text-gold tracking-wide">Banners & Promotions</h1>
          <p className="text-sm text-cream/55 mt-1">Configure layout banners, advertisements, and seasonal coupon panels.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-full bg-gold px-5 py-3 font-semibold text-noir hover:bg-gold-light transition-all flex items-center gap-2 shadow-jewel shrink-0 w-fit"
        >
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center text-gold">
          <Loader className="animate-spin" size={32} />
          <span className="ml-2">Loading banners...</span>
        </div>
      ) : banners.length === 0 ? (
        <div className="rounded-[2rem] border border-gold/15 bg-white/[0.03] p-12 text-center shadow-jewel">
          <h3 className="text-xl font-serif text-gold">No Banners Configured</h3>
          <p className="text-cream/55 text-sm mt-2">Click the button above to launch your first promotional banner.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {banners.map((b) => (
            <div key={b.id} className="rounded-3xl border border-gold/15 bg-white/[0.04] overflow-hidden flex flex-col shadow-jewel">
              <div className="relative aspect-[16/9] w-full bg-noir border-b border-gold/10">
                {b.imageUrl ? (
                  <img src={b.imageUrl} alt={b.title} className="object-cover w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center h-full text-cream/35">No Image Preview</div>
                )}
                <span className="absolute top-3 left-3 bg-noir/70 border border-gold/20 text-gold px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                  {b.placement}
                </span>
                {!b.isActive && (
                  <span className="absolute top-3 right-3 bg-rose/90 text-noir px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                    Inactive
                  </span>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-semibold text-cream text-lg leading-snug">{b.title}</h3>
                  {b.subtitle && <p className="text-xs text-gold mt-1 uppercase tracking-wider">{b.subtitle}</p>}
                  <p className="text-xs text-cream/45 mt-2 font-mono truncate">Link: {b.link}</p>
                </div>
                <div className="flex gap-2 border-t border-gold/10 pt-4 mt-4 justify-end">
                  <button
                    onClick={() => openEdit(b)}
                    className="p-2 rounded-full bg-gold/10 text-gold hover:bg-gold hover:text-noir transition-colors"
                    title="Edit Banner"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-2 rounded-full bg-rose/10 text-rose hover:bg-rose hover:text-noir transition-colors"
                    title="Delete Banner"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal Drawer */}
      {editorOpen && editingBanner && (
        <div className="fixed inset-0 z-50 bg-black/80 flex justify-end animate-fade-in">
          <div className="fixed inset-0" onClick={() => setEditorOpen(false)} />
          <aside className="relative h-full w-96 max-w-[90vw] border-l border-gold/20 bg-charcoal p-6 shadow-jewel overflow-y-auto flex flex-col justify-between">
            <form onSubmit={handleSave} className="space-y-5">
              <div className="flex items-center justify-between border-b border-gold/15 pb-4 mb-2">
                <h3 className="text-xl font-serif font-semibold text-gold">
                  {editingBanner.id ? "Edit Banner" : "Add Promo Banner"}
                </h3>
                <button type="button" onClick={() => setEditorOpen(false)} className="text-gold">
                  <X size={18} />
                </button>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Banner Title</label>
                <input
                  required
                  value={editingBanner.title || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 text-sm outline-none text-cream"
                  placeholder="Heading title"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Banner Subtitle</label>
                <input
                  value={editingBanner.subtitle || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 text-sm outline-none text-cream"
                  placeholder="Optional tagline text"
                />
              </div>

              {/* Placement */}
              <div>
                <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Placement Location</label>
                <select
                  value={editingBanner.placement}
                  onChange={(e) => setEditingBanner({ ...editingBanner, placement: e.target.value as BannerPlacement })}
                  className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 text-sm outline-none text-cream cursor-pointer"
                >
                  <option value="hero">Hero Slider Section</option>
                  <option value="promo">Promo Banners Grid</option>
                  <option value="sale">Flash Sale Banner</option>
                  <option value="category">Category Highlights</option>
                  <option value="footer-promo">Footer Row Banner</option>
                </select>
              </div>

              {/* Redirect Link */}
              <div>
                <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Target Action Link</label>
                <input
                  required
                  value={editingBanner.link || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, link: e.target.value })}
                  className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 text-sm outline-none text-cream"
                  placeholder="e.g. /shop?category=Mobiles"
                />
              </div>

              {/* Main Desktop Image Upload */}
              <div>
                <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Desktop Image File</label>
                <div className="flex gap-2">
                  <input
                    value={editingBanner.imageUrl || ""}
                    onChange={(e) => setEditingBanner({ ...editingBanner, imageUrl: e.target.value })}
                    className="flex-1 rounded-full border border-gold/20 bg-noir px-4 py-2 text-xs outline-none text-cream"
                    placeholder="Image URL link"
                  />
                  <label className="rounded-full bg-gold/15 hover:bg-gold/25 px-4 py-2 text-xs font-semibold text-gold cursor-pointer flex items-center gap-1">
                    <Upload size={12} />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>
                {imageFile && <p className="text-[10px] text-emerald-400 mt-1">Pending: {imageFile.name}</p>}
              </div>

              {/* Mobile Image Upload */}
              <div>
                <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Mobile Image File (Optional)</label>
                <div className="flex gap-2">
                  <input
                    value={editingBanner.mobileImageUrl || ""}
                    onChange={(e) => setEditingBanner({ ...editingBanner, mobileImageUrl: e.target.value })}
                    className="flex-1 rounded-full border border-gold/20 bg-noir px-4 py-2 text-xs outline-none text-cream"
                    placeholder="Mobile Image URL"
                  />
                  <label className="rounded-full bg-gold/15 hover:bg-gold/25 px-4 py-2 text-xs font-semibold text-gold cursor-pointer flex items-center gap-1">
                    <Upload size={12} />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setMobileImageFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>
                {mobileImageFile && <p className="text-[10px] text-emerald-400 mt-1">Pending: {mobileImageFile.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Button Text */}
                <div>
                  <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">CTA Button Text</label>
                  <input
                    value={editingBanner.buttonText || ""}
                    onChange={(e) => setEditingBanner({ ...editingBanner, buttonText: e.target.value })}
                    className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2 text-xs outline-none text-cream"
                    placeholder="Shop Now"
                  />
                </div>
                {/* Priority */}
                <div>
                  <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Sort Priority</label>
                  <input
                    type="number"
                    value={editingBanner.priority || 1}
                    onChange={(e) => setEditingBanner({ ...editingBanner, priority: Number(e.target.value) })}
                    className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2 text-xs outline-none text-cream"
                  />
                </div>
              </div>

              {/* Status Switch */}
              <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!editingBanner.isActive}
                  onChange={(e) => setEditingBanner({ ...editingBanner, isActive: e.target.checked })}
                  className="accent-gold h-4 w-4 rounded border-gold/30 bg-noir text-gold"
                />
                <span>Enable and Publish this banner</span>
              </label>

              <button
                type="submit"
                disabled={uploading}
                className="mt-6 w-full rounded-full bg-gold py-3 text-sm font-semibold text-noir hover:bg-gold-light transition-all flex items-center justify-center gap-2"
              >
                {uploading ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
                {editingBanner.id ? "Update Banner" : "Add Banner"}
              </button>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}
