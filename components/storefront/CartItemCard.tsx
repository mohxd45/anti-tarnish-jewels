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
    <div className="flex gap-3 py-3 border-b border-stone-100 last:border-0 bg-white sm:rounded-xl sm:mb-2 sm:shadow-sm sm:p-3 sm:border sm:border-stone-100">
      <Link 
        href={`/product/${product.slug}`} 
        className="relative h-[76px] w-[76px] flex-shrink-0 overflow-hidden rounded-lg bg-stone-50 border border-stone-100 block"
        onClick={closeDrawer}
      >
        <Image
          src={product.images[0] || "/images/placeholder.jpg"}
          alt={product.name || "Product image"}
          fill
          className="object-cover"
          sizes="76px"
        />
      </Link>
      
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <Link href={`/product/${product.slug}`} onClick={closeDrawer}>
              <h3 className="text-sm font-medium text-charcoalBrown leading-tight line-clamp-2 hover:text-[#c5a059] transition-colors">
                {product.name}
              </h3>
            </Link>
            {product.category && (
              <p className="text-[10px] uppercase tracking-wider text-stone-500 mt-1">
                {product.category}
              </p>
            )}
          </div>
          <button
            onClick={() => removeFromCart(product.id)}
            className="text-stone-400 hover:text-red-500 transition-colors p-1 -mr-1 -mt-1 flex-shrink-0"
            aria-label="Remove item"
          >
            <Trash2 className="h-[18px] w-[18px]" />
          </button>
        </div>
        
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-charcoalBrown text-sm">
              {formatPrice ? formatPrice(product.salePrice) : `₹${product.salePrice?.toLocaleString()}`}
            </span>
            {(product.salePrice < product.regularPrice) && (
              <span className="text-xs text-stone-400 line-through">
                {formatPrice ? formatPrice(product.regularPrice) : `₹${product.regularPrice?.toLocaleString()}`}
              </span>
            )}
          </div>
        </div>
        
        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center rounded-md border border-stone-200 bg-stone-50 overflow-hidden">
            <button
              onClick={() => decrease(product.id)}
              className="px-2 py-1 text-stone-600 hover:text-charcoalBrown hover:bg-stone-100 transition-colors disabled:opacity-50"
              disabled={quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="px-2 text-xs font-semibold text-charcoalBrown w-7 text-center select-none">
              {quantity}
            </span>
            <button
              onClick={() => increase(product.id)}
              className="px-2 py-1 text-stone-600 hover:text-charcoalBrown hover:bg-stone-100 transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          
          <div className="text-[11px] font-medium text-stone-500">
            {formatPrice ? formatPrice(product.salePrice * quantity) : `Total: ₹${(product.salePrice * quantity).toLocaleString()}`}
          </div>
        </div>
      </div>
    </div>
  );
}
