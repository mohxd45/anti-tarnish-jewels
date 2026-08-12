"use client";

import { useState, useMemo } from "react";
import { Product, BundleItemSnapshot, BundleItem } from "@/types";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Package, ArrowLeft, Check, X, ShieldCheck, Sparkles } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

export function MixMatchBundleClient({ 
  product: bundle, 
  initialBundleItems = [],
  fetchedExistingProducts = []
}: { 
  product: Product, 
  initialBundleItems?: BundleItem[],
  fetchedExistingProducts?: Product[] 
}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedItems, setSelectedItems] = useState<BundleItemSnapshot[]>([]);

  const limit = bundle.selectionLimit || 5;
  const savings = (bundle.regularPrice || 0) - (bundle.salePrice || 0);
  const outOfStock =
    bundle.stock !== undefined &&
    bundle.stock !== null &&
    Number(bundle.stock) <= 0;

  // Build eligible items. Hide out-of-stock items as per requirement
  const eligibleItems = useMemo(() => {
    if (bundle.sourceType === "bundle_items") {
      let items = bundle.independentBundleItems || [];
      // Filter out the bundle itself just in case
      items = items.filter(item => item.id !== bundle.id && (item as any).productId !== bundle.id);
      
      return items
        .filter(item => {
          const hasStock = item.stock === undefined || item.stock === null || Number(item.stock) > 0;
          return item.active !== false && hasStock;
        })
        .map(item => ({
          productId: item.id,
          name: item.name,
          sku: item.sku,
          price: 0,
          quantity: 1,
          image: item.image || (item as any).images?.[0] || "",
        } as BundleItemSnapshot));
    }
    
    // For existing_products
    let snaps = bundle.eligibleProductsSnapshot || [];
    
    // Filter out the bundle itself just in case it was accidentally added!
    snaps = snaps.filter(snap => (snap.productId || (snap as any).id) !== bundle.id);
    
    if (fetchedExistingProducts && fetchedExistingProducts.length > 0) {
       // Filter snaps by checking the fetched real-time product stock & active status!
       snaps = snaps.filter(snap => {
         const realProduct = fetchedExistingProducts.find(p => p.id === (snap.productId || (snap as any).id));
         if (!realProduct) return false;
         if (realProduct.isActive === false) return false; // Hide inactive
         const hasStock = realProduct.stock === undefined || realProduct.stock === null || Number(realProduct.stock) > 0;
         if (!hasStock) return false; // Hide out of stock
         return true;
       });
    }

    return snaps.map(snap => ({
      ...snap,
      productId: snap.productId || (snap as any).id,
      image: snap.image || (snap as any).images?.[0] || "",
    } as BundleItemSnapshot));
  }, [bundle, fetchedExistingProducts]);

  function toggleItem(item: BundleItemSnapshot) {
    const isSelected = selectedItems.some((s) => s.productId === item.productId);
    
    if (isSelected) {
      setSelectedItems((prev) => prev.filter((s) => s.productId !== item.productId));
    } else {
      if (selectedItems.length >= limit) {
        toast.error(`You can select only ${limit} items for this bundle.`);
        return;
      }
      setSelectedItems((prev) => [...prev, item]);
    }
  }

  function handleRemoveItem(productId: string) {
    setSelectedItems((prev) => prev.filter((s) => s.productId !== productId));
  }

  function handleAdd() {
    if (outOfStock) {
      toast.error("This bundle is currently out of stock.");
      return;
    }
    if (selectedItems.length !== limit) {
      toast.error(`Please select exactly ${limit} items.`);
      return;
    }

    setIsAdding(true);
    
    const cartLineId = `mix_match_${bundle.id}_${Date.now()}`;
    
    const bundleToCart = {
      ...bundle,
      bundleType: "mix_and_match" as const,
      selectedProductIds: bundle.sourceType !== "bundle_items" ? selectedItems.map(i => i.productId) : undefined,
      selectedBundleItemIds: bundle.sourceType === "bundle_items" ? selectedItems.map(i => i.productId) : undefined,
      selectedProducts: selectedItems,
      cartLineId
    };

    addToCart(bundleToCart as any, 1, "", "");
    
    setTimeout(() => {
      setIsAdding(false);
      toast.success("Bundle added to cart!");
      // Optionally redirect to cart here if desired
    }, 500);
  }

  const remainingCount = limit - selectedItems.length;
  const progressText = selectedItems.length === 0 
    ? `Select ${limit} items to get the bundle at ${formatPrice(bundle.salePrice || 0)}`
    : remainingCount > 0 
      ? `Select ${remainingCount} more item${remainingCount > 1 ? 's' : ''} to get the bundle at ${formatPrice(bundle.salePrice || 0)}`
      : "Your bundle is ready!";

  return (
    <div className="max-w-6xl mx-auto px-3 md:px-8 py-4 md:py-12 pb-[160px] md:pb-[200px]">
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-stoneGray hover:text-[#3A2428] transition-colors mb-3 md:mb-6 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Hero Banner Section */}
      <div className="bg-[#FFF9FB] rounded-[20px] md:rounded-[24px] border border-[#E8D7C8]/60 shadow-sm overflow-hidden mb-4 md:mb-16">
        <div className="flex flex-col md:flex-row items-stretch">

          <div className="flex-1 p-4 md:p-10 flex flex-col justify-center items-center md:items-start text-center md:text-left">
            <span className="rounded-full bg-[#3A2428] px-2.5 py-1 md:px-3 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white shadow-sm mb-2 md:mb-4">
              Build Your Bundle
            </span>
            <h1 className="font-serif text-[22px] md:text-[38px] text-[#3A2428] font-medium leading-tight mb-1 md:mb-3">
              {bundle.name}
            </h1>
            <div className="flex items-end gap-2 md:gap-3 mb-2 md:mb-4">
              <span className="text-xl md:text-3xl font-serif font-medium text-[#3A2428]">
                {formatPrice(bundle.salePrice || 0)}
              </span>
              {bundle.regularPrice > (bundle.salePrice || 0) && (
                <span className="text-sm md:text-base font-medium text-[#8F817B] line-through mb-0.5 md:mb-1">
                  {formatPrice(bundle.regularPrice)}
                </span>
              )}
            </div>
            {bundle.description && (
              <p className="text-xs md:text-sm leading-relaxed text-[#3A2428]/80 whitespace-pre-wrap max-w-lg mb-3 md:mb-6">
                {bundle.description}
              </p>
            )}
            <div className="inline-flex items-center gap-1.5 md:gap-2 font-medium text-[#B8955E] bg-[#B8955E]/10 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-xs md:text-base">
              <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span>Choose {limit} items to complete your bundle</span>
            </div>
          </div>
        </div>
      </div>

      {/* Item Grid Section */}
      <div className="mb-3 md:mb-6 flex items-center justify-between">
        <h2 className="font-serif text-lg md:text-2xl text-[#3A2428]">Choose {limit} items</h2>
        <span className="text-xs md:text-sm font-medium text-[#8F817B]">{eligibleItems.length} available</span>
      </div>

      {eligibleItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-[#E8D7C8]/50">
          <Package className="w-16 h-16 text-[#E8D7C8] mb-4" />
          <p className="font-serif text-xl text-[#3A2428]">No bundle items configured yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6">
          {eligibleItems.map((item) => {
          const isSelected = selectedItems.some((s) => s.productId === item.productId);
          const isMaxReached = selectedItems.length >= limit;
          const disabled = !isSelected && isMaxReached;
          
          return (
            <div 
              key={item.productId}
              className={`flex flex-col rounded-xl md:rounded-[20px] border-[1.5px] transition-all bg-white overflow-hidden group ${
                isSelected 
                  ? "border-[#B8955E] shadow-sm shadow-[#B8955E]/10" 
                  : "border-[#E8D7C8]/50 hover:border-[#E8D7C8] hover:shadow-sm"
              } ${disabled ? "opacity-50 grayscale-[20%] cursor-not-allowed" : "cursor-pointer"}`}
              onClick={() => !disabled && toggleItem(item)}
            >
              <div className="aspect-square relative p-2 md:p-3 bg-[#FFF9FB] overflow-hidden">
                {isSelected && (
                  <div className="absolute top-2 right-2 md:top-3 md:right-3 z-10 w-5 h-5 md:w-7 md:h-7 bg-[#B8955E] rounded-full flex items-center justify-center shadow-sm">
                    <Check className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </div>
                )}
                {item.image ? (
                  <OptimizedImage 
                    src={item.image} 
                    fill 
                    sizes="(max-width: 768px) 50vw, 25vw" 
                    alt={item.name} 
                    className="object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <Package className="w-8 h-8 md:w-10 md:h-10 m-auto mt-8 md:mt-12 text-[#E8D7C8]" />
                )}
              </div>
              
              <div className="flex flex-col flex-1 p-2 md:p-4">
                <h3 className="text-[11px] md:text-[14px] font-semibold text-[#3A2428] line-clamp-2 leading-snug mb-1">
                  {item.name}
                </h3>
                {item.sku && (
                  <p className="text-[9px] md:text-[11px] text-[#8F817B] font-mono mb-2 md:mb-4">
                    {item.sku}
                  </p>
                )}
                
                <div className="mt-auto pt-1 md:pt-2">
                  <button 
                    disabled={disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (!disabled) toggleItem(item);
                    }}
                    className={`w-full py-1.5 md:py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-[12px] font-bold tracking-wider uppercase transition-colors flex justify-center items-center gap-1 md:gap-1.5 ${
                      isSelected 
                        ? "bg-[#B8955E]/10 text-[#B8955E] border border-[#B8955E]/30" 
                        : "bg-[#3A2428] text-white hover:bg-[#2A1A1D]"
                    } ${disabled ? "opacity-50" : ""}`}
                  >
                    {isSelected ? "Added" : "Add"}
                    <span className="hidden md:inline"> to Bundle</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Bottom Sticky Box Builder Bar */}
      <div className="fixed bottom-[72px] md:bottom-6 left-3 right-3 md:left-1/2 md:-translate-x-1/2 md:max-w-4xl z-40 bg-white/95 backdrop-blur-xl border border-[#E8D7C8]/80 shadow-[0_12px_40px_rgba(58,36,40,0.15)] rounded-xl md:rounded-3xl p-2.5 md:p-5 transition-transform duration-300">
        <div className="flex flex-col md:flex-row gap-2 md:gap-8 items-center justify-between">
          
          {/* Progress Info & Slots */}
          <div className="flex-1 w-full flex flex-col gap-1.5 md:gap-3">
            <div className="flex items-center justify-between md:justify-start gap-2 md:gap-4">
              <span className="text-[11px] md:text-sm font-semibold text-[#3A2428] leading-tight">
                {progressText}
              </span>
              <span className="text-[9px] md:text-xs font-bold text-[#B8955E] bg-[#B8955E]/10 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full whitespace-nowrap">
                Selected {selectedItems.length}/{limit}
              </span>
            </div>
            
            {/* Horizontal Scrollable Slots Container */}
            <div className="flex items-center gap-1.5 md:gap-3 overflow-x-auto hide-scrollbar pb-1 w-full">
              {Array.from({ length: limit }).map((_, i) => {
                const selectedItem = selectedItems[i];
                return (
                  <div 
                    key={`slot-${i}`}
                    className={`relative shrink-0 w-[36px] h-[36px] md:w-[55px] md:h-[55px] rounded-md md:rounded-xl border-[1.5px] flex items-center justify-center transition-all ${
                      selectedItem 
                        ? "border-[#B8955E] bg-white shadow-sm" 
                        : "border-dashed border-[#E8D7C8] bg-[#FDFBF9]"
                    }`}
                  >
                    {selectedItem ? (
                      <>
                        {selectedItem.image ? (
                          <div className="relative w-full h-full p-0.5 md:p-1 bg-[#FFF9FB] overflow-hidden rounded-md md:rounded-xl">
                            <OptimizedImage 
                              src={selectedItem.image} 
                              alt={selectedItem.name} 
                              fill 
                              sizes="50px" 
                              className="object-contain mix-blend-multiply"
                            />
                          </div>
                        ) : (
                          <Package className="w-4 h-4 md:w-5 md:h-5 text-[#E8D7C8]" />
                        )}
                        <button 
                          onClick={() => handleRemoveItem(selectedItem.productId)}
                          className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 md:p-0.5 border border-[#E8D7C8] shadow-sm text-[#3A2428] hover:text-red-500 transition-colors"
                        >
                          <X className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                        </button>
                      </>
                    ) : (
                      <span className="text-[#E8D7C8] font-medium text-sm md:text-lg">+</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action CTA */}
          <div className="w-full md:w-auto shrink-0 border-t border-[#E8D7C8]/50 pt-2 md:border-t-0 md:pt-0">
            <button
              onClick={handleAdd}
              disabled={outOfStock || isAdding || selectedItems.length !== limit}
              className="w-full md:w-[220px] py-2.5 md:py-4 rounded-lg md:rounded-xl text-[12px] md:text-[14px] font-bold tracking-wide transition-all shadow-sm md:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-[#B8955E] text-white hover:bg-[#A38150] uppercase"
            >
              {isAdding 
                ? "Adding..." 
                : outOfStock 
                  ? "Out of Stock" 
                  : "Add Bundle to Cart"}
            </button>
          </div>
          
        </div>
      </div>

    </div>
  );
}

