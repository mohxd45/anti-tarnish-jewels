"use client";


import { useEffect, useState } from "react";
import { getCategories, addCategory, updateCategory, deleteCategory, uploadImage , logActivity } from "@/lib/firestore";
import { Category } from "@/types";
import { Save, Trash2, Edit2, Plus, X, Upload, Loader } from "lucide-react";
import { AdminCard, StatusBadge } from "@/components/admin/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { HeartLoader } from "@/components/ui/HeartLoader";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</Label>
      {children}
    </div>
  );
}

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

  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      toast.error("Failed to fetch categories list.");
    }
    setLoading(false);
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
    setSubcatText((cat.subcategories || []).join(", "));
    setImageFile(null);
    setBannerFile(null);
    setEditorOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this category? All products using it will become uncategorized.")) return;
    setDeletingId(id);
    try {
      await deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      toast.success("Category deleted successfully!");
    } catch {
      toast.error("Failed to delete category.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCategory) return;

    setUploading(true);
    try {
      let finalImageUrl = editingCategory.imageUrl || "";
      let finalBannerUrl = editingCategory.bannerUrl || "";

      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }
      if (bannerFile) {
        finalBannerUrl = await uploadImage(bannerFile);
      }

      const subcategories = subcatText
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);

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
        await updateCategory(editingCategory.id, payload);
        setCategories(
          categories
            .map(c => c.id === editingCategory.id ? ({ ...c, ...payload } as Category) : c)
            .sort((a, b) => a.priority - b.priority)
        );
        toast.success("Category updated successfully!");
      } else {
        const newId = await addCategory(payload as Omit<Category, "id">);
        setCategories(
          [...categories, { id: newId, ...payload } as Category]
            .sort((a, b) => a.priority - b.priority)
        );
        toast.success("Category created successfully!");
      }
      setEditorOpen(false);
      setEditingCategory(null);
    } catch {
      toast.error("Failed to save category.");
    }
    setUploading(false);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold text-foreground tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-1">Organize your catalog collections</p>
        </div>
        <Button onClick={openCreate} className="bg-[var(--gradient-rose)] text-white hover:opacity-90 border-none shrink-0 w-fit">
          <Plus className="h-4 w-4 mr-1" /> Add Category
        </Button>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center text-muted-foreground">
          <Loader className="animate-spin" size={24} />
          <span className="ml-2">Loading categories...</span>
        </div>
      ) : categories.length === 0 ? (
        <AdminCard className="p-12 text-center shadow-sm">
          <h3 className="text-xl font-display text-foreground">No Categories Configured</h3>
          <p className="text-muted-foreground text-sm mt-2">Click the button above to define your first shopping category.</p>
        </AdminCard>
      ) : (
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
          {categories.map((c) => (
            <div key={c.id} className="glass-card p-4 flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/40 hover:bg-card/60 transition-colors shadow-sm">
              <div className="aspect-[4/3] rounded-lg bg-secondary overflow-hidden relative border border-border/50">
                {c.imageUrl ? (
                  <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">✨</div>
                )}
                {c.bannerUrl && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/40" title="Has Banner" />
                )}
              </div>
              <div className="flex items-start justify-between gap-2 mt-1">
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-medium leading-tight truncate text-foreground">{c.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Priority #{c.priority}</p>
                </div>
                <StatusBadge status={c.isActive ? "Active" : "Inactive"} />
              </div>
              
              <div className="text-[10px] text-muted-foreground line-clamp-1 min-h-[15px]">
                {c.subcategories?.length > 0 ? c.subcategories.join(", ") : "No subcategories"}
              </div>

              <div className="flex gap-1.5 mt-auto pt-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(c)} className="flex-1 rounded-xl h-8 text-xs">
                  <Edit2 className="h-3 w-3 mr-1" />Edit
                </Button>
                <Button size="icon" variant="ghost" disabled={deletingId === c.id} onClick={() => handleDelete(c.id)} className="h-8 w-8 rounded-xl text-dustyRose hover:text-dustyRose hover:bg-dustyRose/10">
                  {deletingId === c.id ? <HeartLoader size="sm" text="" /> : <Trash2 className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal Drawer */}
      {editorOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end animate-in fade-in">
          <div className="fixed inset-0" onClick={() => setEditorOpen(false)} />
          <aside className="relative h-full w-[400px] max-w-[100vw] border-l border-border/60 bg-[var(--background)] shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right">
            
            <div className="flex justify-between items-center border-b border-border/60 p-5 bg-card/40 backdrop-blur-sm">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Category Builder</span>
                <h3 className="text-xl font-display font-semibold text-foreground mt-1">
                  {editingCategory.id ? "Edit Category" : "Add Category"}
                </h3>
              </div>
              <button type="button" onClick={() => setEditorOpen(false)} className="rounded-full p-2 text-muted-foreground hover:bg-secondary transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 p-6 space-y-6 overflow-y-auto scrollbar-thin">
              <form id="category-form" onSubmit={handleSave} className="space-y-5">
                
                <Field label="Category Name">
                  <Input
                    required
                    value={editingCategory.name || ""}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    placeholder="e.g. Necklaces"
                    className="rounded-xl"
                  />
                </Field>

                <Field label="Slug URL (Optional)">
                  <Input
                    value={editingCategory.slug || ""}
                    onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                    placeholder="Auto-generated if empty"
                    className="rounded-xl"
                  />
                </Field>

                <Field label="Subcategories (Comma separated)">
                  <Textarea
                    rows={2}
                    value={subcatText}
                    onChange={(e) => setSubcatText(e.target.value)}
                    placeholder="e.g. Chokers, Pendants, Chains"
                    className="rounded-xl resize-none"
                  />
                </Field>

                <Field label="Category Icon">
                  <div className="flex gap-2 items-center">
                    {(imageFile || editingCategory.imageUrl) && (
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-secondary border border-border overflow-hidden">
                        <img src={imageFile ? URL.createObjectURL(imageFile) : editingCategory.imageUrl} alt="" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <Input
                      value={editingCategory.imageUrl || ""}
                      onChange={(e) => setEditingCategory({ ...editingCategory, imageUrl: e.target.value })}
                      placeholder="Icon URL link"
                      className="rounded-xl"
                    />
                    <label className="shrink-0 rounded-xl bg-secondary hover:bg-secondary/80 px-3 py-2 text-xs font-semibold cursor-pointer border border-border transition-colors">
                      <Upload className="h-4 w-4 inline-block" />
                      <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="hidden" />
                    </label>
                  </div>
                </Field>

                <Field label="Category Banner (Optional)">
                  <div className="flex gap-2 items-center">
                    {(bannerFile || editingCategory.bannerUrl) && (
                      <div className="h-8 w-16 shrink-0 rounded bg-secondary border border-border overflow-hidden">
                        <img src={bannerFile ? URL.createObjectURL(bannerFile) : editingCategory.bannerUrl} alt="" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <Input
                      value={editingCategory.bannerUrl || ""}
                      onChange={(e) => setEditingCategory({ ...editingCategory, bannerUrl: e.target.value })}
                      placeholder="Banner URL link"
                      className="rounded-xl"
                    />
                    <label className="shrink-0 rounded-xl bg-secondary hover:bg-secondary/80 px-3 py-2 text-xs font-semibold cursor-pointer border border-border transition-colors">
                      <Upload className="h-4 w-4 inline-block" />
                      <input type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files?.[0] || null)} className="hidden" />
                    </label>
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Sort Priority">
                    <Input
                      type="number"
                      value={editingCategory.priority || 1}
                      onChange={(e) => setEditingCategory({ ...editingCategory, priority: Number(e.target.value) })}
                      min={1}
                      className="rounded-xl"
                    />
                  </Field>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 text-sm cursor-pointer select-none border border-border/60 bg-card/40 p-3 rounded-xl hover:bg-card/60 transition-colors">
                    <input
                      type="checkbox"
                      checked={!!editingCategory.isActive}
                      onChange={(e) => setEditingCategory({ ...editingCategory, isActive: e.target.checked })}
                      className="accent-primary h-4 w-4 rounded border-border text-primary"
                    />
                    <div>
                      <div className="font-medium">Active Status</div>
                      <div className="text-[10px] text-muted-foreground">Show in shop navigation</div>
                    </div>
                  </label>
                </div>

              </form>
            </div>

            <div className="border-t border-border/60 p-5 bg-card/40 backdrop-blur-sm flex justify-end gap-3 mt-auto">
              <Button variant="outline" onClick={() => setEditorOpen(false)} className="rounded-full">Cancel</Button>
              <Button form="category-form" type="submit" disabled={uploading} className="rounded-full bg-[var(--gradient-rose)] text-white hover:opacity-90 border-none min-w-[120px]">
                {uploading ? <HeartLoader size="sm" text="" /> : <><Save className="h-4 w-4 mr-1" /> {editingCategory.id ? "Update" : "Create"}</>}
              </Button>
            </div>
            
          </aside>
        </div>
      )}
    </div>
  );
}
