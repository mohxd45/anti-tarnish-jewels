"use client";

import { useEffect, useState } from "react";
import { getProducts, deleteProduct, updateProduct, getCategories, uploadImage } from "@/lib/firestore";
import { Product, Category } from "@/types";
import { formatPrice, slugify } from "@/lib/utils";
import { AdminCard, StatusBadge } from "@/components/admin/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Trash2, X, Search, Plus, Filter, Image as ImageIcon, Sparkles, Upload, Star } from "lucide-react";
import { HeartLoader } from "@/components/ui/HeartLoader";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import Link from "next/link";
import { toast } from "sonner";

export default function ManageProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [badgeFilter, setBadgeFilter] = useState("All");
  
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Drawer/Modal State for editing
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  // Edit fields state
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editSubCategory, setEditSubCategory] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editRegularPrice, setEditRegularPrice] = useState(0);
  const [editSalePrice, setEditSalePrice] = useState(0);
  const [editStock, setEditStock] = useState(0);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editWarranty, setEditWarranty] = useState("");
  const [editReturnPolicy, setEditReturnPolicy] = useState("");

  // Edit jewellery fields state
  const [editCollection, setEditCollection] = useState("");
  const [editMaterial, setEditMaterial] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editSize, setEditSize] = useState("");
  const [editOccasion, setEditOccasion] = useState("");
  const [editCareInstructions, setEditCareInstructions] = useState("");
  const [editWaterproof, setEditWaterproof] = useState(false);
  const [editAntiTarnish, setEditAntiTarnish] = useState(false);
  const [editJewelleryType, setEditJewelleryType] = useState("");
  const [editPlating, setEditPlating] = useState("");
  const [editStoneType, setEditStoneType] = useState("");
  const [editBadgesText, setEditBadgesText] = useState("");
  
  // Specifications
  const [editSpecs, setEditSpecs] = useState<{ key: string; value: string }[]>([]);
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  // Promo Flags
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editIsBestSeller, setEditIsBestSeller] = useState(false);
  const [editIsNewArrival, setEditIsNewArrival] = useState(false);
  const [editIsFlashDeal, setEditIsFlashDeal] = useState(false);
  const [editIsTrending, setEditIsTrending] = useState(false);
  const [editIsActive, setEditIsActive] = useState(true);

  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [prodData, catData] = await Promise.all([getProducts(), getCategories()]);
    setProducts(prodData);
    setCategories(catData);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Product deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  }

  function openEditDrawer(p: Product) {
    setEditingProduct(p);
    setEditName(p.name || "");
    setEditDescription(p.description || "");
    setEditCategory(p.category || "");
    setEditSubCategory(p.subCategory || "");
    setEditBrand(p.brand || "");
    setEditRegularPrice(p.regularPrice || 0);
    setEditSalePrice(p.salePrice || 0);
    setEditStock(p.stock || 0);
    setEditImages(p.images || []);
    setEditWarranty(p.warranty || "");
    setEditReturnPolicy(p.returnPolicy || "");

    setEditCollection(p.collection || "");
    setEditMaterial(p.material || "");
    setEditColor(p.color || "");
    setEditSize(p.size || "");
    setEditOccasion(p.occasion || "");
    setEditCareInstructions(p.careInstructions || "");
    setEditWaterproof(!!p.waterproof);
    setEditAntiTarnish(!!p.antiTarnish);
    setEditJewelleryType(p.jewelleryType || "");
    setEditPlating(p.plating || "");
    setEditStoneType(p.stoneType || "");
    setEditBadgesText((p.badges || []).join(", "));

    if (p.specifications && typeof p.specifications === "object") {
      if (Array.isArray(p.specifications)) {
        const list = p.specifications
          .filter(item => typeof item === "string")
          .map((item) => {
            const idx = item.indexOf(":");
            if (idx !== -1) {
              return { key: item.slice(0, idx).trim(), value: item.slice(idx + 1).trim() };
            }
            return { key: item, value: "" };
          });
        setEditSpecs(list);
      } else {
        const list = Object.entries(p.specifications).map(([k, v]) => ({ key: k, value: String(v || "") }));
        setEditSpecs(list);
      }
    } else {
      setEditSpecs([]);
    }

    setEditIsFeatured(!!p.isFeatured);
    setEditIsBestSeller(!!p.isBestSeller);
    setEditIsNewArrival(!!p.isNewArrival);
    setEditIsFlashDeal(!!p.isFlashDeal);
    setEditIsTrending(!!p.isTrending);
    setEditIsActive(p.isActive !== false);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImg(true);
    try {
      const url = await uploadImage(file);
      setEditImages([...editImages, url]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image.");
    } finally {
      setUploadingImg(false);
    }
  }

  function handleAddImageUrl() {
    if (!newImageUrl.trim()) return;
    setEditImages([...editImages, newImageUrl.trim()]);
    setNewImageUrl("");
  }

  function handleRemoveImage(index: number) {
    setEditImages(editImages.filter((_, idx) => idx !== index));
  }

  function handleAddSpec() {
    if (!newSpecKey.trim() || !newSpecValue.trim()) return;
    setEditSpecs([...editSpecs, { key: newSpecKey.trim(), value: newSpecValue.trim() }]);
    setNewSpecKey("");
    setNewSpecValue("");
  }

  function handleRemoveSpec(index: number) {
    setEditSpecs(editSpecs.filter((_, idx) => idx !== index));
  }

  async function handleSaveProduct() {
    if (!editingProduct) return;
    
    if (!editName || !editName.trim()) return toast.error("Product name is required.");
    if (!editCategory || !editCategory.trim()) return toast.error("Category is required.");
    if (editSalePrice === undefined || editSalePrice === null || Number(editSalePrice) <= 0) return toast.error("Sale price must be > 0.");
    if (editStock === undefined || editStock === null || Number(editStock) < 0) return toast.error("Stock cannot be negative.");

    setSaveLoading(true);
    try {
      const specsObj: Record<string, string> = {};
      (editSpecs || []).forEach((s) => {
        if (s && s.key && s.key.trim()) {
          specsObj[s.key.trim()] = (s.value || "").trim();
        }
      });

      const finalSalePrice = Number(editSalePrice);
      const finalRegularPrice = Number(editRegularPrice) || finalSalePrice;
      const discountPercentage = finalRegularPrice ? Math.round(((finalRegularPrice - finalSalePrice) / finalRegularPrice) * 100) : 0;
      const finalImages = editImages && editImages.length > 0 ? editImages : ["/placeholder.png"];

      const baseSlug = slugify(editName);
      const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
      const finalBadges = editBadgesText.split(",").map(b => b.trim()).filter(Boolean);

      const updatedFields: Partial<Product> = {
        name: editName.trim(),
        slug: uniqueSlug,
        description: (editDescription || "").trim(),
        category: editCategory.trim(),
        subCategory: (editSubCategory || "").trim(),
        brand: (editBrand || "").trim(),
        regularPrice: finalRegularPrice,
        salePrice: finalSalePrice,
        discountPercentage: discountPercentage > 0 ? discountPercentage : 0,
        stock: Number(editStock),
        images: finalImages,
        thumbnail: finalImages[0],
        warranty: (editWarranty || "").trim(),
        returnPolicy: (editReturnPolicy || "").trim(),
        specifications: specsObj,
        badges: finalBadges,
        isFeatured: editIsFeatured,
        isBestSeller: editIsBestSeller,
        isNewArrival: editIsNewArrival,
        isFlashDeal: editIsFlashDeal,
        isTrending: editIsTrending,
        isActive: editIsActive,
        collection: editCollection.trim(),
        material: editMaterial.trim(),
        color: editColor.trim(),
        size: editSize.trim(),
        occasion: editOccasion.trim(),
        careInstructions: editCareInstructions.trim(),
        waterproof: editWaterproof,
        antiTarnish: editAntiTarnish,
        jewelleryType: editJewelleryType.trim(),
        plating: editPlating.trim(),
        stoneType: editStoneType.trim(),
        updatedAt: new Date().toISOString()
      };

      await updateProduct(editingProduct.id, updatedFields);
      
      const newProducts = products.map((p) => p.id === editingProduct.id ? ({ ...p, ...updatedFields } as Product) : p);
      setProducts(newProducts);
      setEditingProduct(null);
      toast.success("Product updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes.");
    } finally {
      setSaveLoading(false);
    }
  }

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase())) ||
      p.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;

    let matchesBadge = true;
    if (badgeFilter === "Featured") matchesBadge = !!p.isFeatured;
    else if (badgeFilter === "BestSeller") matchesBadge = !!p.isBestSeller;
    else if (badgeFilter === "NewArrival") matchesBadge = !!p.isNewArrival;
    else if (badgeFilter === "FlashDeal") matchesBadge = !!p.isFlashDeal;
    else if (badgeFilter === "Trending") matchesBadge = !!p.isTrending;
    else if (badgeFilter === "Active") matchesBadge = p.isActive !== false;
    else if (badgeFilter === "Inactive") matchesBadge = p.isActive === false;

    return matchesSearch && matchesCategory && matchesBadge;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Actions */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-full ring-1 ring-inset bg-card/60 text-foreground/70 ring-border outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <select
            value={badgeFilter}
            onChange={(e) => setBadgeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-full ring-1 ring-inset bg-card/60 text-foreground/70 ring-border outline-none"
          >
            <option value="All">All Tags/Status</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Hidden Only</option>
            <option value="Featured">Featured</option>
            <option value="BestSeller">Best Sellers</option>
          </select>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="pl-9 w-48 bg-card/60 rounded-full text-xs"
            />
          </div>
          <Button asChild className="rounded-full bg-[var(--gradient-rose,linear-gradient(135deg,#d8a7b1,#3a2428))] text-white border-none hover:opacity-90">
            <Link href="/admin/add-product"><Plus className="h-4 w-4 mr-1" />Add Product</Link>
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <AdminCard>
        {loading ? (
          <div className="p-12 text-center text-muted-foreground animate-pulse">Loading catalog...</div>
        ) : filtered.length === 0 ? (
          <EmptyStateCard 
            icon={Sparkles} 
            text="No products available" 
            subtext="Try adjusting your filter or add a new product." 
          />
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr className="text-left">
                  <th className="px-2 py-2 font-medium">Product</th>
                  <th className="px-2 py-2 font-medium">Category</th>
                  <th className="px-2 py-2 font-medium">Price</th>
                  <th className="px-2 py-2 font-medium">Sale</th>
                  <th className="px-2 py-2 font-medium">Stock</th>
                  <th className="px-2 py-2 font-medium">Tags</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-11 w-11 shrink-0 rounded-lg bg-secondary grid place-items-center overflow-hidden">
                          {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : <ImageIcon className="h-5 w-5 text-muted-foreground" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{p.name}</div>
                          <div className="text-[11px] text-muted-foreground">SKU #{p.id.slice(-6).toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-xs">{p.category}</td>
                    <td className="px-2 py-3 tabular-nums text-muted-foreground line-through text-xs">
                      {formatPrice(p.regularPrice)}
                    </td>
                    <td className="px-2 py-3 tabular-nums font-semibold text-charcoalBrown">
                      {formatPrice(p.salePrice)}
                    </td>
                    <td className="px-2 py-3">
                      <span className={`tabular-nums text-xs font-medium ${p.stock < 10 ? "text-amber-600" : "text-emerald-600"}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {p.isFeatured && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 inline-flex items-center gap-0.5"><Star className="h-2.5 w-2.5" />Featured</span>}
                        {p.isBestSeller && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(184,149,94,0.1)] text-[rgba(184,149,94,1)] ring-1 ring-[rgba(184,149,94,0.3)]">Bestseller</span>}
                        {p.isFlashDeal && <span className="text-[10px] px-1.5 py-0.5 rounded bg-dustyRose/10 text-dustyRose ring-1 ring-dustyRose/30">Flash Deal</span>}
                      </div>
                    </td>
                    <td className="px-2 py-3"><StatusBadge status={p.isActive !== false ? "Active" : "Inactive"} /></td>
                    <td className="px-2 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEditDrawer(p)}><Edit2 className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" disabled={deletingId === p.id} onClick={() => handleDelete(p.id)}>
                          {deletingId === p.id ? <HeartLoader size="sm" text="" /> : <Trash2 className="h-4 w-4 text-dustyRose" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* Edit Drawer (retained from old UI, just visually updated a bit to match) */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
          <div className="fixed inset-0" onClick={() => setEditingProduct(null)} />
          <div className="relative w-full max-w-2xl bg-[var(--background)] shadow-2xl h-screen flex flex-col border-l border-border/60 animate-in slide-in-from-right">
            
            <div className="flex justify-between items-center border-b border-border/60 p-5 bg-card/40 backdrop-blur-sm">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Product Customizer</span>
                <h3 className="text-xl font-display font-semibold text-foreground mt-1 truncate max-w-md">Edit: {editingProduct.name}</h3>
              </div>
              <button onClick={() => setEditingProduct(null)} className="rounded-full p-2 text-muted-foreground hover:bg-secondary transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
              {/* Basic Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-[rgba(184,149,94,1)] uppercase tracking-widest border-b border-border/60 pb-2">Basic Details</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1">Product Name</label>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1">Category</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="">Select</option>
                        {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1">Subcategory</label>
                      <Input value={editSubCategory} onChange={(e) => setEditSubCategory(e.target.value)} className="rounded-xl" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1">Description</label>
                    <textarea rows={3} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring resize-none" />
                  </div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-semibold text-[rgba(184,149,94,1)] uppercase tracking-widest border-b border-border/60 pb-2">Pricing & Inventory</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1">Regular (MRP)</label>
                    <Input type="number" value={editRegularPrice} onChange={(e) => setEditRegularPrice(Number(e.target.value))} className="rounded-xl" />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1">Sale Price</label>
                    <Input type="number" value={editSalePrice} onChange={(e) => setEditSalePrice(Number(e.target.value))} className="rounded-xl" />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1">Stock</label>
                    <Input type="number" value={editStock} onChange={(e) => setEditStock(Number(e.target.value))} className="rounded-xl" />
                  </div>
                </div>
              </div>

              {/* Flags / Status */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-semibold text-[rgba(184,149,94,1)] uppercase tracking-widest border-b border-border/60 pb-2">Flags & Status</h4>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editIsActive} onChange={(e) => setEditIsActive(e.target.checked)} className="rounded text-primary focus:ring-primary" /> Active (Visible)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editIsFeatured} onChange={(e) => setEditIsFeatured(e.target.checked)} className="rounded text-primary focus:ring-primary" /> Featured
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editIsBestSeller} onChange={(e) => setEditIsBestSeller(e.target.checked)} className="rounded text-primary focus:ring-primary" /> Best Seller
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editIsFlashDeal} onChange={(e) => setEditIsFlashDeal(e.target.checked)} className="rounded text-primary focus:ring-primary" /> Flash Deal
                  </label>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-semibold text-[rgba(184,149,94,1)] uppercase tracking-widest border-b border-border/60 pb-2">Images</h4>
                <div className="grid grid-cols-4 gap-3">
                  {editImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg border border-border overflow-hidden group bg-secondary/50">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="Image URL..." className="rounded-xl flex-1" />
                  <Button type="button" variant="secondary" onClick={handleAddImageUrl} className="rounded-xl">Add URL</Button>
                </div>
              </div>
            </div>

            <div className="border-t border-border/60 p-5 bg-card/40 backdrop-blur-sm flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditingProduct(null)} className="rounded-full">Cancel</Button>
              <Button onClick={handleSaveProduct} disabled={saveLoading} className="rounded-full bg-[var(--gradient-rose)] text-white hover:opacity-90 border-none">
                {saveLoading ? "Saving..." : "Save Product"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
