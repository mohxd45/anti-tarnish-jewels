"use client";
import { useAuth } from "@/context/AuthContext";


import { useEffect, useState } from "react";
import { getProducts, deleteProduct, updateProduct, getCategories, uploadImage , logActivity } from "@/lib/firestore";
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
  const { user } = useAuth();
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
  const [editSku, setEditSku] = useState("");
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

  // Product Options
  const [editSizeOptions, setEditSizeOptions] = useState<string[]>([]);
  const [editColorOptions, setEditColorOptions] = useState<string[]>([]);
  const [editSelectedSizeRequired, setEditSelectedSizeRequired] = useState(false);
  const [editSelectedColorRequired, setEditSelectedColorRequired] = useState(false);
  const [newCustomSize, setNewCustomSize] = useState("");
  const [newCustomColor, setNewCustomColor] = useState("");

  const DEFAULT_COLORS = ["Gold", "Silver", "Rose Gold", "Black", "White", "Pearl", "Green", "Red", "Pink", "Blue", "Multi Color"];
  const SIZES_RINGS = ["Adjustable", "Size 5", "Size 6", "Size 7", "Size 8", "Size 9", "Size 10"];
  const SIZES_BANGLES = ["2.2", "2.4", "2.6", "2.8", "Adjustable"];
  const SIZES_BRACELETS = ["Small", "Medium", "Large", "Adjustable"];
  const SIZES_ANKLETS = ["9 inch", "10 inch", "11 inch", "Adjustable"];
  const SIZES_NECKLACES = ["Choker", "16 inch", "18 inch", "20 inch", "22 inch", "Adjustable"];
  const SIZES_FREE_ADJ = ["Free Size", "Adjustable"];
  const SIZES_HAIR = ["Free Size", "Small", "Medium", "Large", "Adjustable"];

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
      if (user) {
        await logActivity({
          actorUid: user.uid,
          actorEmail: user.email || "Unknown",
          actorName: user.displayName || user.email || "Unknown",
          actorRole: (user as any).role || "staff",
          action: "delete_product",
          documentChanged: id,
          section: "product",
          newValue: "Deleted product " + id
        });
      }
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
    setEditSku(p.sku || "");
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

    setEditSizeOptions(p.sizeOptions || []);
    setEditColorOptions(p.colorOptions || []);
    setEditSelectedSizeRequired(!!p.selectedSizeRequired);
    setEditSelectedColorRequired(!!p.selectedColorRequired);
  }

  useEffect(() => {
    // Only auto-suggest if no sizes exist and we are editing
    if (editingProduct && editSizeOptions.length === 0 && editCategory && !editingProduct.sizeOptions) {
      const catLow = editCategory.toLowerCase();
      if (catLow.includes("ring")) setEditSizeOptions(SIZES_RINGS);
      else if (catLow.includes("bangle")) setEditSizeOptions(SIZES_BANGLES);
      else if (catLow.includes("bracelet")) setEditSizeOptions(SIZES_BRACELETS);
      else if (catLow.includes("anklet")) setEditSizeOptions(SIZES_ANKLETS);
      else if (catLow.includes("necklace") || catLow.includes("chain")) setEditSizeOptions(SIZES_NECKLACES);
      else if (catLow.includes("hair")) setEditSizeOptions(SIZES_HAIR);
      else if (catLow.includes("bridal") || catLow.includes("set") || catLow.includes("tikka") || catLow.includes("haathphool")) setEditSizeOptions(SIZES_FREE_ADJ);
    }
  }, [editCategory, editingProduct]);

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
        sku: editSku.trim(),
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
        sizeOptions: editSizeOptions,
        colorOptions: editColorOptions,
        selectedSizeRequired: editSelectedSizeRequired,
        selectedColorRequired: editSelectedColorRequired,
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
      if (user) {
        await logActivity({
          actorUid: user.uid,
          actorEmail: user.email || "Unknown",
          actorName: user.displayName || user.email || "Unknown",
          actorRole: (user as any).role || "staff",
          action: "update_product",
          documentChanged: editingProduct.id,
          section: "product",
          newValue: "Updated product " + editingProduct.name
        });
      }
      
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
            className="px-3 py-1.5 text-xs rounded-full border border-adminBorder bg-adminCard text-adminSidebar outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <select
            value={badgeFilter}
            onChange={(e) => setBadgeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-full border border-adminBorder bg-adminCard text-adminSidebar outline-none"
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
              className="pl-9 w-48 bg-adminCard border-adminBorder rounded-full text-xs text-adminSidebar"
            />
          </div>
          <Button asChild className="rounded-full bg-adminRose text-white hover:bg-adminRose/90 border-none transition-colors">
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
              <thead className="text-xs uppercase tracking-wider text-adminMuted border-b border-adminBorder/50">
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
              <tbody className="divide-y divide-adminBorder/50">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-adminBg/50 transition-colors">
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-11 w-11 shrink-0 rounded-lg bg-white border border-adminBorder grid place-items-center overflow-hidden">
                          {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : <ImageIcon className="h-5 w-5 text-adminMuted" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate text-adminSidebar">{p.name}</div>
                          <div className="text-[11px] text-adminMuted">SKU #{p.id.slice(-6).toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-xs text-adminSidebar">{p.category}</td>
                    <td className="px-2 py-3 tabular-nums text-adminMuted line-through text-xs">
                      {formatPrice(p.regularPrice)}
                    </td>
                    <td className="px-2 py-3 tabular-nums font-semibold text-adminSidebar">
                      {formatPrice(p.salePrice)}
                    </td>
                    <td className="px-2 py-3">
                      <span className={`tabular-nums text-xs font-medium ${p.stock < 10 ? "text-adminRose" : "text-emerald-600"}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {p.isFeatured && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 inline-flex items-center gap-0.5"><Star className="h-2.5 w-2.5" />Featured</span>}
                        {p.isBestSeller && <span className="text-[10px] px-1.5 py-0.5 rounded bg-adminGold/10 text-adminGold border border-adminGold/30">Bestseller</span>}
                        {p.isFlashDeal && <span className="text-[10px] px-1.5 py-0.5 rounded bg-adminRose/10 text-adminRose border border-adminRose/30">Flash Deal</span>}
                      </div>
                    </td>
                    <td className="px-2 py-3"><StatusBadge status={p.isActive !== false ? "Active" : "Inactive"} /></td>
                    <td className="px-2 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEditDrawer(p)} className="text-adminSidebar hover:bg-adminBg"><Edit2 className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" disabled={deletingId === p.id} onClick={() => handleDelete(p.id)} className="text-adminRose hover:bg-adminRose/10 hover:text-adminRose">
                          {deletingId === p.id ? <HeartLoader size="sm" text="" /> : <Trash2 className="h-4 w-4" />}
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="fixed inset-0" onClick={() => setEditingProduct(null)} />
          <div className="relative w-full max-w-2xl bg-adminBg shadow-2xl h-screen flex flex-col border-l border-adminBorder animate-in slide-in-from-right">
            
            <div className="flex justify-between items-center border-b border-adminBorder p-5 bg-adminCard">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-adminGold font-semibold">Product Customizer</span>
                <h3 className="text-xl font-serif font-semibold text-adminSidebar mt-1 truncate max-w-md">Edit: {editingProduct.name}</h3>
              </div>
              <button onClick={() => setEditingProduct(null)} className="rounded-full p-2 text-adminMuted hover:bg-adminBg transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
              {/* Basic Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-adminGold uppercase tracking-widest border-b border-adminBorder pb-2">Basic Details</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-adminMuted block mb-1">Product Name *</label>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="rounded-xl border-adminBorder bg-white" />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-adminMuted block mb-1">Item Code / SKU</label>
                    <Input value={editSku} onChange={(e) => setEditSku(e.target.value)} placeholder="Example: LJ-RNG-001" className="rounded-xl border-adminBorder bg-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] uppercase tracking-wider font-semibold text-adminMuted block mb-1">Category *</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full rounded-xl border border-adminBorder bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-adminGold"
                      >
                        <option value="">Select</option>
                        {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-wider font-semibold text-adminMuted block mb-1">Subcategory</label>
                      <Input value={editSubCategory} onChange={(e) => setEditSubCategory(e.target.value)} className="rounded-xl border-adminBorder bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-adminMuted block mb-1">Description</label>
                    <textarea rows={3} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full rounded-xl border border-adminBorder bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-adminGold resize-none" />
                  </div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-semibold text-adminGold uppercase tracking-widest border-b border-adminBorder pb-2">Pricing & Inventory</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-adminMuted block mb-1">Regular (MRP)</label>
                    <Input type="number" value={editRegularPrice} onChange={(e) => setEditRegularPrice(Number(e.target.value))} className="rounded-xl border-adminBorder bg-white" />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-adminMuted block mb-1">Sale Price</label>
                    <Input type="number" value={editSalePrice} onChange={(e) => setEditSalePrice(Number(e.target.value))} className="rounded-xl border-adminBorder bg-white" />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-adminMuted block mb-1">Stock</label>
                    <Input type="number" value={editStock} onChange={(e) => setEditStock(Number(e.target.value))} className="rounded-xl border-adminBorder bg-white" />
                  </div>
                </div>
              </div>

              {/* Flags / Status */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-semibold text-adminGold uppercase tracking-widest border-b border-adminBorder pb-2">Flags & Status</h4>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-adminSidebar">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editIsActive} onChange={(e) => setEditIsActive(e.target.checked)} className="rounded text-adminGold focus:ring-adminGold" /> Active (Visible)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editIsFeatured} onChange={(e) => setEditIsFeatured(e.target.checked)} className="rounded text-adminGold focus:ring-adminGold" /> Featured
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editIsBestSeller} onChange={(e) => setEditIsBestSeller(e.target.checked)} className="rounded text-adminGold focus:ring-adminGold" /> Best Seller
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editIsFlashDeal} onChange={(e) => setEditIsFlashDeal(e.target.checked)} className="rounded text-adminGold focus:ring-adminGold" /> Flash Deal
                  </label>
                </div>
              </div>

              {/* Product Options */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-semibold text-adminGold uppercase tracking-widest border-b border-adminBorder pb-2">Product Options (Size & Color)</h4>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[11px] uppercase tracking-wider text-adminMuted font-semibold">Available Colors / Finishes</label>
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-adminSidebar">
                      <input type="checkbox" checked={editSelectedColorRequired} onChange={e => setEditSelectedColorRequired(e.target.checked)} className="rounded text-adminGold focus:ring-adminGold" />
                      Required
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {DEFAULT_COLORS.map(c => {
                      const isSelected = editColorOptions.includes(c);
                      return (
                        <button key={c} type="button" onClick={() => {
                          if (isSelected) setEditColorOptions(editColorOptions.filter(x => x !== c));
                          else setEditColorOptions([...editColorOptions, c]);
                        }} className={`px-3 py-1 text-xs rounded-full border transition-colors ${isSelected ? 'bg-adminGold text-white border-transparent shadow-sm' : 'bg-white text-adminMuted border-adminBorder hover:border-adminGold/50'}`}>
                          {c}
                        </button>
                      );
                    })}
                    {editColorOptions.filter(c => !DEFAULT_COLORS.includes(c)).map(c => (
                        <button key={c} type="button" onClick={() => setEditColorOptions(editColorOptions.filter(x => x !== c))} className="px-3 py-1 text-xs rounded-full border bg-adminGold text-white border-transparent shadow-sm">
                          {c} <X className="inline h-3 w-3 ml-1" />
                        </button>
                    ))}
                  </div>
                  <div className="flex gap-2 max-w-sm">
                    <Input value={newCustomColor} onChange={e => setNewCustomColor(e.target.value)} placeholder="Custom color..." className="h-8 text-xs rounded-xl border-adminBorder bg-white" />
                    <Button type="button" variant="secondary" size="sm" onClick={() => { if(newCustomColor) { setEditColorOptions([...editColorOptions, newCustomColor.trim()]); setNewCustomColor(""); }}} className="rounded-xl border border-adminBorder bg-white hover:bg-adminBg">Add</Button>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[11px] uppercase tracking-wider text-adminMuted font-semibold">Available Sizes</label>
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-adminSidebar">
                      <input type="checkbox" checked={editSelectedSizeRequired} onChange={e => setEditSelectedSizeRequired(e.target.checked)} className="rounded text-adminGold focus:ring-adminGold" />
                      Required
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editSizeOptions.map(s => (
                      <button key={s} type="button" onClick={() => setEditSizeOptions(editSizeOptions.filter(x => x !== s))} className="px-3 py-1 text-xs rounded-full border bg-adminGold text-white border-transparent shadow-sm">
                        {s} <X className="inline h-3 w-3 ml-1" />
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 max-w-sm">
                    <Input value={newCustomSize} onChange={e => setNewCustomSize(e.target.value)} placeholder="Add size..." className="h-8 text-xs rounded-xl border-adminBorder bg-white" />
                    <Button type="button" variant="secondary" size="sm" onClick={() => { if(newCustomSize && !editSizeOptions.includes(newCustomSize.trim())) { setEditSizeOptions([...editSizeOptions, newCustomSize.trim()]); setNewCustomSize(""); }}} className="rounded-xl border border-adminBorder bg-white hover:bg-adminBg">Add</Button>
                  </div>
                  <p className="text-[10px] text-adminMuted mt-2">Click the X to remove sizes you don't stock.</p>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-semibold text-adminGold uppercase tracking-widest border-b border-adminBorder pb-2">Images</h4>
                <div className="grid grid-cols-4 gap-3">
                  {editImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg border border-adminBorder overflow-hidden group bg-adminBg">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="Image URL..." className="rounded-xl flex-1 border-adminBorder bg-white" />
                  <Button type="button" variant="secondary" onClick={handleAddImageUrl} className="rounded-xl border border-adminBorder bg-white hover:bg-adminBg">Add URL</Button>
                </div>
              </div>
            </div>

            <div className="border-t border-adminBorder p-5 bg-adminCard flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditingProduct(null)} className="rounded-full border-adminBorder text-adminSidebar hover:bg-adminBg">Cancel</Button>
              <Button onClick={handleSaveProduct} disabled={saveLoading} className="rounded-full bg-adminRose text-white hover:bg-adminRose/90 border-none">
                {saveLoading ? "Saving..." : "Save Product"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
