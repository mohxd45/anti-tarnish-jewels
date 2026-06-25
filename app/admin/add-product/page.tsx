"use client";

import { useEffect, useState } from "react";
import { Protected } from "@/components/Protected";
import { addProduct, getCategories, uploadImage } from "@/lib/firestore";
import { Product, Category } from "@/types";
import { slugify } from "@/lib/utils";
import { X, Sparkles, Image as ImageIcon, Upload, Loader, Plus, ToggleLeft, ToggleRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { HeartLoader } from "@/components/ui/HeartLoader";

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
  const [collection, setCollection] = useState("");
  const [material, setMaterial] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [occasion, setOccasion] = useState("");
  const [careInstructions, setCareInstructions] = useState("");
  const [waterproof, setWaterproof] = useState(false);
  const [antiTarnish, setAntiTarnish] = useState(false);
  const [jewelleryType, setJewelleryType] = useState("");
  const [plating, setPlating] = useState("");
  const [stoneType, setStoneType] = useState("");
  const [badgesText, setBadgesText] = useState("");
  
  // Specifications
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  // Promo Flags
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true); // default true for new product
  const [isFlashDeal, setIsFlashDeal] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Image input
  const [newImageUrl, setNewImageUrl] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    const data = await getCategories();
    setCategories(data);
    if (data.length > 0) {
      setCategory(data[0].name);
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
      alert("Failed to upload image.");
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

  function handleAddSpec() {
    if (!newSpecKey.trim() || !newSpecValue.trim()) return;
    setSpecs([...specs, { key: newSpecKey.trim(), value: newSpecValue.trim() }]);
    setNewSpecKey("");
    setNewSpecValue("");
  }

  function handleRemoveSpec(index: number) {
    setSpecs(specs.filter((_, idx) => idx !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    // Safe validation checks
    if (!name || !name.trim()) {
      setMessage("Product name is required.");
      return;
    }
    if (!category || !category.trim()) {
      setMessage("Category is required.");
      return;
    }
    if (!description || !description.trim()) {
      setMessage("Product description is required.");
      return;
    }
    const parsedSale = Number(salePrice);
    const parsedReg = Number(regularPrice);
    
    if (
      (isNaN(parsedReg) || parsedReg <= 0) &&
      (isNaN(parsedSale) || parsedSale <= 0)
    ) {
      setMessage("Regular price or Sale price must be a valid positive number.");
      return;
    }
    if (stock === undefined || stock === null || Number(stock) < 0 || isNaN(Number(stock))) {
      setMessage("Stock availability is required and must be a valid number >= 0.");
      return;
    }

    setSaving(true);
    try {
      const specsObj: Record<string, string> = {};
      (specs || []).forEach((s) => {
        if (s && s.key && s.key.trim()) {
          specsObj[s.key.trim()] = (s.value || "").trim();
        }
      });

      const finalSalePrice = isNaN(Number(salePrice)) ? 0 : Number(salePrice);
      const finalRegularPrice = isNaN(Number(regularPrice)) ? finalSalePrice : Number(regularPrice);
      const discountPercentage = finalRegularPrice ? Math.round(((finalRegularPrice - finalSalePrice) / finalRegularPrice) * 100) : 0;
      const finalImages = images && images.length > 0 ? images : ["/product-placeholder.png"];

      // Safe slug generation
      const baseSlug = slugify(name);
      const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;

      const finalBadges = badgesText.split(",").map(b => b.trim()).filter(Boolean);

      const productPayload: Omit<Product, "id"> = {
        name: name.trim(),
        slug: uniqueSlug,
        category: category.trim(),
        description: (description || "").trim(),
        regularPrice: finalRegularPrice,
        salePrice: finalSalePrice,
        discountPercentage: discountPercentage > 0 ? discountPercentage : 0,
        images: finalImages,
        thumbnail: finalImages[0],
        stock: Number(stock),
        rating: 4.5,
        reviewCount: 0,
        specifications: specsObj,
        variants: [], // Default to empty array
        badges: finalBadges,
        isFeatured,
        isBestSeller,
        isNewArrival,
        isFlashDeal,
        isTrending,
        isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (subCategory && subCategory.trim()) productPayload.subCategory = subCategory.trim();
      if (brand && brand.trim()) productPayload.brand = brand.trim();
      if (warranty && warranty.trim()) productPayload.warranty = warranty.trim();
      if (returnPolicy && returnPolicy.trim()) productPayload.returnPolicy = returnPolicy.trim();
      
      // Jewellery Specifications
      if (collection && collection.trim()) productPayload.collection = collection.trim();
      if (material && material.trim()) productPayload.material = material.trim();
      if (color && color.trim()) productPayload.color = color.trim();
      if (size && size.trim()) productPayload.size = size.trim();
      if (occasion && occasion.trim()) productPayload.occasion = occasion.trim();
      if (careInstructions && careInstructions.trim()) productPayload.careInstructions = careInstructions.trim();
      if (waterproof) productPayload.waterproof = true;
      if (antiTarnish) productPayload.antiTarnish = true;
      if (jewelleryType && jewelleryType.trim()) productPayload.jewelleryType = jewelleryType.trim();
      if (plating && plating.trim()) productPayload.plating = plating.trim();
      if (stoneType && stoneType.trim()) productPayload.stoneType = stoneType.trim();

      // Deep Sanitize
      const cleanPayload: any = {};
      Object.entries(productPayload).forEach(([k, v]) => {
        if (v !== undefined) {
          cleanPayload[k] = v;
        }
      });

      console.log("Saving product payload:", cleanPayload);

      await addProduct(cleanPayload as Omit<Product, "id">);
      setMessage("✓ Product added successfully! Redirecting...");
      
      // Redirect back to inventory index
      setTimeout(() => {
        router.push("/admin/products");
      }, 1500);
    } catch (err: any) {
      console.error("Add Product Error:", err);
      setMessage(`Error creating product: ${err?.message || err}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Protected adminOnly>
      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className="border-b border-goldBeige pb-6 mb-8">
          <h1 className="text-4xl font-serif font-semibold text-champagne tracking-wide">Add New Product</h1>
          <p className="text-sm text-stoneGray mt-1">Insert a new item to the store catalog with specifications, pricing details, and categories.</p>
        </div>

        {loading ? (
          <HeartLoader text="Fetching categories catalog..." />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 rounded-[2rem] border border-goldBeige bg-warmwhite p-4 sm:p-8">
            
            {/* Section 1: Basic details */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-champagne uppercase tracking-widest flex items-center gap-1.5"><Sparkles size={14} /> Basic Product Details</h3>
              
              <div className="space-y-2">
                <label className="text-xs text-stoneGray">Product Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anti-Tarnish Solitaire Diamond Ring"
                  required
                  className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-3 text-charcoalBrown outline-none focus:border-gold text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-stoneGray block mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Anti Tarnish Jewels"
                    className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-3 text-charcoalBrown outline-none focus:border-gold text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-stoneGray block mb-1">Parent Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-3 text-charcoalBrown outline-none focus:border-gold text-sm appearance-none cursor-pointer"
                  >
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
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    placeholder="e.g. Rings"
                    className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-3 text-charcoalBrown outline-none focus:border-gold text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-stoneGray block mb-1">Available Stock</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    required
                    className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-3 text-charcoalBrown outline-none focus:border-gold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-stoneGray">Product Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide clear parameters and selling points..."
                  required
                  className="w-full rounded-2xl border border-goldBeige bg-warmwhite px-4 py-3 text-charcoalBrown outline-none focus:border-gold text-sm"
                />
              </div>
            </div>

            {/* Section 2: Pricing */}
            <div className="space-y-4 pt-4 border-t border-goldBeige">
              <h3 className="text-xs font-semibold text-champagne uppercase tracking-widest">Inventory Pricing Structure</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-stoneGray block mb-1">Regular List Price</label>
                  <input
                    type="number"
                    value={regularPrice || ""}
                    onChange={(e) => setRegularPrice(Number(e.target.value))}
                    required
                    placeholder="e.g. 12000"
                    className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-3 text-charcoalBrown outline-none focus:border-gold text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-stoneGray block mb-1">Sale Discounted Price</label>
                  <input
                    type="number"
                    value={salePrice || ""}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                    placeholder="e.g. 9999"
                    className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-3 text-charcoalBrown outline-none focus:border-gold text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Image Grid */}
            <div className="space-y-4 pt-4 border-t border-goldBeige">
              <h3 className="text-xs font-semibold text-champagne uppercase tracking-widest flex items-center gap-1.5"><ImageIcon size={14} /> Product Images Grid</h3>
              
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl bg-warmwhite border border-goldBeige overflow-hidden group">
                      <img src={img} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 rounded-full p-1 bg-black/60 text-dustyRose hover:bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 text-[8px] bg-champagne text-noir font-semibold uppercase px-1 py-0.5 rounded">Primary</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="grid gap-3 pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Add imageUrl URL link (e.g. https://...)"
                    className="flex-1 rounded-full border border-goldBeige bg-warmwhite px-4 py-2.5 text-charcoalBrown outline-none focus:border-gold text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="rounded-full bg-champagne/10 border border-goldBeige px-4 py-2 text-champagne text-xs font-semibold hover:bg-champagne hover:text-noir transition-all"
                  >
                    Add URL
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-goldBeige bg-warmwhite px-4 py-2.5 text-champagne text-xs font-semibold hover:bg-champagne/10 transition-all">
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
                  <span className="text-[10px] text-stoneGray">Supports JPG, PNG file formats.</span>
                </div>
              </div>
            </div>

            {/* Section 4: Specifications */}
            <div className="space-y-4 pt-4 border-t border-goldBeige">
              <h3 className="text-xs font-semibold text-champagne uppercase tracking-widest">Technical Specifications</h3>
              
              {specs.length > 0 && (
                <div className="space-y-2">
                  {specs.map((spec, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-beige p-2 rounded-full border border-goldBeige text-xs">
                      <span className="font-semibold text-champagne pl-3">{spec.key}:</span>
                      <span className="text-stoneGray flex-1">{spec.value}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(idx)}
                        className="text-dustyRose hover:bg-rose/10 p-1.5 rounded-full"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSpecKey}
                  onChange={(e) => setNewSpecKey(e.target.value)}
                  placeholder="Spec Key Name (e.g. Warranty)"
                  className="w-1/2 rounded-full border border-goldBeige bg-warmwhite px-4 py-2 text-charcoalBrown outline-none focus:border-gold text-xs"
                />
                <input
                  type="text"
                  value={newSpecValue}
                  onChange={(e) => setNewSpecValue(e.target.value)}
                  placeholder="Spec Value (e.g. 1 Year)"
                  className="w-1/2 rounded-full border border-goldBeige bg-warmwhite px-4 py-2 text-charcoalBrown outline-none focus:border-gold text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddSpec}
                  className="rounded-full bg-champagne px-4 py-2 text-noir text-xs font-semibold hover:bg-champagne-light transition-all shrink-0"
                >
                  Add Spec
                </button>
              </div>
            </div>

            {/* Section 5: Policies */}
            <div className="space-y-4 pt-4 border-t border-goldBeige">
              <h3 className="text-xs font-semibold text-champagne uppercase tracking-widest">Warranty & Return Policies</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-stoneGray block mb-1">Warranty Period</label>
                  <input
                    type="text"
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    placeholder="e.g. 1 Year Manufacturer Warranty"
                    className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-3 text-charcoalBrown outline-none focus:border-gold text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-stoneGray block mb-1">Return Policy Override</label>
                  <input
                    type="text"
                    value={returnPolicy}
                    onChange={(e) => setReturnPolicy(e.target.value)}
                    placeholder="e.g. 7 Days Replacement Policy"
                    className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-3 text-charcoalBrown outline-none focus:border-gold text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Section: Jewellery Custom Specs */}
            <div className="space-y-4 pt-4 border-t border-goldBeige">
              <h3 className="text-xs font-semibold text-champagne uppercase tracking-widest flex items-center gap-1.5"><Sparkles size={14} /> Jewellery Specific Details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-stoneGray block mb-1">Collection</label>
                  <input
                    type="text"
                    value={collection}
                    onChange={(e) => setCollection(e.target.value)}
                    placeholder="e.g. Daily Wear, Bridal"
                    className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-3 text-charcoalBrown outline-none focus:border-gold text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-stoneGray block mb-1">Material Base</label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="e.g. 316L Stainless Steel"
                    className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-3 text-charcoalBrown outline-none focus:border-gold text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-stoneGray block mb-1">Plating Polish</label>
                  <input
                    type="text"
                    value={plating}
                    onChange={(e) => setPlating(e.target.value)}
                    placeholder="e.g. 18K Gold Plated"
                    className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-3 text-charcoalBrown outline-none focus:border-gold text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-stoneGray block mb-1">Color / Finish</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. Rose Gold, Silver"
                    className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-3 text-charcoalBrown outline-none focus:border-gold text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-stoneGray block mb-1">Size / Fit</label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="e.g. Adjustable, 6, 7"
                    className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-3 text-charcoalBrown outline-none focus:border-gold text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-stoneGray block mb-1">Occasion</label>
                  <input
                    type="text"
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    placeholder="e.g. Festive, Workwear"
                    className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-3 text-charcoalBrown outline-none focus:border-gold text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-stoneGray block mb-1">Stone / Gem Type</label>
                  <input
                    type="text"
                    value={stoneType}
                    onChange={(e) => setStoneType(e.target.value)}
                    placeholder="e.g. AAA+ Cubic Zirconia"
                    className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-3 text-charcoalBrown outline-none focus:border-gold text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-stoneGray block mb-1">Jewellery Sub-Type</label>
                  <input
                    type="text"
                    value={jewelleryType}
                    onChange={(e) => setJewelleryType(e.target.value)}
                    placeholder="e.g. Studs, Hoops, Chokers"
                    className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-3 text-charcoalBrown outline-none focus:border-gold text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-stoneGray block mb-1">Custom Badges (comma-separated)</label>
                  <input
                    type="text"
                    value={badgesText}
                    onChange={(e) => setBadgesText(e.target.value)}
                    placeholder="e.g. Hot Seller, Daily Wear"
                    className="w-full rounded-full border border-goldBeige bg-warmwhite px-4 py-3 text-charcoalBrown outline-none focus:border-gold text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Waterproof Toggle */}
                <div className="flex items-center justify-between bg-beige px-4 py-3 rounded-full border border-goldBeige">
                  <span className="text-xs text-stoneGray font-medium">💧 Waterproof / Shower Proof</span>
                  <button
                    type="button"
                    onClick={() => setWaterproof(!waterproof)}
                    className={`text-champagne ${waterproof ? "text-champagne" : "text-stoneGray"}`}
                  >
                    {waterproof ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                  </button>
                </div>

                {/* Anti-Tarnish Toggle */}
                <div className="flex items-center justify-between bg-beige px-4 py-3 rounded-full border border-goldBeige">
                  <span className="text-xs text-stoneGray font-medium">✨ Anti-Tarnish Guaranteed</span>
                  <button
                    type="button"
                    onClick={() => setAntiTarnish(!antiTarnish)}
                    className={`text-champagne ${antiTarnish ? "text-champagne" : "text-stoneGray"}`}
                  >
                    {antiTarnish ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-stoneGray">Jewellery Care Instructions</label>
                <textarea
                  rows={2}
                  value={careInstructions}
                  onChange={(e) => setCareInstructions(e.target.value)}
                  placeholder="Provide recommended care, cleaning cloth, chemical storage guidelines..."
                  className="w-full rounded-2xl border border-goldBeige bg-warmwhite px-4 py-3 text-charcoalBrown outline-none focus:border-gold text-sm"
                />
              </div>
            </div>

            {/* Section 6: Promo Toggles */}
            <div className="space-y-4 pt-4 border-t border-goldBeige">
              <h3 className="text-xs font-semibold text-champagne uppercase tracking-widest">Storefront Marketing Tags</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Featured */}
                <div className="flex items-center justify-between bg-beige px-4 py-3 rounded-full border border-goldBeige">
                  <span className="text-xs text-stoneGray font-medium">Featured Item</span>
                  <button
                    type="button"
                    onClick={() => setIsFeatured(!isFeatured)}
                    className={`text-champagne ${isFeatured ? "text-champagne" : "text-stoneGray"}`}
                  >
                    {isFeatured ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                  </button>
                </div>

                {/* Best Seller */}
                <div className="flex items-center justify-between bg-beige px-4 py-3 rounded-full border border-goldBeige">
                  <span className="text-xs text-stoneGray font-medium">Best Seller Badge</span>
                  <button
                    type="button"
                    onClick={() => setIsBestSeller(!isBestSeller)}
                    className={`text-champagne ${isBestSeller ? "text-champagne" : "text-stoneGray"}`}
                  >
                    {isBestSeller ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                  </button>
                </div>

                {/* New Arrival */}
                <div className="flex items-center justify-between bg-beige px-4 py-3 rounded-full border border-goldBeige">
                  <span className="text-xs text-stoneGray font-medium">New Arrival Flag</span>
                  <button
                    type="button"
                    onClick={() => setIsNewArrival(!isNewArrival)}
                    className={`text-champagne ${isNewArrival ? "text-champagne" : "text-stoneGray"}`}
                  >
                    {isNewArrival ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                  </button>
                </div>

                {/* Flash Deal */}
                <div className="flex items-center justify-between bg-beige px-4 py-3 rounded-full border border-goldBeige">
                  <span className="text-xs text-stoneGray font-medium">Flash Deals Slider</span>
                  <button
                    type="button"
                    onClick={() => setIsFlashDeal(!isFlashDeal)}
                    className={`text-champagne ${isFlashDeal ? "text-champagne" : "text-stoneGray"}`}
                  >
                    {isFlashDeal ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                  </button>
                </div>

                {/* Trending */}
                <div className="flex items-center justify-between bg-beige px-4 py-3 rounded-full border border-goldBeige">
                  <span className="text-xs text-stoneGray font-medium">Trending Feed list</span>
                  <button
                    type="button"
                    onClick={() => setIsTrending(!isTrending)}
                    className={`text-champagne ${isTrending ? "text-champagne" : "text-stoneGray"}`}
                  >
                    {isTrending ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                  </button>
                </div>

                {/* Listing Status */}
                <div className="flex items-center justify-between bg-beige px-4 py-3 rounded-full border border-goldBeige">
                  <span className="text-xs text-stoneGray font-medium">Listings Active status</span>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`text-champagne ${isActive ? "text-champagne" : "text-stoneGray"}`}
                  >
                    {isActive ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit and message */}
            <div className="pt-4 flex flex-col items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-full bg-champagne px-6 py-4 font-semibold text-noir hover:bg-champagne-light transition-all flex items-center justify-center gap-2 shadow-jewel text-sm"
              >
                {saving ? <HeartLoader size="sm" text="Saving..." /> : "Create Product Record"}
              </button>
              {message && (
                <p className={`text-sm ${message.includes("successfully") ? "text-emerald-400" : "text-dustyRose"}`}>
                  {message}
                </p>
              )}
            </div>

          </form>
        )}
      </section>
    </Protected>
  );
}
