"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { getProducts, deleteProduct, updateProduct, getCategories, uploadImage } from "@/lib/firestore";
import { Product, Category } from "@/types";
import { formatPrice, slugify } from "@/lib/utils";
import { Edit2, Trash2, X, Check, Search, Plus, Filter, Image as ImageIcon, ToggleLeft, ToggleRight, Sparkles, Upload, Loader } from "lucide-react";
import Link from "next/link";

export default function ManageProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [badgeFilter, setBadgeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
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

  // Image input
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, badgeFilter]);

  async function loadData() {
    setLoading(true);
    const prodData = await getProducts();
    const catData = await getCategories();
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
    } catch (err) {
      console.error(err);
      alert("Failed to delete product.");
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

    // Convert specs Record or Array to format safely
    if (p.specifications && typeof p.specifications === "object") {
      if (Array.isArray(p.specifications)) {
        // Formatted as "Key: Value" or similar
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
        // Record
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
    setEditIsActive(p.isActive !== false); // default to true
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
      alert("Failed to upload image.");
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
    
    // Safe validation checks
    if (!editName || !editName.trim()) {
      alert("Product name is required.");
      return;
    }
    if (!editCategory || !editCategory.trim()) {
      alert("Category is required.");
      return;
    }
    if (editSalePrice === undefined || editSalePrice === null || Number(editSalePrice) <= 0) {
      alert("Sale price is required and must be greater than 0.");
      return;
    }
    if (editStock === undefined || editStock === null || Number(editStock) < 0) {
      alert("Stock availability is required and cannot be negative.");
      return;
    }

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
      const finalImages = editImages && editImages.length ? editImages : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop"];

      // Safe slug generation
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
        warranty: (editWarranty || "").trim(),
        returnPolicy: (editReturnPolicy || "").trim(),
        specifications: specsObj,
        variants: editingProduct.variants || [],
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
      
      const newProducts = products.map((p) => 
        p.id === editingProduct.id ? ({ ...p, ...updatedFields } as Product) : p
      );
      setProducts(newProducts);
      setEditingProduct(null);
      alert("Product details updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save changes.");
    } finally {
      setSaveLoading(false);
    }
  }

  // Filter Logic
  const filtered = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
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

  const ITEMS_PER_PAGE = 20;
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <Protected adminOnly>
      <section className="mx-auto max-w-7xl px-4 py-8">
        {/* Header Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-goldBeige/40 pb-6 mb-8">
          <div>
            <h1 className="text-4xl font-serif font-semibold text-champagne tracking-wide">Products Catalog</h1>
            <p className="text-sm text-stoneGray mt-1">Manage global inventory items, specification details, and storefront parameters.</p>
          </div>
          
          <Link
            href="/admin/add-product"
            className="inline-flex items-center gap-2 rounded-full bg-champagne px-5 py-3 font-semibold text-charcoalBrown shadow-jewel hover:opacity-90 transition-all text-sm self-start sm:self-center"
          >
            <Plus size={16} /> Add Product
          </Link>
        </div>

        {/* Filters Panel */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stoneGray" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, brand, category..."
              className="w-full rounded-full border border-goldBeige bg-warmwhite py-2.5 pl-11 pr-4 text-charcoalBrown placeholder-stoneGray outline-none focus:border-champagne transition-all text-sm"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-2.5 text-charcoalBrown outline-none focus:border-champagne text-sm appearance-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Quick Badges Filter */}
          <div className="relative">
            <select
              value={badgeFilter}
              onChange={(e) => setBadgeFilter(e.target.value)}
              className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-2.5 text-charcoalBrown outline-none focus:border-champagne text-sm appearance-none cursor-pointer"
            >
              <option value="All">All Tags/Status</option>
              <option value="Active">Active Listings Only</option>
              <option value="Inactive">Hidden Listings Only</option>
              <option value="Featured">Featured items</option>
              <option value="BestSeller">Best sellers</option>
              <option value="NewArrival">New arrivals</option>
              <option value="FlashDeal">Flash deals</option>
              <option value="Trending">Trending items</option>
            </select>
          </div>
        </div>

        {/* Products Table Grid */}
        <div className="overflow-x-auto rounded-[2rem] border border-goldBeige bg-warmwhite shadow-jewel">
          {loading ? (
            <div className="p-12 text-center text-stoneGray">Fetching inventory items...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-stoneGray">No products match specified criteria.</div>
          ) : (
            <table className="w-full min-w-[1000px] text-left text-sm text-charcoalBrown">
              <thead className="bg-beige text-champagne uppercase tracking-wider text-xs border-b border-goldBeige/60">
                <tr>
                  <th className="p-5 font-serif font-semibold">Product Details</th>
                  <th className="font-serif font-semibold">Pricing</th>
                  <th className="font-serif font-semibold">Stock Levels</th>
                  <th className="font-serif font-semibold">Store Tags</th>
                  <th className="font-serif font-semibold">Status</th>
                  <th className="text-right p-5 font-serif font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-goldBeige/40">
                {paginated.map((p) => {
                  const hasDiscount = p.salePrice < p.regularPrice;
                  return (
                    <tr key={p.id} className="hover:bg-beige/35 transition-all">
                      {/* Image & Title */}
                      <td className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-beige border border-goldBeige overflow-hidden flex items-center justify-center shrink-0">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="text-champagne/30" size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-serif font-semibold text-charcoalBrown leading-tight">{p.name}</p>
                          <div className="flex gap-2 items-center mt-1 text-xs text-stoneGray">
                            <span>{p.category}</span>
                            {p.subCategory && (
                              <>
                                <span>•</span>
                                <span>{p.subCategory}</span>
                              </>
                            )}
                            {p.brand && (
                              <>
                                <span>•</span>
                                <span className="text-champagne font-semibold">{p.brand}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Prices */}
                      <td>
                        {hasDiscount ? (
                          <div>
                            <span className="font-semibold text-champagne">{formatPrice(p.salePrice)}</span>
                            <span className="text-xs line-through text-stoneGray ml-2">{formatPrice(p.regularPrice)}</span>
                          </div>
                        ) : (
                          <span className="font-semibold text-charcoalBrown">{formatPrice(p.regularPrice)}</span>
                        )}
                      </td>

                      {/* Stock levels */}
                      <td>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          p.stock <= 0 ? "bg-dustyRose/10 text-dustyRose" :
                          p.stock < 10 ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"
                        }`}>
                          {p.stock} units ({p.stock <= 0 ? "Out of Stock" : p.stock < 10 ? "Low Stock" : "In Stock"})
                        </span>
                      </td>

                      {/* Badges/Tags */}
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {p.isFeatured && <span className="text-[9px] font-semibold bg-emerald-500/15 text-emerald-600 border border-emerald-500/25 px-2 py-0.5 rounded-full uppercase tracking-wider">Featured</span>}
                          {p.isBestSeller && <span className="text-[9px] font-semibold bg-champagne/15 text-champagne border border-champagne/25 px-2 py-0.5 rounded-full uppercase tracking-wider">Best Seller</span>}
                          {p.isNewArrival && <span className="text-[9px] font-semibold bg-indigo-500/15 text-indigo-600 border border-indigo-500/25 px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>}
                          {p.isFlashDeal && <span className="text-[9px] font-semibold bg-dustyRose/15 text-dustyRose border border-dustyRose/25 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">Flash Deal</span>}
                          {p.isTrending && <span className="text-[9px] font-semibold bg-cyan-500/15 text-cyan-600 border border-cyan-500/25 px-2 py-0.5 rounded-full uppercase tracking-wider">Trending</span>}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${p.isActive !== false ? "text-emerald-600" : "text-stoneGray"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${p.isActive !== false ? "bg-emerald-500" : "bg-stoneGray/40"}`} />
                          {p.isActive !== false ? "Active" : "Hidden"}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditDrawer(p)}
                            className="p-2.5 rounded-full bg-champagne/15 text-champagne hover:bg-champagne hover:text-charcoalBrown transition-colors"
                            title="Edit Details"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            disabled={deletingId === p.id}
                            onClick={() => handleDelete(p.id)}
                            className="p-2.5 rounded-full bg-dustyRose/15 text-dustyRose hover:bg-dustyRose hover:text-charcoalBrown transition-colors disabled:opacity-50"
                            title="Delete Product"
                          >
                            {deletingId === p.id ? (
                              <Loader className="animate-spin h-3.5 w-3.5" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {filtered.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between border-t border-goldBeige/40 pt-6 mt-6">
            <span className="text-xs text-stoneGray">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} products
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="rounded-full border border-goldBeige bg-warmwhite px-4 py-2 text-xs font-semibold text-charcoalBrown hover:border-champagne disabled:opacity-50 transition-all"
              >
                Previous
              </button>
              <button
                disabled={currentPage * ITEMS_PER_PAGE >= filtered.length}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="rounded-full border border-goldBeige bg-warmwhite px-4 py-2 text-xs font-semibold text-charcoalBrown hover:border-champagne disabled:opacity-50 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Edit Product Drawer Overlay */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 bg-black/70 flex justify-end">
            <div className="fixed inset-0" onClick={() => setEditingProduct(null)} />
            <div className="relative w-full max-w-3xl bg-warmwhite shadow-2xl h-screen overflow-hidden p-4 sm:p-6 md:p-8 flex flex-col justify-between border-l border-goldBeige">
              
              {/* Drawer Header */}
              <div className="flex justify-between items-center border-b border-goldBeige/40 pb-5 mb-6">
                <div>
                  <span className="text-[10px] text-champagne uppercase tracking-[0.2em] font-mono block">Product Customizer</span>
                  <h3 className="text-2xl font-serif font-semibold text-charcoalBrown mt-0.5">Edit: {editingProduct.name}</h3>
                </div>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="rounded-full border border-goldBeige p-2 text-champagne hover:bg-champagne/10 transition-colors"
                  aria-label="Close customizer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body - Scrollable Fields */}
              <div className="flex-1 space-y-6 pr-1 overflow-y-auto scrollbar-thin">
                
                {/* Section 1: Basic Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-champagne uppercase tracking-widest flex items-center gap-1.5"><Sparkles size={14} /> Basic Product Details</h4>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-stoneGray">Product Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-2.5 text-charcoalBrown outline-none focus:border-champagne transition-all text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-stoneGray block mb-1">Brand Name</label>
                      <input
                        type="text"
                        value={editBrand}
                        onChange={(e) => setEditBrand(e.target.value)}
                        placeholder="e.g. Samsung"
                        className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-2.5 text-charcoalBrown outline-none focus:border-champagne transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-stoneGray block mb-1">Parent Category</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-2.5 text-charcoalBrown outline-none focus:border-champagne text-sm appearance-none cursor-pointer"
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-stoneGray block mb-1">Subcategory</label>
                      <input
                        type="text"
                        value={editSubCategory}
                        onChange={(e) => setEditSubCategory(e.target.value)}
                        placeholder="e.g. Headphones"
                        className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-2.5 text-charcoalBrown outline-none focus:border-champagne transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-stoneGray block mb-1">Stock Availability</label>
                      <input
                        type="number"
                        value={editStock}
                        onChange={(e) => setEditStock(Number(e.target.value))}
                        className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-2.5 text-charcoalBrown outline-none focus:border-champagne transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-stoneGray">Description Wording</label>
                    <textarea
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full rounded-2xl border border-goldBeige bg-warmwhite px-4 py-3 text-charcoalBrown outline-none focus:border-champagne transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Section 2: Pricing Details */}
                <div className="space-y-4 pt-4 border-t border-goldBeige/40">
                  <h4 className="text-xs font-semibold text-champagne uppercase tracking-widest">Inventory Pricing Structure</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-stoneGray block mb-1">Regular Price</label>
                      <input
                        type="number"
                        value={editRegularPrice}
                        onChange={(e) => setEditRegularPrice(Number(e.target.value))}
                        className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-2.5 text-charcoalBrown outline-none focus:border-champagne transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-stoneGray block mb-1">Sale Discounted Price</label>
                      <input
                        type="number"
                        value={editSalePrice}
                        onChange={(e) => setEditSalePrice(Number(e.target.value))}
                        className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-2.5 text-charcoalBrown outline-none focus:border-champagne transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Multiple Images Upload */}
                <div className="space-y-4 pt-4 border-t border-goldBeige/40">
                  <h4 className="text-xs font-semibold text-champagne uppercase tracking-widest flex items-center gap-1.5"><ImageIcon size={14} /> Product Images Grid</h4>
                  
                  {/* Selected images list */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {editImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl bg-beige border border-goldBeige overflow-hidden group">
                        <img src={img} alt="Product Thumb" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 rounded-full p-1 bg-black/60 text-dustyRose hover:bg-black/95 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 text-[8px] bg-champagne text-charcoalBrown font-semibold uppercase px-1.5 py-0.5 rounded">Primary</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Image Inputs */}
                  <div className="grid gap-3 pt-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="Add imageUrl (HTTP URL)"
                        className="flex-1 rounded-full border border-goldBeige bg-warmwhite px-4 py-2 text-charcoalBrown outline-none focus:border-champagne transition-all text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="rounded-full bg-champagne/15 border border-goldBeige px-4 py-2 text-champagne text-xs font-semibold hover:bg-champagne hover:text-charcoalBrown transition-all"
                      >
                        Add URL
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-goldBeige bg-beige px-4 py-2.5 text-champagne text-xs font-semibold hover:bg-champagne/10 transition-all">
                        {uploadingImg ? (
                          <>
                            <Loader className="animate-spin" size={13} />
                            Uploading Image...
                          </>
                        ) : (
                          <>
                            <Upload size={13} />
                            Upload Local File
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImg}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[10px] text-stoneGray">Supports JPG, PNG formats.</span>
                    </div>
                  </div>
                </div>

                {/* Section 4: Specifications */}
                <div className="space-y-4 pt-4 border-t border-goldBeige/40">
                  <h4 className="text-xs font-semibold text-champagne uppercase tracking-widest">Technical Specifications</h4>
                  
                  {/* Current specs list */}
                  <div className="space-y-2">
                    {editSpecs.map((spec, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-beige p-2 rounded-full border border-goldBeige text-xs">
                        <span className="font-semibold text-champagne pl-3">{spec.key}:</span>
                        <span className="text-charcoalBrown flex-1">{spec.value}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(idx)}
                          className="text-dustyRose hover:bg-dustyRose/10 p-1.5 rounded-full"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Spec Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSpecKey}
                      onChange={(e) => setNewSpecKey(e.target.value)}
                      placeholder="Spec Parameter (e.g. Battery)"
                      className="w-1/2 rounded-full border border-goldBeige bg-warmwhite px-4 py-2 text-charcoalBrown outline-none focus:border-champagne transition-all text-xs"
                    />
                    <input
                      type="text"
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      placeholder="Spec Detail Value (e.g. 5000 mAh)"
                      className="w-1/2 rounded-full border border-goldBeige bg-warmwhite px-4 py-2 text-charcoalBrown outline-none focus:border-champagne transition-all text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddSpec}
                      className="rounded-full bg-champagne px-4 py-2 text-charcoalBrown text-xs font-semibold hover:opacity-90 transition-all shrink-0"
                    >
                      Add Spec
                    </button>
                  </div>
                </div>

                {/* Section 5: Store Policies & Warranty */}
                <div className="space-y-4 pt-4 border-t border-goldBeige/40">
                  <h4 className="text-xs font-semibold text-champagne uppercase tracking-widest">Warranty & Return Policies</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-stoneGray block mb-1">Warranty Period</label>
                      <input
                        type="text"
                        value={editWarranty}
                        onChange={(e) => setEditWarranty(e.target.value)}
                        placeholder="e.g. 1 Year Brand Warranty"
                        className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-2.5 text-charcoalBrown outline-none focus:border-champagne transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-stoneGray block mb-1">Return Policy Override</label>
                      <input
                        type="text"
                        value={editReturnPolicy}
                        onChange={(e) => setEditReturnPolicy(e.target.value)}
                        placeholder="e.g. 7 Days Replacement Only"
                        className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-2.5 text-charcoalBrown outline-none focus:border-champagne transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Jewellery Specific Details */}
                <div className="space-y-4 pt-4 border-t border-goldBeige/40">
                  <h4 className="text-xs font-semibold text-champagne uppercase tracking-widest flex items-center gap-1.5"><Sparkles size={14} /> Jewellery Specific Details</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-stoneGray block mb-1">Collection</label>
                      <input
                        type="text"
                        value={editCollection}
                        onChange={(e) => setEditCollection(e.target.value)}
                        placeholder="e.g. Daily Wear, Bridal"
                        className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-2.5 text-charcoalBrown outline-none focus:border-champagne transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-stoneGray block mb-1">Material Base</label>
                      <input
                        type="text"
                        value={editMaterial}
                        onChange={(e) => setEditMaterial(e.target.value)}
                        placeholder="e.g. 316L Stainless Steel"
                        className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-2.5 text-charcoalBrown outline-none focus:border-champagne transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-stoneGray block mb-1">Plating Polish</label>
                      <input
                        type="text"
                        value={editPlating}
                        onChange={(e) => setEditPlating(e.target.value)}
                        placeholder="e.g. 18K Gold Plated"
                        className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-2.5 text-charcoalBrown outline-none focus:border-champagne transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-stoneGray block mb-1">Color / Finish</label>
                      <input
                        type="text"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        placeholder="e.g. Rose Gold, Silver"
                        className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-2.5 text-charcoalBrown outline-none focus:border-champagne transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-stoneGray block mb-1">Size / Fit</label>
                      <input
                        type="text"
                        value={editSize}
                        onChange={(e) => setEditSize(e.target.value)}
                        placeholder="e.g. Adjustable, 6, 7"
                        className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-2.5 text-charcoalBrown outline-none focus:border-champagne transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-stoneGray block mb-1">Occasion</label>
                      <input
                        type="text"
                        value={editOccasion}
                        onChange={(e) => setEditOccasion(e.target.value)}
                        placeholder="e.g. Festive, Workwear"
                        className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-2.5 text-charcoalBrown outline-none focus:border-champagne transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-stoneGray block mb-1">Stone / Gem Type</label>
                      <input
                        type="text"
                        value={editStoneType}
                        onChange={(e) => setEditStoneType(e.target.value)}
                        placeholder="e.g. AAA+ Cubic Zirconia"
                        className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-2.5 text-charcoalBrown outline-none focus:border-champagne transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-stoneGray block mb-1">Jewellery Sub-Type</label>
                      <input
                        type="text"
                        value={editJewelleryType}
                        onChange={(e) => setEditJewelleryType(e.target.value)}
                        placeholder="e.g. Studs, Hoops, Chokers"
                        className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-2.5 text-charcoalBrown outline-none focus:border-champagne transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-stoneGray block mb-1">Custom Badges (comma-separated)</label>
                      <input
                        type="text"
                        value={editBadgesText}
                        onChange={(e) => setEditBadgesText(e.target.value)}
                        placeholder="e.g. Hot Seller, Daily Wear"
                        className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-2.5 text-charcoalBrown outline-none focus:border-champagne transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Waterproof Toggle */}
                    <div className="flex items-center justify-between bg-beige px-4 py-3 rounded-full border border-goldBeige/40">
                      <span className="text-xs text-charcoalBrown font-medium">💧 Waterproof / Shower Proof</span>
                      <button
                        type="button"
                        onClick={() => setEditWaterproof(!editWaterproof)}
                        className={`text-champagne ${editWaterproof ? "text-champagne" : "text-stoneGray/30"}`}
                      >
                        {editWaterproof ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                      </button>
                    </div>

                    {/* Anti-Tarnish Toggle */}
                    <div className="flex items-center justify-between bg-beige px-4 py-3 rounded-full border border-goldBeige/40">
                      <span className="text-xs text-charcoalBrown font-medium">✨ Anti-Tarnish Guaranteed</span>
                      <button
                        type="button"
                        onClick={() => setEditAntiTarnish(!editAntiTarnish)}
                        className={`text-champagne ${editAntiTarnish ? "text-champagne" : "text-stoneGray/30"}`}
                      >
                        {editAntiTarnish ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-stoneGray">Jewellery Care Instructions</label>
                    <textarea
                      rows={2}
                      value={editCareInstructions}
                      onChange={(e) => setEditCareInstructions(e.target.value)}
                      placeholder="Provide recommended care, cleaning cloth, chemical storage guidelines..."
                      className="w-full rounded-2xl border border-goldBeige bg-warmwhite px-4 py-3 text-charcoalBrown outline-none focus:border-champagne transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Section 6: Promo Toggles */}
                <div className="space-y-4 pt-4 border-t border-goldBeige/40">
                  <h4 className="text-xs font-semibold text-champagne uppercase tracking-widest">Storefront Marketing Parameters</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Featured */}
                    <div className="flex items-center justify-between bg-beige px-4 py-3 rounded-full border border-goldBeige/40">
                      <span className="text-xs text-charcoalBrown font-medium">Featured Item</span>
                      <button
                        type="button"
                        onClick={() => setEditIsFeatured(!editIsFeatured)}
                        className={`text-champagne ${editIsFeatured ? "text-champagne" : "text-stoneGray/30"}`}
                      >
                        {editIsFeatured ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                      </button>
                    </div>

                    {/* Best Seller */}
                    <div className="flex items-center justify-between bg-beige px-4 py-3 rounded-full border border-goldBeige/40">
                      <span className="text-xs text-charcoalBrown font-medium">Best Seller Badge</span>
                      <button
                        type="button"
                        onClick={() => setEditIsBestSeller(!editIsBestSeller)}
                        className={`text-champagne ${editIsBestSeller ? "text-champagne" : "text-stoneGray/30"}`}
                      >
                        {editIsBestSeller ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                      </button>
                    </div>

                    {/* New Arrival */}
                    <div className="flex items-center justify-between bg-beige px-4 py-3 rounded-full border border-goldBeige/40">
                      <span className="text-xs text-charcoalBrown font-medium">New Arrival Flag</span>
                      <button
                        type="button"
                        onClick={() => setEditIsNewArrival(!editIsNewArrival)}
                        className={`text-champagne ${editIsNewArrival ? "text-champagne" : "text-stoneGray/30"}`}
                      >
                        {editIsNewArrival ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                      </button>
                    </div>

                    {/* Flash Deal */}
                    <div className="flex items-center justify-between bg-beige px-4 py-3 rounded-full border border-goldBeige/40">
                      <span className="text-xs text-charcoalBrown font-medium">Flash Deals Slider</span>
                      <button
                        type="button"
                        onClick={() => setEditIsFlashDeal(!editIsFlashDeal)}
                        className={`text-champagne ${editIsFlashDeal ? "text-champagne" : "text-stoneGray/30"}`}
                      >
                        {editIsFlashDeal ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                      </button>
                    </div>

                    {/* Trending */}
                    <div className="flex items-center justify-between bg-beige px-4 py-3 rounded-full border border-goldBeige/40">
                      <span className="text-xs text-charcoalBrown font-medium">Trending Feed list</span>
                      <button
                        type="button"
                        onClick={() => setEditIsTrending(!editIsTrending)}
                        className={`text-champagne ${editIsTrending ? "text-champagne" : "text-stoneGray/30"}`}
                      >
                        {editIsTrending ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                      </button>
                    </div>

                    {/* Listing Status */}
                    <div className="flex items-center justify-between bg-beige px-4 py-3 rounded-full border border-goldBeige/40">
                      <span className="text-xs text-charcoalBrown font-medium">Listings Active status</span>
                      <button
                        type="button"
                        onClick={() => setEditIsActive(!editIsActive)}
                        className={`text-champagne ${editIsActive ? "text-champagne" : "text-stoneGray/30"}`}
                      >
                        {editIsActive ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Drawer Footer Actions */}
              <div className="border-t border-goldBeige/40 pt-4 mt-6 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="rounded-full border border-goldBeige px-6 py-2.5 text-charcoalBrown hover:bg-beige/40 text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saveLoading}
                  onClick={handleSaveProduct}
                  className="rounded-full bg-champagne px-6 py-2.5 text-charcoalBrown font-semibold hover:opacity-90 transition-all text-sm shadow-jewel"
                >
                  {saveLoading ? "Saving Customizations..." : "Save Product Details"}
                </button>
              </div>

            </div>
          </div>
        )}

      </section>
    </Protected>
  );
}
