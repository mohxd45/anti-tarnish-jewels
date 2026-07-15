import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem } from "@/types";
import { formatPrice } from "@/lib/utils";

interface CartItemCardProps {
  item: CartItem;
  increase: (id: string) => void;
  decrease: (id: string) => void;
  removeFromCart: (id: string) => void;
  closeDrawer?: () => void;
}

export function CartItemCard({ item, increase, decrease, removeFromCart, closeDrawer }: CartItemCardProps) {
  const { product, quantity } = item;
  
  return (
    <div className="flex gap-3 p-3 bg-[#FFF9FB] rounded-2xl shadow-sm border border-[#E8D7C8]/60">
      <Link 
        href={`/product/${product.slug}`} 
        className="relative h-[76px] w-[76px] flex-shrink-0 overflow-hidden rounded-xl bg-white border border-[#E8D7C8]/50 block"
        onClick={closeDrawer}
      >
        <img
          src={product.images[0] || "/product-stack.jpg"}
          alt={product.name || "Product image"}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).onerror = null;
            (e.target as HTMLImageElement).src = "/product-stack.jpg";
          }}
        />
      </Link>
      
      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <Link href={`/product/${product.slug}`} onClick={closeDrawer}>
              <h3 className="text-sm font-medium text-[#3A2428] leading-tight line-clamp-2 hover:text-[#B8955E] transition-colors">
                {product.name}
              </h3>
            </Link>
            {(item.selectedSize || item.selectedColor) && (
              <p className="text-[11px] text-[#8F817B] mt-1 font-medium">
                {[
                  item.selectedSize ? `Size: ${item.selectedSize}` : null,
                  item.selectedColor ? `Color: ${item.selectedColor}` : null
                ].filter(Boolean).join(" · ")}
              </p>
            )}
            {(item.sku || product.sku) && (
              <p className="text-[10px] text-[#8F817B] mt-0.5">Item Code: {item.sku || product.sku}</p>
            )}
            {product.isBundle && product.includedItems && product.includedItems.length > 0 && (
              <div className="mt-1.5 flex flex-col gap-0.5 border-t border-[#E8D7C8]/40 pt-1.5">
                <span className="text-[9px] uppercase tracking-wider text-[#B8955E] font-bold">Included:</span>
                {product.includedItems.map((inc, i) => (
                  <p key={i} className="text-[10px] text-stone-500 truncate">
                    • {inc.quantity}x {inc.name}
                  </p>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => removeFromCart(item.cartItemId || product.id)}
            className="text-stone-400 hover:text-red-500 transition-colors p-1.5 -mr-1.5 -mt-1 flex-shrink-0 rounded-full hover:bg-red-50"
            aria-label="Remove item"
          >
            <Trash2 className="h-[15px] w-[15px]" />
          </button>
        </div>
        
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#3A2428] text-sm">
              {formatPrice ? formatPrice(product.salePrice) : `₹${product.salePrice?.toLocaleString()}`}
            </span>
            {(product.salePrice < product.regularPrice) && (
              <span className="text-[11px] text-stone-400 line-through">
                {formatPrice ? formatPrice(product.regularPrice) : `₹${product.regularPrice?.toLocaleString()}`}
              </span>
            )}
          </div>

          <div className="flex items-center rounded-lg border border-[#E8D7C8] bg-white overflow-hidden shadow-sm h-7">
            <button
              onClick={() => decrease(item.cartItemId || product.id)}
              className="px-2 h-full flex items-center justify-center text-stone-400 hover:text-[#3A2428] hover:bg-stone-50 transition-colors disabled:opacity-50"
              disabled={quantity <= 1}
            >
              <Minus className="h-[10px] w-[10px]" />
            </button>
            <span className="px-1 text-xs font-semibold text-[#3A2428] w-6 text-center select-none flex items-center justify-center h-full border-x border-[#E8D7C8]/30">
              {quantity}
            </span>
            <button
              onClick={() => increase(item.cartItemId || product.id)}
              className="px-2 h-full flex items-center justify-center text-stone-400 hover:text-[#3A2428] hover:bg-stone-50 transition-colors"
            >
              <Plus className="h-[10px] w-[10px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
