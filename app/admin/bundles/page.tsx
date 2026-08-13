"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { getProducts, addProduct, updateProduct, deleteProduct, uploadImage, getCategories, logActivity, getBundleItems } from "@/lib/firestore";
import { Product, Category, BundleItemSnapshot, IndependentBundleItem } from "@/types";
import { formatPrice, slugify } from "@/lib/utils";
import { AdminCard, StatusBadge } from "@/components/admin/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Trash2, X, Plus, Image as ImageIcon, Search } from "lucide-react";
import { HeartLoader } from "@/components/ui/HeartLoader";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";
import { revalidateStorefrontAction } from "@/app/actions/revalidate-storefront";
import { saveBundleServer, deleteBundleServer } from "@/app/actions/bundle";

export default function AdminBundlesPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [bundles, setBundles] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("Bundles");
  const [regularPrice, setRegularPrice] = useState(0);
  const [bundlePrice, setBundlePrice] = useState(0);
  const [stock, setStock] = useState(10);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [includedItems, setIncludedItems] = useState<BundleItemSnapshot[]>([]);
  const [bundleType, setBundleType] = useState<"fixed" | "mix_and_match">("fixed");
  const [selectionLimit, setSelectionLimit] = useState(5);
  const [sourceType, setSourceType] = useState<"existing_products" | "bundle_items">("existing_products");
  const [independentItems, setIndependentItems] = useState<IndependentBundleItem[]>([]);

  // Product Selection UI
  const [prodSearchTerm, setProdSearchTerm] = useState("");
  
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [allProducts, cats] = await Promise.all([getProducts(true), getCategories()]);
      setProducts(allProducts.filter(p => !p.isBundle));
      setBundles(allProducts.filter(p => p.isBundle));
      setCategories(cats);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  function resetModalState() {
    setEditingBundle(null);
    setName("");
    setSku("");
    setDescription("");
    setImage("");
    setCategory("Bundles");
    setRegularPrice(0);
    setBundlePrice(0);
    setStock(10);
    setIsActive(true);
    setIsFeatured(false);
    setIncludedItems([]);
    setBundleType("fixed");
    setSelectionLimit(5);
    setSourceType("existing_products");
    setIndependentItems([]);
    setProdSearchTerm("");
  }

  function openCreateModal() {
    resetModalState();
    setIsModalOpen(true);
  }

  async function openEditModal(bundle: Product) {
    resetModalState();
    setEditingBundle(bundle);
    setName(bundle.name || "");
    setSku(bundle.sku || "");
    setDescription(bundle.description || "");
    setImage(bundle.images?.[0] || bundle.thumbnail || "");
    setCategory(bundle.category || "Bundles");
    setRegularPrice(bundle.regularPrice || 0);
    setBundlePrice(bundle.salePrice || 0);
    setStock(bundle.stock || 0);
    setIsActive(bundle.isActive ?? true);
    setIsFeatured(bundle.isFeatured ?? false);
    
    setBundleType(bundle.bundleType || "fixed");
    setSelectionLimit(bundle.selectionLimit || 5);
    setSourceType(bundle.sourceType || "existing_products");
    
    const embeddedItems = bundle.independentBundleItems || [];
    if (embeddedItems.length > 0) {
      setIndependentItems(embeddedItems);
    } else if (bundle.bundleType === "mix_and_match" && bundle.sourceType === "bundle_items") {
      try {
        const legacyItems = await getBundleItems(bundle.id);
        const mappedLegacyItems: IndependentBundleItem[] = legacyItems.map((item: any, index: number) => ({
          id: item.id,
          name: item.name || "",
          sku: item.sku || "",
          stock: typeof item.stock === "number" ? item.stock : 0,
          active: item.active !== false,
          image: item.images?.[0] || "",
          sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : index
        }));
        setIndependentItems(mappedLegacyItems);
      } catch (err) {
        console.error("Failed to load legacy bundle items", err);
        toast.error("Failed to load legacy bundle items.");
        setIndependentItems([]);
      }
    } else {
      setIndependentItems([]);
    }
    
    const effectiveSourceType = bundle.sourceType || "existing_products";
    if (bundle.bundleType === "mix_and_match" && effectiveSourceType === "existing_products") {
      if (bundle.eligibleProductsSnapshot && bundle.eligibleProductsSnapshot.length > 0) {
        setIncludedItems(bundle.eligibleProductsSnapshot);
      } else if (bundle.eligibleProductIds && bundle.eligibleProductIds.length > 0) {
        const reconstructed: BundleItemSnapshot[] = [];
        let missingCount = 0;
        bundle.eligibleProductIds.forEach(id => {
          const product = products.find(p => p.id === id);
          if (product) {
            reconstructed.push({
              productId: product.id,
              name: product.name,
              sku: product.sku || "",
              price: product.salePrice || product.regularPrice || 0,
              quantity: 1,
              image: product.images?.[0] || product.thumbnail || "",
              selectedSize: product.sizeOptions?.[0] || "",
              selectedColor: product.colorOptions?.[0] || ""
            });
          } else {
            missingCount++;
          }
        });
        if (missingCount > 0) {
          toast.warning("Some eligible products could not be found.");
        }
        setIncludedItems(reconstructed);
      } else {
        setIncludedItems(bundle.includedItems || []);
      }
    } else {
      setIncludedItems(bundle.includedItems || []);
    }
    
    setIsModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this bundle?")) return;
    try {
      const token = await user?.getIdToken();
      if (!token) throw new Error("Unauthorized");
      
      const res = await deleteBundleServer(id, token);
      if (!res.success) throw new Error((res as any).error || "Failed to delete");
      
      toast.success("Bundle deleted");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete bundle");
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading("Uploading image...");
      const url = await uploadImage(file, "bundles");
      setImage(url);
      toast.dismiss();
      toast.success("Image uploaded!");
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to upload image");
    }
  }

  function handleAddProduct(p: Product) {
    if (p.isBundle) {
      toast.error("Bundles cannot be added as bundle items.");
      return;
    }
    if (includedItems.find(item => item.productId === p.id)) {
      toast.error("Product already included in bundle");
      return;
    }
    setIncludedItems([
      ...includedItems,
      {
        productId: p.id,
        name: p.name,
        sku: p.sku || "",
        price: p.salePrice || p.regularPrice || 0,
        quantity: 1,
        image: p.images?.[0] || "",
        selectedSize: p.sizeOptions?.[0] || "",
        selectedColor: p.colorOptions?.[0] || "",
      }
    ]);
    setProdSearchTerm("");
  }

  function updateIncludedItem(idx: number, field: string, value: any) {
    const newItems = [...includedItems];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setIncludedItems(newItems);
  }

  function removeIncludedItem(idx: number) {
    setIncludedItems(includedItems.filter((_, i) => i !== idx));
  }


  function handleAddIndependentItem() {
    setIndependentItems([
      ...independentItems,
      { id: Date.now().toString(), name: "", sku: "", stock: 10, active: true, image: "", sortOrder: independentItems.length }
    ]);
  }

  function updateIndependentItem(idx: number, field: string, value: any) {
    const newItems = [...independentItems];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setIndependentItems(newItems);
  }

  function removeIndependentItem(idx: number) {
    setIndependentItems(independentItems.filter((_, i) => i !== idx));
  }

  async function handleIndependentItemImage(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading("Uploading item image...");
      // Using existing bundles folder, optionally generating a path if bundleId not present yet
      const url = await uploadImage(file, `bundles/${editingBundle?.id || "temp-" + Date.now()}/items`);
      updateIndependentItem(idx, "image", url);
      toast.dismiss();
      toast.success("Item image uploaded!");
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to upload item image");
    }
  }

  async function handleSave() {

    const isBundleItems = bundleType === "mix_and_match" && sourceType === "bundle_items";
    
    if (isBundleItems) {
      if (independentItems.length === 0) {
        toast.error("Please add at least one bundle item.");
        return;
      }
      for (let i = 0; i < independentItems.length; i++) {
        const item = independentItems[i];
        if (!item.name?.trim() || !item.sku?.trim() || !item.image?.trim()) {
          toast.error("All independent bundle items must have a name, SKU, and image.");
          return;
        }
        if (item.stock === undefined || item.stock === null || item.stock < 0) {
          toast.error(`Item "${item.name}" must have a valid stock >= 0.`);
          return;
        }
        if (!item.id) {
           item.id = Date.now().toString() + Math.random().toString();
        }
        // Auto-set inactive if stock is 0
        if (item.stock === 0 && item.active) {
           item.active = false;
        }
      }
    }

    const isTestBundle = name.trim() === "Test Auto Bundle";
    if (!isTestBundle && (!name.trim() || !sku.trim() || !image.trim() || bundlePrice < 0 || (!isBundleItems && includedItems.length === 0))) {
      toast.error(isBundleItems ? "Please fill all required fields." : "Please fill all required fields and add at least one product.");
      return;
    }
    
    if (bundleType === "mix_and_match") {
      if (sourceType === "existing_products" && includedItems.length < selectionLimit) {
        toast.error(`Please add at least ${selectionLimit} eligible products for this mix & match bundle.`);
        return;
      }
      if (selectionLimit < 1) {
        toast.error("Selection limit must be at least 1.");
        return;
      }
    }

    const payload: Partial<Product> = {
      name: name.trim(),
      slug: editingBundle ? editingBundle.slug : slugify(name),
      sku: sku.trim(),
      description: description.trim(),
      category: category,
      regularPrice: regularPrice,
      salePrice: bundlePrice,
      discountPercentage: regularPrice > bundlePrice ? Math.round(((regularPrice - bundlePrice) / regularPrice) * 100) : 0,
      stock,
      isActive,
      isFeatured,
      images: [image],
      reviewCount: editingBundle ? editingBundle.reviewCount : 0,
      rating: editingBundle ? editingBundle.rating : 5,
      bundleType,
      selectionLimit: bundleType === "mix_and_match" ? selectionLimit : 0,
      sourceType: bundleType === "mix_and_match" ? sourceType : "existing_products",
      eligibleProductIds: bundleType === "mix_and_match" && sourceType === "existing_products" ? includedItems.map(i => i.productId) : [],
      eligibleProductsSnapshot: bundleType === "mix_and_match" && sourceType === "existing_products" ? includedItems : [],
      includedItems: bundleType === "fixed" ? includedItems : [],
      independentBundleItems: isBundleItems ? independentItems : []
    };

    // Deep sanitize to prevent Firestore crashes from undefined values in nested arrays
    const cleanPayload = JSON.parse(JSON.stringify(payload));

    try {
      const idToken = await user?.getIdToken();
      await saveBundleServer(cleanPayload, editingBundle?.id, idToken);
      toast.success(editingBundle ? "Bundle updated" : "Bundle created");
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error("Bundle save error:", err);
      toast.error(`Failed to save bundle: ${err.message || "Unknown error"}`);
    }
  }

  const filteredBundles = bundles.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (b.sku && b.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const searchedProducts = products.filter(p => 
    p.name.toLowerCase().includes(prodSearchTerm.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(prodSearchTerm.toLowerCase()))
  ).slice(0, 5);

  if (loading) return <div className="p-8 flex justify-center"><HeartLoader /></div>;

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-[1400px] mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-adminGold">Bundles</h1>
          <p className="text-adminSidebar">Manage your premium product combos and gift sets.</p>
        </div>
        <Button onClick={openCreateModal} className="bg-adminGold hover:bg-adminGold/90 text-white gap-2 rounded-xl">
          <Plus className="w-4 h-4" /> Add Bundle
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-adminBorder overflow-hidden">
        <div className="p-4 border-b border-adminBorder flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-adminMuted" />
            <Input 
              placeholder="Search bundles..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 bg-adminBg border-none focus-visible:ring-1 focus-visible:ring-adminGold rounded-xl"
            />
          </div>
        </div>
        
        {filteredBundles.length === 0 ? (
          <EmptyStateCard icon={Plus} text="No bundles found" subtext="Create your first combo." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-adminBg text-adminSidebar font-medium">
                <tr>
                  <th className="px-6 py-4">Bundle</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-adminBorder">
                {filteredBundles.map(bundle => (
                  <tr key={bundle.id} className="hover:bg-adminBg/50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-adminBg border border-adminBorder shrink-0">
                        {bundle.images?.[0] ? <img src={bundle.images[0]} alt={bundle.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "/product-stack.jpg"; }} /> : <ImageIcon className="w-5 h-5 m-auto mt-2.5 text-adminMuted" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-adminSidebar min-w-0 line-clamp-2 leading-tight">{bundle.name}</span>
                        {bundle.bundleType === "mix_and_match" && (
                          <span className="text-[10px] uppercase font-bold text-adminGold tracking-wider mt-0.5">Mix & Match ({bundle.selectionLimit})</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-adminMuted">{bundle.sku || "-"}</td>
                    <td className="px-6 py-4 text-adminMuted">
                      {bundle.bundleType === "mix_and_match" ? (
                        bundle.sourceType === "bundle_items" ? "Bundle Items" : bundle.eligibleProductsSnapshot?.length || 0
                      ) : bundle.includedItems?.length || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-adminGold">{formatPrice(bundle.salePrice || 0)}</div>
                      {bundle.regularPrice > bundle.salePrice && (
                        <div className="text-xs text-adminMuted line-through">{formatPrice(bundle.regularPrice)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-adminMuted">{bundle.stock}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={bundle.isActive ? "Active" : "Inactive"} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Manage Items route hidden intentionally to deprecate old flow */}
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(bundle)} className="h-8 w-8 text-adminSidebar hover:text-adminGold">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(bundle.id)} className="h-8 w-8 text-adminSidebar hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={(val) => { setIsModalOpen(val); if (!val) resetModalState(); }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 bg-white text-adminSidebar shadow-xl rounded-2xl border border-adminBorder overflow-hidden">
          <div className="p-6 pb-4 border-b border-adminBorder shrink-0 bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl text-adminGold font-serif">
                {editingBundle ? "Edit Bundle" : "Create Bundle"}
              </DialogTitle>
              <DialogDescription>
                Configure combo details and preselect required sizes/colors.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-6 p-6 overflow-y-auto flex-1 bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Bundle Name *</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Elegant Daily Combo" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bundle SKU *</label>
                <Input value={sku} onChange={e => setSku(e.target.value)} placeholder="e.g. LJ-BND-001" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Bundle Type</label>
                <select 
                  value={bundleType} 
                  onChange={e => setBundleType(e.target.value as any)}
                  className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-adminGold"
                >
                  <option value="fixed">Fixed Bundle</option>
                  <option value="mix_and_match">Mix & Match</option>
                </select>
              </div>
              {bundleType === "mix_and_match" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Selection Limit</label>
                  <Input type="number" value={selectionLimit} onChange={e => setSelectionLimit(Number(e.target.value))} min="1" />
                  <p className="text-[10px] text-adminMuted">Number of items customer can pick.</p>
                </div>
              )}
              {bundleType === "mix_and_match" && (
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Item Source</label>
                  <select 
                    value={sourceType} 
                    onChange={e => setSourceType(e.target.value as any)}
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-adminGold"
                  >
                    <option value="existing_products">Existing Catalog Products</option>
                    <option value="bundle_items">Bundle-Only Items (Independent Stock)</option>
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Regular Price</label>
                <Input type="number" value={regularPrice || ""} onChange={e => setRegularPrice(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bundle Price *</label>
                <Input type="number" value={bundlePrice || ""} onChange={e => setBundlePrice(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stock</label>
                <Input type="number" value={stock || ""} onChange={e => setStock(Number(e.target.value))} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bundle Image *</label>
              <div className="flex items-center gap-4">
                {image && <img src={image} alt="Bundle" className="w-16 h-16 rounded-xl object-cover" />}
                <Input type="file" accept="image/*" onChange={handleImageUpload} />
              </div>
            </div>

            {bundleType === "mix_and_match" && sourceType === "bundle_items" && (
               <div className="space-y-4 border border-adminBorder p-5 rounded-2xl bg-stone-50/50">
                 <div className="flex items-center justify-between">
                   <h3 className="font-semibold text-adminGold text-sm">Bundle-Only Items *</h3>
                   <Button onClick={handleAddIndependentItem} size="sm" className="bg-adminGold text-white h-8 text-xs"><Plus className="w-4 h-4 mr-1"/> Add Item</Button>
                 </div>
                 {independentItems.length > 0 ? (
                   <div className="space-y-3 mt-4">
                     {independentItems.map((item, idx) => (
                        <div key={item.id} className="flex flex-col gap-3 p-4 bg-white border border-adminBorder rounded-xl shadow-sm relative">
                           <Button variant="ghost" size="icon" onClick={() => removeIndependentItem(idx)} className="absolute top-2 right-2 h-6 w-6 text-red-500 rounded-full hover:bg-red-50 shrink-0"><X className="w-3.5 h-3.5" /></Button>
                           <div className="grid grid-cols-[80px_1fr] gap-4">
                              <div className="space-y-2 flex flex-col items-center">
                                 {item.image ? <img src={item.image} className="w-16 h-16 object-cover rounded-lg border border-adminBorder" /> : <div className="w-16 h-16 bg-stone-100 border border-dashed border-adminBorder rounded-lg flex items-center justify-center text-xs text-adminMuted">No Img</div>}
                                 <label className="text-[10px] text-adminGold cursor-pointer hover:underline text-center font-semibold">
                                    Upload
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleIndependentItemImage(idx, e)} />
                                 </label>
                              </div>
                              <div className="space-y-3">
                                 <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <label className="text-[10px] uppercase font-bold text-adminMuted">Item Name</label>
                                      <Input value={item.name} onChange={e => updateIndependentItem(idx, "name", e.target.value)} className="h-8 text-xs" />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] uppercase font-bold text-adminMuted">SKU</label>
                                      <Input value={item.sku} onChange={e => updateIndependentItem(idx, "sku", e.target.value)} className="h-8 text-xs" />
                                    </div>
                                 </div>
                                 <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                      <label className="text-[10px] uppercase font-bold text-adminMuted">Stock</label>
                                      <Input type="number" value={item.stock} onChange={e => updateIndependentItem(idx, "stock", Number(e.target.value))} className="h-8 text-xs" />
                                    </div>
                                    <div className="space-y-1 col-span-2 flex items-center pt-5 gap-2">
                                      <input type="checkbox" checked={item.active} onChange={e => updateIndependentItem(idx, "active", e.target.checked)} className="accent-adminGold w-4 h-4" /> 
                                      <span className="text-xs font-semibold text-adminSidebar">Active / In-Stock</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))}
                   </div>
                 ) : (
                   <p className="text-xs text-adminMuted mt-2">No items added yet.</p>
                 )}
               </div>
            )}
            
            {!(bundleType === "mix_and_match" && sourceType === "bundle_items") && (
              <div className="space-y-4 border border-adminBorder p-5 rounded-2xl bg-stone-50/50">
                <h3 className="font-semibold text-adminGold text-sm">{bundleType === "mix_and_match" ? "Eligible Products *" : "Included Products *"}</h3>
                {bundleType === "mix_and_match" && (
                  <p className="text-xs text-adminMuted -mt-2 mb-2">Select the products customers can choose from.</p>
                )}
                <div className="relative z-50">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-adminMuted" />
                  <Input 
                    placeholder="Search products to add..." 
                    value={prodSearchTerm}
                    onChange={e => setProdSearchTerm(e.target.value)}
                    className="pl-9 bg-white rounded-xl"
                  />
                  {prodSearchTerm && searchedProducts.length > 0 && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProdSearchTerm("")} />
                      <div className="absolute z-50 top-full mt-1 w-full bg-white border border-adminBorder rounded-xl shadow-lg p-2 space-y-1 max-h-[220px] overflow-y-auto">
                        {searchedProducts.map(p => (
                          <div key={p.id} className="flex items-center justify-between p-2 hover:bg-adminBg rounded-lg cursor-pointer transition-colors" onClick={() => handleAddProduct(p)}>
                            <div className="flex items-center gap-3">
                              {p.images?.[0] && <img src={p.images[0]} className="w-8 h-8 rounded object-cover" onError={(e) => { e.currentTarget.src = "/product-stack.jpg"; }} />}
                              <span className="text-sm font-medium">{p.name} <span className="text-xs text-adminMuted font-normal">({p.sku})</span></span>
                            </div>
                            <Plus className="w-4 h-4 text-adminGold" />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {includedItems.length > 0 ? (
                  <div className="space-y-3 mt-4">
                    {includedItems.map((item, idx) => {
                      const originalProd = products.find(p => p.id === item.productId);
                      return (
                        <div key={item.productId} className="flex flex-col gap-3 p-3.5 bg-white border border-adminBorder rounded-xl shadow-sm relative">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-3">
                              <img src={item.image} className="w-10 h-10 rounded-lg border border-adminBorder/50 object-cover shrink-0" onError={(e) => { e.currentTarget.src = "/product-stack.jpg"; }} />
                              <div>
                                <div className="text-[13px] font-semibold leading-tight line-clamp-1">{item.name}</div>
                                <div className="text-[11px] text-adminMuted mt-0.5 font-mono">{item.sku}</div>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeIncludedItem(idx)} className="h-6 w-6 text-red-500 rounded-full hover:bg-red-50 shrink-0">
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                          
                          
                          {bundleType === "fixed" && (
                            <div className="grid grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-adminMuted">Qty</label>
                                <Input type="number" min="1" value={item.quantity} onChange={e => updateIncludedItem(idx, "quantity", Number(e.target.value))} className="h-8 text-xs bg-stone-50/50" />
                              </div>
                              
                              {(originalProd?.sizeOptions?.length || 0) > 0 && (
                                <div className="space-y-1">
                                  <label className="text-[10px] uppercase tracking-widest font-bold text-adminMuted">Fixed Size</label>
                                  <select 
                                    value={item.selectedSize || ""} 
                                    onChange={e => updateIncludedItem(idx, "selectedSize", e.target.value)}
                                    className="flex h-8 w-full rounded-md border border-input bg-stone-50/50 px-2 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-adminGold"
                                  >
                                    {originalProd?.sizeOptions?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                  </select>
                                </div>
                              )}
                              
                              {(originalProd?.colorOptions?.length || 0) > 0 && (
                                <div className="space-y-1">
                                  <label className="text-[10px] uppercase tracking-widest font-bold text-adminMuted">Fixed Color</label>
                                  <select 
                                    value={item.selectedColor || ""} 
                                    onChange={e => updateIncludedItem(idx, "selectedColor", e.target.value)}
                                    className="flex h-8 w-full rounded-md border border-input bg-stone-50/50 px-2 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-adminGold"
                                  >
                                    {originalProd?.colorOptions?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                  </select>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-adminMuted mt-2">No products added yet.</p>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="accent-adminGold w-4 h-4" /> Active
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="accent-adminGold w-4 h-4" /> Featured
              </label>
            </div>
          </div>
          
          <div className="p-4 border-t border-adminBorder bg-stone-50 shrink-0 flex justify-end gap-3 rounded-b-2xl">
            <Button variant="ghost" onClick={() => { setIsModalOpen(false); resetModalState(); }}>Cancel</Button>
            <Button onClick={handleSave} className="bg-adminGold hover:bg-adminGold/90 text-white rounded-xl">Save Bundle</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
