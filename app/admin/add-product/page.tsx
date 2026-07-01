"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { addProduct, getCategories, uploadImage } from "@/lib/firestore";
import { Product, Category } from "@/types";
import { slugify } from "@/lib/utils";
import { X, Upload, Save, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { HeartLoader } from "@/components/ui/HeartLoader";
import { AdminCard } from "@/components/admin/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</Label>
      {children}
    </div>
  );
}

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  // Form Fields State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [regularPrice, setRegularPrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [stock, setStock] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [warranty, setWarranty] = useState("");
  const [returnPolicy, setReturnPolicy] = useState("");

  // Jewellery Fields
  const [material, setMaterial] = useState("");
  const [careInstructions, setCareInstructions] = useState("");
  const [badgesText, setBadgesText] = useState("");
  
  // Promo Flags
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isActive, setIsActive] = useState(true);

  // Image input
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    const data = await getCategories();
    setCategories(data);
    if (data.length > 0) {
      setCategory(data[0].slug || slugify(data[0].name));
    }
    setLoading(false);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImg(true);
    try {
      const url = await uploadImage(file);
      setImages([...images, url]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image.");
    } finally {
      setUploadingImg(false);
    }
  }

  function handleAddImageUrl() {
    if (!newImageUrl.trim()) return;
    setImages([...images, newImageUrl.trim()]);
    setNewImageUrl("");
  }

  function handleRemoveImage(index: number) {
    setImages(images.filter((_, idx) => idx !== index));
  }

  async function handleSubmit() {
    // Safe validation checks
    if (!name || !name.trim()) return toast.error("Product name is required.");
    if (!category || !category.trim()) return toast.error("Category is required.");
    if (!description || !description.trim()) return toast.error("Product description is required.");
    
    const parsedSale = Number(salePrice);
    const parsedReg = Number(regularPrice);
    
    if ((isNaN(parsedReg) || parsedReg <= 0) && (isNaN(parsedSale) || parsedSale <= 0)) {
      return toast.error("Regular price or Sale price must be a valid positive number.");
    }
    if (stock === undefined || stock === null || Number(stock) < 0 || isNaN(Number(stock))) {
      return toast.error("Stock availability is required and must be a valid number >= 0.");
    }

    setSaving(true);
    try {
      const finalSalePrice = isNaN(Number(salePrice)) ? 0 : Number(salePrice);
      const finalRegularPrice = isNaN(Number(regularPrice)) ? finalSalePrice : Number(regularPrice);
      const discountPercentage = finalRegularPrice ? Math.round(((finalRegularPrice - finalSalePrice) / finalRegularPrice) * 100) : 0;
      const finalImages = images && images.length > 0 ? images : ["/placeholder.png"];

      const baseSlug = slugify(name);
      const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
      const finalBadges = badgesText.split(",").map(b => b.trim()).filter(Boolean);

      const selectedCat = categories.find(c => c.slug === category || c.id === category);
      const catName = selectedCat ? selectedCat.name : category;
      
      const productPayload: Omit<Product, "id"> = {
        name: name.trim(),
        slug: uniqueSlug,
        category: catName.trim(),
        categoryId: category.trim(),
        categorySlug: category.trim(),
        description: (description || "").trim(),
        regularPrice: finalRegularPrice,
        salePrice: finalSalePrice,
        discountPercentage: discountPercentage > 0 ? discountPercentage : 0,
        images: finalImages,
        thumbnail: finalImages[0],
        stock: Number(stock),
        rating: 4.5,
        reviewCount: 0,
        specifications: {},
        variants: [],
        badges: finalBadges,
        isFeatured,
        isBestSeller,
        isNewArrival,
        isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (subCategory && subCategory.trim()) productPayload.subCategory = subCategory.trim();
      if (brand && brand.trim()) productPayload.brand = brand.trim();
      if (warranty && warranty.trim()) productPayload.warranty = warranty.trim();
      if (returnPolicy && returnPolicy.trim()) productPayload.returnPolicy = returnPolicy.trim();
      if (material && material.trim()) productPayload.material = material.trim();
      if (careInstructions && careInstructions.trim()) productPayload.careInstructions = careInstructions.trim();

      const cleanPayload: any = {};
      Object.entries(productPayload).forEach(([k, v]) => {
        if (v !== undefined) cleanPayload[k] = v;
      });

      await addProduct(cleanPayload as Omit<Product, "id">);
      toast.success("Product added successfully!");
      
      router.push("/admin/products");
    } catch (err: any) {
      console.error("Add Product Error:", err);
      toast.error(`Error creating product: ${err?.message || err}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold text-foreground tracking-tight">Add Product</h1>
          <p className="text-muted-foreground mt-1">Create a new listing for the catalog</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild><Link href="/admin/products"><X className="h-4 w-4 mr-1" />Discard</Link></Button>
          <Button onClick={handleSubmit} disabled={saving} className="bg-[var(--gradient-rose)] text-white hover:opacity-90 border-none min-w-[120px]">
            {saving ? <HeartLoader size="sm" text="" /> : <><Save className="h-4 w-4 mr-1" /> Publish</>}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground animate-pulse">Loading forms...</div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <AdminCard title="Basic Information">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Product Name">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Rose Gold Pearl Necklace" />
                </Field>
                <Field label="Category">
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-card/60 px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
                  >
                    {categories.map((c) => <option key={c.id} value={c.slug || slugify(c.name)}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Regular Price (₹)">
                  <Input type="number" value={regularPrice || ""} onChange={(e) => setRegularPrice(Number(e.target.value))} placeholder="4999" />
                </Field>
                <Field label="Sale Price (₹)">
                  <Input type="number" value={salePrice || ""} onChange={(e) => setSalePrice(Number(e.target.value))} placeholder="3499" />
                </Field>
                <Field label="Stock">
                  <Input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} placeholder="50" />
                </Field>
                <Field label="Custom Tags">
                  <Input value={badgesText} onChange={(e) => setBadgesText(e.target.value)} placeholder="rose-gold, pearl, bridal (comma separated)" />
                </Field>
                <Field label="Brand">
                  <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Anti Tarnish Jewels" />
                </Field>
                <Field label="Subcategory">
                  <Input value={subCategory} onChange={(e) => setSubCategory(e.target.value)} placeholder="e.g. Chokers" />
                </Field>
              </div>
            </AdminCard>

            {/* Images */}
            <AdminCard title="Product Images">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl border border-border bg-secondary/50 overflow-hidden group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={12}/>
                    </button>
                    {idx === 0 && <span className="absolute bottom-1 left-1 text-[8px] bg-primary/20 text-primary uppercase font-bold px-1 py-0.5 rounded backdrop-blur">Cover</span>}
                  </div>
                ))}
                
                <label className="aspect-square rounded-xl border-2 border-dashed border-border bg-secondary/20 grid place-items-center cursor-pointer hover:border-primary transition-colors">
                  <div className="text-center px-2">
                    {uploadingImg ? <Loader className="h-5 w-5 mx-auto text-muted-foreground animate-spin" /> : <Upload className="h-5 w-5 mx-auto text-muted-foreground" />}
                    <p className="text-[11px] text-muted-foreground mt-1">Upload</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImg} className="hidden" />
                </label>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="Or add via URL link..." className="text-sm" />
                <Button variant="secondary" onClick={handleAddImageUrl}>Add</Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">PNG, JPG up to 5MB. First image becomes the cover.</p>
            </AdminCard>

            {/* Description */}
            <AdminCard title="Description & Details">
              <div className="space-y-4">
                <Field label="Description">
                  <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A timeless rose gold necklace finished with freshwater pearls…" />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Material">
                    <Input value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="316L Stainless Steel, 18k Rose Gold Plated" />
                  </Field>
                  <Field label="Care Instructions">
                    <Input value={careInstructions} onChange={(e) => setCareInstructions(e.target.value)} placeholder="Avoid water, perfume; store in pouch" />
                  </Field>
                </div>
              </div>
            </AdminCard>
          </div>

          <div className="space-y-6">
            {/* Visibility / Badges */}
            <AdminCard title="Visibility">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Active</p>
                    <p className="text-xs text-muted-foreground">Visible on storefront</p>
                  </div>
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Featured</p>
                    <p className="text-xs text-muted-foreground">Show on homepage</p>
                  </div>
                  <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Bestseller</p>
                    <p className="text-xs text-muted-foreground">Highlight as bestseller</p>
                  </div>
                  <input type="checkbox" checked={isBestSeller} onChange={(e) => setIsBestSeller(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">New Arrival</p>
                    <p className="text-xs text-muted-foreground">Highlight as new</p>
                  </div>
                  <input type="checkbox" checked={isNewArrival} onChange={(e) => setIsNewArrival(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                </div>
              </div>
            </AdminCard>

            <AdminCard title="Store Policies">
              <div className="space-y-4">
                <Field label="Warranty">
                  <Input value={warranty} onChange={(e) => setWarranty(e.target.value)} placeholder="e.g. 1 Year Manufacturer Warranty" />
                </Field>
                <Field label="Return Policy">
                  <Input value={returnPolicy} onChange={(e) => setReturnPolicy(e.target.value)} placeholder="e.g. 7 Days Replacement Policy" />
                </Field>
              </div>
            </AdminCard>
          </div>
        </div>
      )}
    </div>
  );
}
