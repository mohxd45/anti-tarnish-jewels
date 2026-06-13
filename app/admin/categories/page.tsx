"use client";

import { useEffect, useState } from "react";
import { getCategories, addCategory, updateCategory, deleteCategory, uploadImage } from "@/lib/firestore";
import { Category } from "@/types";
import { Save, Trash2, Edit, Plus, X, Upload, Loader, CheckCircle, AlertCircle } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  // Upload States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Subcategory input string (comma separated)
  const [subcatText, setSubcatText] = useState("");

  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      showToast("error", "Failed to fetch categories list.");
    }
    setLoading(false);
  }

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  function openCreate() {
    setEditingCategory({
      name: "",
      slug: "",
      imageUrl: "",
      bannerUrl: "",
      subcategories: [],
      priority: 1,
      isActive: true
    });
    setSubcatText("");
    setImageFile(null);
    setBannerFile(null);
    setEditorOpen(true);
  }

  function openEdit(cat: Category) {
    setEditingCategory({ ...cat });
    setSubcatText(cat.subcategories.join(", "));
    setImageFile(null);
    setBannerFile(null);
    setEditorOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this category? All products using it will become uncategorized.")) return;
    try {
      await deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      showToast("success", "Category deleted successfully!");
    } catch {
      showToast("error", "Failed to delete category.");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCategory) return;

    setUploading(true);
    try {
      let finalImageUrl = editingCategory.imageUrl || "";
      let finalBannerUrl = editingCategory.bannerUrl || "";

      // Upload files if selected
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }
      if (bannerFile) {
        finalBannerUrl = await uploadImage(bannerFile);
      }

      // Format subcategories
      const subcategories = subcatText
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      // Auto-generate slug from name if empty
      const slug = editingCategory.slug || (editingCategory.name || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const payload = {
        ...editingCategory,
        slug,
        imageUrl: finalImageUrl,
        bannerUrl: finalBannerUrl,
        subcategories
      };

      if (editingCategory.id) {
        // Edit mode
        await updateCategory(editingCategory.id, payload);
        setCategories(
          categories
            .map(c => c.id === editingCategory.id ? ({ ...c, ...payload } as Category) : c)
            .sort((a, b) => a.priority - b.priority)
        );
        showToast("success", "Category updated successfully!");
      } else {
        // Create mode
        const newId = await addCategory(payload as Omit<Category, "id">);
        setCategories(
          [...categories, { id: newId, ...payload } as Category]
            .sort((a, b) => a.priority - b.priority)
        );
        showToast("success", "Category created successfully!");
      }
      setEditorOpen(false);
      setEditingCategory(null);
    } catch {
      showToast("error", "Failed to save category.");
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
          <h1 className="text-3xl font-serif font-semibold text-gold tracking-wide">Category Management</h1>
          <p className="text-sm text-cream/55 mt-1">Manage shop collections, dynamic dropdown labels, and display priorities.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-full bg-gold px-5 py-3 font-semibold text-noir hover:bg-gold-light transition-all flex items-center gap-2 shadow-jewel shrink-0 w-fit"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center text-gold">
          <Loader className="animate-spin" size={32} />
          <span className="ml-2">Loading categories...</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-[2rem] border border-gold/15 bg-white/[0.03] p-12 text-center shadow-jewel">
          <h3 className="text-xl font-serif text-gold">No Categories Configured</h3>
          <p className="text-cream/55 text-sm mt-2">Click the button above to define your first shopping category.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[2rem] border border-gold/15 bg-white/[0.04]">
          <table className="w-full min-w-[700px] text-left text-sm text-cream/80">
            <thead className="bg-noir text-gold uppercase tracking-wider text-xs">
              <tr>
                <th className="p-5">Icon</th>
                <th>Category Name</th>
                <th>Slug Link</th>
                <th>Subcategories</th>
                <th>Priority</th>
                <th>Status</th>
                <th className="text-right p-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-5">
                    {c.imageUrl ? (
                      <img src={c.imageUrl} alt={c.name} className="w-10 h-10 object-cover rounded-xl border border-gold/20" />
                    ) : (
                      <div className="w-10 h-10 bg-noir border border-gold/10 rounded-xl flex items-center justify-center text-[10px] text-cream/35">No Icon</div>
                    )}
                  </td>
                  <td className="font-semibold text-cream">{c.name}</td>
                  <td className="font-mono text-xs text-cream/50">/shop?category={c.slug}</td>
                  <td>
                    <div className="flex flex-wrap gap-1 max-w-[260px]">
                      {c.subcategories.map(sub => (
                        <span key={sub} className="bg-gold/10 text-gold text-[10px] px-2 py-0.5 rounded-full">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="font-semibold text-gold">{c.priority}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                      c.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose/10 text-rose"
                    }`}>
                      {c.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-2 rounded-full bg-gold/10 text-gold hover:bg-gold hover:text-noir transition-colors"
                        title="Edit Category"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-2 rounded-full bg-rose/10 text-rose hover:bg-rose hover:text-noir transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor Modal Drawer */}
      {editorOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/80 flex justify-end animate-fade-in">
          <div className="fixed inset-0" onClick={() => setEditorOpen(false)} />
          <aside className="relative h-full w-96 max-w-[90vw] border-l border-gold/20 bg-charcoal p-6 shadow-jewel overflow-y-auto flex flex-col justify-between">
            <form onSubmit={handleSave} className="space-y-5">
              <div className="flex items-center justify-between border-b border-gold/15 pb-4 mb-2">
                <h3 className="text-xl font-serif font-semibold text-gold">
                  {editingCategory.id ? "Edit Category" : "Add Category"}
                </h3>
                <button type="button" onClick={() => setEditorOpen(false)} className="text-gold">
                  <X size={18} />
                </button>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Category Name</label>
                <input
                  required
                  value={editingCategory.name || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 text-sm outline-none text-cream"
                  placeholder="e.g. Home & Kitchen"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Slug URL (Optional)</label>
                <input
                  value={editingCategory.slug || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 text-sm outline-none text-cream"
                  placeholder="Auto-generated if empty"
                />
              </div>

              {/* Subcategories (comma separated text) */}
              <div>
                <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Subcategories (Comma separated)</label>
                <input
                  value={subcatText}
                  onChange={(e) => setSubcatText(e.target.value)}
                  className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 text-sm outline-none text-cream"
                  placeholder="e.g. Blenders, Cutlery, Cookware"
                />
              </div>

              {/* Icon Image Upload */}
              <div>
                <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Category Icon/Image</label>
                <div className="flex gap-2">
                  <input
                    value={editingCategory.imageUrl || ""}
                    onChange={(e) => setEditingCategory({ ...editingCategory, imageUrl: e.target.value })}
                    className="flex-1 rounded-full border border-gold/20 bg-noir px-4 py-2 text-xs outline-none text-cream"
                    placeholder="Icon URL link"
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

              {/* Banner Image Upload */}
              <div>
                <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Category Shop Banner</label>
                <div className="flex gap-2">
                  <input
                    value={editingCategory.bannerUrl || ""}
                    onChange={(e) => setEditingCategory({ ...editingCategory, bannerUrl: e.target.value })}
                    className="flex-1 rounded-full border border-gold/20 bg-noir px-4 py-2 text-xs outline-none text-cream"
                    placeholder="Banner URL link"
                  />
                  <label className="rounded-full bg-gold/15 hover:bg-gold/25 px-4 py-2 text-xs font-semibold text-gold cursor-pointer flex items-center gap-1">
                    <Upload size={12} />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>
                {bannerFile && <p className="text-[10px] text-emerald-400 mt-1">Pending: {bannerFile.name}</p>}
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs uppercase tracking-wider text-gold font-semibold block mb-1">Priority / Sort Index</label>
                <input
                  type="number"
                  value={editingCategory.priority || 1}
                  onChange={(e) => setEditingCategory({ ...editingCategory, priority: Number(e.target.value) })}
                  className="w-full rounded-full border border-gold/20 bg-noir px-4 py-2.5 text-sm outline-none text-cream"
                  min={1}
                />
              </div>

              {/* Status Switch */}
              <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!editingCategory.isActive}
                  onChange={(e) => setEditingCategory({ ...editingCategory, isActive: e.target.checked })}
                  className="accent-gold h-4 w-4 rounded border-gold/30 bg-noir text-gold"
                />
                <span>Active (Enable in Shop filtering)</span>
              </label>

              <button
                type="submit"
                disabled={uploading}
                className="mt-6 w-full rounded-full bg-gold py-3 text-sm font-semibold text-noir hover:bg-gold-light transition-all flex items-center justify-center gap-2"
              >
                {uploading ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
                {editingCategory.id ? "Update Category" : "Create Category"}
              </button>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}
