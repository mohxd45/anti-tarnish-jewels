"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, use } from "react";
import { getProduct, getBundleItems, addBundleItem, updateBundleItem, deleteBundleItem, uploadImage } from "@/lib/firestore";
import { Product, BundleItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Edit2, Trash2, Plus, Search, Image as ImageIcon, CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";
import { HeartLoader } from "@/components/ui/HeartLoader";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { toast } from "sonner";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function BundleItemsManagerPage({ params }: { params: Promise<{ bundleId: string }> }) {
  const { user } = useAuth();
  const resolvedParams = use(params);
  const bundleId = resolvedParams.bundleId;

  const [bundle, setBundle] = useState<Product | null>(null);
  const [items, setItems] = useState<BundleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters for stock report
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStock, setFilterStock] = useState<"All" | "In Stock" | "Low Stock" | "Out of Stock">("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BundleItem | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [stock, setStock] = useState(10);
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, [bundleId]);

  async function loadData() {
    setLoading(true);
    try {
      const b = await getProduct(bundleId);
      if (b) setBundle(b);
      
      const loadedItems = await getBundleItems(bundleId);
      setItems(loadedItems);
    } catch (error) {
      toast.error("Failed to load bundle data");
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingItem(null);
    setName("");
    setSku("");
    setDescription("");
    setImages([]);
    setStock(10);
    setIsActive(true);
    setSortOrder(items.length);
    setIsModalOpen(true);
  }

  function openEditModal(item: BundleItem) {
    setEditingItem(item);
    setName(item.name);
    setSku(item.sku);
    setDescription(item.description);
    setImages(item.images || []);
    setStock(item.stock);
    setIsActive(item.active);
    setSortOrder(item.sortOrder);
    setIsModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this bundle item?")) return;
    try {
      await deleteBundleItem(id);
      setItems(items.filter(i => i.id !== id));
      toast.success("Item deleted");
    } catch (err) {
      toast.error("Failed to delete item");
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Image ${file.name} must be less than 10MB`);
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(`Image ${file.name} must be JPG, PNG, or WebP`);
        return;
      }
    }

    try {
      setIsUploading(true);
      toast.loading(`Uploading ${files.length} image(s)...`);
      
      const uploadPromises = files.map(file => {
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
        return uploadImage(file, `bundle-item-images/${bundleId}/${Date.now()}_${safeName}`);
      });
      
      const urls = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...urls]);
      
      toast.dismiss();
      toast.success("Images uploaded successfully!");
    } catch (err: any) {
      toast.dismiss();
      toast.error(`Failed to upload images: ${err.message || 'Unknown error'}`);
      console.error("Image upload error:", err);
    } finally {
      setIsUploading(false);
      // Reset file input so same file can be selected again if needed
      e.target.value = '';
    }
  }

  function removeImage(idx: number) {
    setImages(images.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }
    
    if (stock < 0) {
      toast.error("Stock cannot be negative.");
      return;
    }

    const payload = {
      bundleId,
      name: name.trim(),
      sku: sku.trim() || "",
      description: description.trim() || "",
      images: images || [],
      stock: Number(stock) || 0,
      active: isActive,
      sortOrder: Number(sortOrder) || 0,
    };

    // Remove any explicitly undefined fields
    const cleanPayload = JSON.parse(JSON.stringify(payload));

    setIsSaving(true);
    try {
      if (editingItem) {
        await updateBundleItem(editingItem.id, {
          ...cleanPayload,
          updatedAt: new Date().toISOString()
        });
        toast.success("Item updated");
      } else {
        await addBundleItem({
          ...cleanPayload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        toast.success("Item created");
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error("Save item error:", err);
      toast.error(`Failed to save item: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  }

  async function quickUpdateStock(id: string, newStock: number) {
    try {
      await updateBundleItem(id, { stock: newStock });
      setItems(items.map(i => i.id === id ? { ...i, stock: newStock } : i));
      toast.success("Stock updated");
    } catch (err) {
      toast.error("Failed to update stock");
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStock = true;
    if (filterStock === "In Stock") matchesStock = item.stock > 5;
    if (filterStock === "Low Stock") matchesStock = item.stock > 0 && item.stock <= 5;
    if (filterStock === "Out of Stock") matchesStock = item.stock <= 0 || !item.active;

    return matchesSearch && matchesStock;
  });

  if (loading) return <div className="p-8 flex justify-center"><HeartLoader /></div>;

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-adminBorder pb-6">
        <div>
          <Link href="/admin/bundles" className="flex items-center gap-2 text-sm text-adminMuted hover:text-adminGold mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Bundles
          </Link>
          <h1 className="text-3xl font-serif text-adminGold">Bundle Items</h1>
          <p className="text-adminSidebar">
            Manage independent items for <span className="font-semibold">{bundle?.name}</span>
          </p>
        </div>
        <Button onClick={openCreateModal} className="bg-adminGold hover:bg-adminGold/90 text-white gap-2 rounded-xl">
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-adminBorder overflow-hidden">
        <div className="p-5 border-b border-adminBorder flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 font-serif text-adminGold">
            <h2 className="text-lg">Inventory Report</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative max-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-adminMuted" />
              <Input 
                placeholder="Search..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 bg-adminBg border-none h-9 text-sm rounded-lg"
              />
            </div>
            <select 
              value={filterStock} 
              onChange={e => setFilterStock(e.target.value as any)}
              className="h-9 rounded-lg border border-adminBorder bg-white px-3 py-1 text-sm text-adminSidebar focus-visible:outline-none"
            >
              <option value="All">All Items</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock / Inactive</option>
            </select>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <EmptyStateCard icon={Plus} text="No items found" subtext="Add items to this bundle or adjust filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-adminBg text-adminSidebar font-medium">
                <tr>
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-adminBorder">
                {filteredItems.map(item => {
                  const isOos = item.stock <= 0 || !item.active;
                  const isLow = item.stock > 0 && item.stock <= 5;
                  
                  return (
                    <tr key={item.id} className="hover:bg-adminBg/50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-adminBg border border-adminBorder shrink-0">
                          {item.images?.[0] ? <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "/product-stack.jpg"; }} /> : <ImageIcon className="w-5 h-5 m-auto mt-3.5 text-adminMuted" />}
                        </div>
                        <span className="font-medium text-adminSidebar">{item.name}</span>
                      </td>
                      <td className="px-6 py-4 text-adminMuted font-mono text-xs">{item.sku}</td>
                      <td className="px-6 py-4">
                        {isOos ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
                            <XCircle className="w-3.5 h-3.5" /> Offline / OOS
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 max-w-[100px]">
                          <Input 
                            type="number" 
                            value={item.stock} 
                            onChange={(e) => quickUpdateStock(item.id, Number(e.target.value))}
                            className="h-8 px-2 text-center bg-white border-adminBorder"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(item)} className="h-8 w-8 text-adminSidebar hover:text-adminGold">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-adminSidebar hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 bg-white shadow-xl rounded-2xl border border-adminBorder overflow-hidden">
          <div className="p-6 pb-4 border-b border-adminBorder shrink-0 bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl text-adminGold font-serif">
                {editingItem ? "Edit Bundle Item" : "Create Bundle Item"}
              </DialogTitle>
              <DialogDescription>
                This item will only be available inside this bundle.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-6 p-6 overflow-y-auto flex-1 bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Item Name *</label>
                <Input value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">SKU *</label>
                <Input value={sku} onChange={e => setSku(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Stock *</label>
                <Input type="number" value={stock} onChange={e => setStock(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort Order</label>
                <Input type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} />
              </div>
            </div>

            <div className="space-y-3 border border-adminBorder p-5 rounded-2xl bg-stone-50/50">
              <label className="text-sm font-medium text-adminGold">Images</label>
              <div className="flex items-center gap-4 flex-wrap">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-adminBorder bg-white">
                    <img src={img} alt="upload" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-adminGold/90 text-[9px] text-white text-center py-0.5 font-bold uppercase tracking-wider">Primary</span>}
                  </div>
                ))}
                
                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-adminBorder hover:border-adminGold flex flex-col items-center justify-center cursor-pointer transition-colors bg-white">
                  <Plus className="w-5 h-5 text-adminMuted mb-1" />
                  <span className="text-[10px] text-adminMuted">Upload</span>
                  <input type="file" className="hidden" accept="image/jpeg, image/png, image/webp" multiple onChange={handleImageUpload} disabled={isUploading || isSaving} />
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="accent-adminGold w-4 h-4" /> Active (Visible in bundle)
              </label>
            </div>
          </div>
          
          <div className="p-4 border-t border-adminBorder bg-stone-50 shrink-0 flex justify-end gap-3 rounded-b-2xl">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSaving || isUploading}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving || isUploading} className="bg-adminGold hover:bg-adminGold/90 text-white rounded-xl">
              {isSaving ? "Saving..." : "Save Item"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
