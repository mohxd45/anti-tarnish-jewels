"use client";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { getBanners, addBanner, updateBanner, deleteBanner, uploadImage, getCategories, getProducts , logActivity } from "@/lib/firestore";
import { Banner, BannerPlacement, Category, Product } from "@/types";
import { Save, Trash2, Edit2, Upload, Plus, X } from "lucide-react";
import { AdminCard, StatusBadge } from "@/components/admin/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { HeartLoader } from "@/components/ui/HeartLoader";

function Field({ label, children, required }: { label: string; children: React.ReactNode, required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] uppercase tracking-wider text-adminMuted font-semibold">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
    </div>
  );
}

export default function BannersPage() {
  const { user } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Editor State
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [bData, cData, pData] = await Promise.all([
        getBanners(),
        getCategories(),
        getProducts()
      ]);
      setBanners(bData);
      setCategories(cData);
      setProducts(pData);
    } catch {
      toast.error("Failed to fetch data.");
    }
    setLoading(false);
  }

  function handleCreateNew() {
    setEditingBanner({
      title: "",
      subtitle: "",
      imageUrl: "",
      mobileImageUrl: "",
      ctaText: "Shop Now",
      linkType: "category",
      placement: "hero-banner",
      active: true,
      isActive: true,
      order: 1,
      priority: 1
    });
    setImageFile(null);
    setMobileImageFile(null);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function openEdit(banner: Banner) {
    setEditingBanner({ 
      ...banner, 
      active: banner.active ?? banner.isActive ?? true,
      order: banner.order ?? banner.priority ?? 1,
      linkType: banner.linkType || "custom-url",
      ctaText: banner.ctaText || banner.buttonText || "Shop Now"
    });
    setImageFile(null);
    setMobileImageFile(null);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingBanner(null);
    setImageFile(null);
    setMobileImageFile(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    setDeletingId(id);
    try {
      await deleteBanner(id);
      setBanners(banners.filter(b => b.id !== id));
      if (editingBanner?.id === id) cancelEdit();
      toast.success("Offer deleted successfully!");
    } catch {
      toast.error("Failed to delete offer.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingBanner) return;
    
    // Validation
    if (!editingBanner.title) return toast.error("Title is required");
    if (!editingBanner.imageUrl && !imageFile) return toast.error("Image is required");
    if (!editingBanner.linkType) return toast.error("Link type is required");
    
    if (editingBanner.linkType === "offer-page") {
      if (!editingBanner.slug) return toast.error("Slug is required for Offer Page");
      // Basic slug validation
      if (!/^[a-z0-9-]+$/.test(editingBanner.slug)) {
        return toast.error("Slug must be lowercase, numbers, and hyphens only");
      }
    }

    setUploading(true);
    try {
      let finalImageUrl = editingBanner.imageUrl || "";
      let finalMobileImageUrl = editingBanner.mobileImageUrl || "";

      if (imageFile) finalImageUrl = await uploadImage(imageFile, "banner-images");
      if (mobileImageFile) finalMobileImageUrl = await uploadImage(mobileImageFile, "banner-images");

      // Auto-sync legacy fields for backward compatibility
      const payload: Partial<Banner> = {
        ...editingBanner,
        imageUrl: finalImageUrl,
        mobileImageUrl: finalMobileImageUrl,
        isActive: editingBanner.active,
        priority: editingBanner.order,
        buttonText: editingBanner.ctaText,
        link: editingBanner.linkUrl || "",
        updatedAt: new Date().toISOString()
      };

      if (editingBanner.id) {
        await updateBanner(editingBanner.id, payload);
        setBanners(banners.map(b => b.id === editingBanner.id ? ({ ...b, ...payload } as Banner) : b));
        toast.success("Offer updated successfully!");
      } else {
        const newId = await addBanner({
          ...payload,
          createdAt: new Date().toISOString()
        } as Omit<Banner, "id">);
        setBanners([...banners, { id: newId, ...payload, createdAt: new Date().toISOString() } as Banner]);
        toast.success("Offer added successfully!");
      }
      cancelEdit();
    } catch (err) {
      toast.error("Failed to save offer.");
    }
    setUploading(false);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-adminSidebar tracking-tight">Offers & Banners</h1>
          <p className="text-adminMuted mt-1">Promote collections and manage dynamic offer pages</p>
        </div>
        <Button onClick={handleCreateNew} className="bg-adminRose text-white hover:bg-adminRose/90 border-none shrink-0 w-fit rounded-full shadow-md">
          <Plus className="h-4 w-4 mr-1" /> New Offer
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Banners List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-adminMuted">
              <HeartLoader text="Loading offers..." />
            </div>
          ) : banners.length === 0 ? (
            <AdminCard className="p-12 text-center shadow-sm bg-white border-adminBorder">
              <h3 className="text-xl font-serif text-adminSidebar">No Offers Found</h3>
              <p className="text-adminMuted text-sm mt-2">Click "New Offer" to create your first promotion.</p>
            </AdminCard>
          ) : (
            banners.map((b) => {
              const activeStat = b.active ?? b.isActive ?? true;
              return (
              <div key={b.id} className="p-4 flex flex-col sm:flex-row gap-4 rounded-2xl border border-adminBorder bg-white hover:bg-adminBg transition-colors shadow-sm">
                <div className="sm:w-48 aspect-[4/3] rounded-xl shrink-0 overflow-hidden relative border border-adminBorder bg-adminBg">
                  {b.imageUrl ? (
                    <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-adminMuted text-xs">No Image</div>
                  )}
                  <span className="absolute top-2 left-2 bg-white/90 backdrop-blur border border-adminBorder text-adminSidebar px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider">
                    {b.placement}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-serif text-lg font-semibold leading-tight text-adminSidebar truncate">{b.title}</h3>
                        {b.subtitle && <p className="text-sm text-adminMuted truncate">{b.subtitle}</p>}
                        
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] uppercase font-semibold text-adminGold bg-adminGold/10 px-2 py-0.5 rounded-md">
                            {b.linkType || "custom-url"}
                          </span>
                          <span className="text-xs text-adminMuted truncate">
                            {b.linkType === "offer-page" && `/offers/${b.slug}`}
                            {b.linkType === "category" && `/shop?category=${b.categorySlug}`}
                            {b.linkType === "product" && `/product/${b.productSlug}`}
                            {(!b.linkType || b.linkType === "custom-url") && (b.linkUrl || b.link)}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={activeStat ? "Active" : "Inactive"} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-adminBorder">
                    <span className="text-xs text-adminSidebar bg-adminBg px-2 py-1 rounded-md border border-adminBorder">Order #{b.order ?? b.priority ?? 1}</span>
                    <span className="ml-auto" />
                    <Button size="sm" variant="outline" onClick={() => openEdit(b)} className="rounded-xl h-8 text-xs border-adminBorder text-adminSidebar hover:bg-adminBg">
                      <Edit2 className="h-3 w-3 mr-1" />Edit
                    </Button>
                    <Button size="icon" variant="ghost" disabled={deletingId === b.id} onClick={() => handleDelete(b.id)} className="h-8 w-8 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50">
                      {deletingId === b.id ? <HeartLoader size="sm" text="" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
              </div>
            )})
          )}
        </div>

        {/* Right Side: Create/Edit Form */}
        <div ref={formRef} className="sticky top-6 max-h-[90vh] overflow-y-auto pb-6 -mr-4 pr-4 custom-scrollbar">
          <AdminCard title={editingBanner ? (editingBanner.id ? "Edit Offer" : "Create Offer") : "Offer Settings"} className="bg-white border-adminBorder shadow-sm">
            {editingBanner ? (
              <form onSubmit={handleSave} className="space-y-5">
                
                <Field label="Desktop Image" required>
                  <label className="aspect-[21/9] rounded-xl border-2 border-dashed border-adminBorder bg-adminBg grid place-items-center cursor-pointer hover:border-adminGold transition-colors overflow-hidden relative">
                    {imageFile || editingBanner.imageUrl ? (
                      <img src={imageFile ? URL.createObjectURL(imageFile) : editingBanner.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="text-center px-4">
                        <Upload className="h-5 w-5 mx-auto text-adminMuted" />
                        <p className="text-[10px] text-adminMuted mt-1">Upload Desktop Image</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="hidden" />
                  </label>
                  <Input value={editingBanner.imageUrl || ""} onChange={(e) => setEditingBanner({ ...editingBanner, imageUrl: e.target.value })} placeholder="Or Image URL" className="text-xs h-8 bg-white border-adminBorder text-adminSidebar rounded-md" />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Title" required>
                    <Input required value={editingBanner.title || ""} onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })} placeholder="e.g. Monsoon Edit" className="text-sm h-9 bg-white border-adminBorder text-adminSidebar rounded-lg" />
                  </Field>
                  <Field label="Subtitle">
                    <Input value={editingBanner.subtitle || ""} onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })} placeholder="e.g. Up to 50% Off" className="text-sm h-9 bg-white border-adminBorder text-adminSidebar rounded-lg" />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Placement" required>
                    <select
                      value={editingBanner.placement}
                      onChange={(e) => setEditingBanner({ ...editingBanner, placement: e.target.value as BannerPlacement })}
                      className="w-full h-9 rounded-lg border border-adminBorder bg-white px-3 text-sm text-adminSidebar outline-none focus:ring-1 focus:ring-adminGold"
                    >
                      <option value="hero-banner">Hero Banner</option>
                      <option value="hero-floating-card">Hero Floating Card</option>
                      <option value="homepage-banner">Homepage Banner</option>
                      <option value="category-banner">Category Banner</option>
                    </select>
                  </Field>
                  <Field label="Sort Order">
                    <Input type="number" value={editingBanner.order || 1} onChange={(e) => setEditingBanner({ ...editingBanner, order: Number(e.target.value) })} className="text-sm h-9 bg-white border-adminBorder text-adminSidebar rounded-lg" min={1} />
                  </Field>
                </div>

                <div className="p-4 rounded-xl border border-adminGold/30 bg-adminGold/5 space-y-4">
                  <Field label="Link Type" required>
                    <select
                      value={editingBanner.linkType || "custom-url"}
                      onChange={(e) => setEditingBanner({ ...editingBanner, linkType: e.target.value as any })}
                      className="w-full h-9 rounded-md border border-adminGold/30 bg-white px-3 text-sm font-medium text-adminGold outline-none focus:ring-1 focus:ring-adminGold"
                    >
                      <option value="category">Category Page</option>
                      <option value="product">Specific Product</option>
                      <option value="offer-page">Dedicated Offer Page</option>
                      <option value="custom-url">Custom URL</option>
                    </select>
                  </Field>

                  {editingBanner.linkType === "category" && (
                    <Field label="Select Category" required>
                      <select
                        value={editingBanner.categorySlug || ""}
                        onChange={(e) => setEditingBanner({ ...editingBanner, categorySlug: e.target.value })}
                        className="w-full h-9 rounded-md border border-adminBorder bg-white px-3 text-sm text-adminSidebar outline-none focus:ring-1 focus:ring-adminGold"
                        required
                      >
                        <option value="">-- Choose Category --</option>
                        {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                      </select>
                    </Field>
                  )}

                  {editingBanner.linkType === "product" && (
                    <Field label="Select Product" required>
                      <select
                        value={editingBanner.productSlug || ""}
                        onChange={(e) => setEditingBanner({ ...editingBanner, productSlug: e.target.value })}
                        className="w-full h-9 rounded-md border border-adminBorder bg-white px-3 text-sm text-adminSidebar outline-none focus:ring-1 focus:ring-adminGold"
                        required
                      >
                        <option value="">-- Choose Product --</option>
                        {products.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}
                      </select>
                    </Field>
                  )}

                  {editingBanner.linkType === "custom-url" && (
                    <Field label="Destination URL" required>
                      <Input value={editingBanner.linkUrl || editingBanner.link || ""} onChange={(e) => setEditingBanner({ ...editingBanner, linkUrl: e.target.value, link: e.target.value })} placeholder="/shop?filter=gold" className="text-sm h-9 bg-white border-adminBorder text-adminSidebar rounded-md" required />
                    </Field>
                  )}

                  <Field label="CTA Button Text">
                    <Input value={editingBanner.ctaText || ""} onChange={(e) => setEditingBanner({ ...editingBanner, ctaText: e.target.value })} placeholder="Shop Now" className="text-sm h-9 bg-white border-adminBorder text-adminSidebar rounded-md" />
                  </Field>
                </div>

                {editingBanner.linkType === "offer-page" && (
                  <div className="p-4 rounded-xl border border-adminBorder bg-adminBg space-y-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-adminMuted border-b border-adminBorder pb-2">Offer Page Content</h4>
                    
                    <Field label="URL Slug (Required)" required>
                      <div className="flex items-center">
                        <span className="text-xs text-adminMuted bg-adminBg px-2 py-2 rounded-l-md border border-r-0 border-adminBorder">/offers/</span>
                        <Input required value={editingBanner.slug || ""} onChange={(e) => setEditingBanner({ ...editingBanner, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} placeholder="monsoon-sale-2026" className="text-sm h-9 rounded-l-none bg-white border-adminBorder text-adminSidebar" />
                      </div>
                    </Field>

                    <Field label="Page Title (Defaults to Banner Title)">
                      <Input value={editingBanner.pageTitle || ""} onChange={(e) => setEditingBanner({ ...editingBanner, pageTitle: e.target.value })} placeholder="Exclusive Monsoon Sale" className="text-sm h-9 bg-white border-adminBorder text-adminSidebar rounded-md" />
                    </Field>

                    <Field label="Page Description">
                      <textarea
                        value={editingBanner.pageDescription || ""}
                        onChange={(e) => setEditingBanner({ ...editingBanner, pageDescription: e.target.value })}
                        placeholder="Welcome to our beautiful monsoon edit..."
                        className="w-full min-h-[80px] rounded-md border border-adminBorder bg-white px-3 py-2 text-sm text-adminSidebar outline-none focus:ring-1 focus:ring-adminGold"
                      />
                    </Field>

                    <Field label="Offer Details">
                      <textarea
                        value={editingBanner.offerDetails || ""}
                        onChange={(e) => setEditingBanner({ ...editingBanner, offerDetails: e.target.value })}
                        placeholder="Get 20% off on all Necklaces..."
                        className="w-full min-h-[80px] rounded-md border border-adminBorder bg-white px-3 py-2 text-sm text-adminSidebar outline-none focus:ring-1 focus:ring-adminGold"
                      />
                    </Field>

                    <Field label="Terms and Conditions">
                      <textarea
                        value={editingBanner.terms || ""}
                        onChange={(e) => setEditingBanner({ ...editingBanner, terms: e.target.value })}
                        placeholder="Valid till stocks last. Cannot be clubbed with..."
                        className="w-full min-h-[60px] rounded-md border border-adminBorder bg-white px-3 py-2 text-sm text-adminSidebar outline-none focus:ring-1 focus:ring-adminGold"
                      />
                    </Field>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Start Date">
                        <Input type="date" value={editingBanner.startDate || ""} onChange={(e) => setEditingBanner({ ...editingBanner, startDate: e.target.value })} className="text-sm h-9 bg-white border-adminBorder text-adminSidebar rounded-md" />
                      </Field>
                      <Field label="End Date">
                        <Input type="date" value={editingBanner.endDate || ""} onChange={(e) => setEditingBanner({ ...editingBanner, endDate: e.target.value })} className="text-sm h-9 bg-white border-adminBorder text-adminSidebar rounded-md" />
                      </Field>
                    </div>

                    <Field label="Fallback CTA Link">
                      <Input value={editingBanner.linkUrl || ""} onChange={(e) => setEditingBanner({ ...editingBanner, linkUrl: e.target.value })} placeholder="/shop (if they click button on offer page)" className="text-sm h-9 bg-white border-adminBorder text-adminSidebar rounded-md" />
                    </Field>
                  </div>
                )}

                <div className="pt-2 border-t border-adminBorder">
                  <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!editingBanner.active}
                      onChange={(e) => setEditingBanner({ ...editingBanner, active: e.target.checked })}
                      className="accent-adminGold h-4 w-4 rounded border-adminBorder text-adminGold"
                    />
                    <div>
                      <div className="font-medium text-adminSidebar">Active Status</div>
                      <div className="text-[10px] text-adminMuted">Show this offer publicly</div>
                    </div>
                  </label>
                </div>

                <div className="flex gap-2 pt-2 pb-8">
                  {editingBanner.id && (
                    <Button type="button" variant="outline" onClick={cancelEdit} className="w-full rounded-full border-adminBorder text-adminSidebar hover:bg-adminBg">
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" disabled={uploading} className="w-full rounded-full bg-adminRose text-white hover:bg-adminRose/90 border-none shadow-md">
                    {uploading ? <HeartLoader size="sm" text="" /> : "Save Offer"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="py-12 text-center text-adminMuted">
                <div className="bg-adminBg w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plus className="h-6 w-6 text-adminGold" />
                </div>
                <p className="text-sm">Select an offer to edit or click "New Offer" to create one.</p>
                <Button variant="outline" onClick={handleCreateNew} className="mt-4 rounded-full border-adminBorder text-adminSidebar hover:bg-adminBg">
                  Create New Offer
                </Button>
              </div>
            )}
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
