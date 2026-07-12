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
    <div className="flex gap-3 p-3 bg-brandCardBg rounded-2xl shadow-sm border border-brandBorder/30">
      <Link 
        href={`/product/${product.slug}`} 
        className="relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-xl bg-brandMainBg border border-stone-100 block"
        onClick={closeDrawer}
      >
        <Image
          src={product.images[0] || "/images/placeholder.jpg"}
          alt={product.name || "Product image"}
          fill
          className="object-cover"
          sizes="72px"
        />
      </Link>
      
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <Link href={`/product/${product.slug}`} onClick={closeDrawer}>
              <h3 className="text-sm font-medium text-brandEspresso leading-tight line-clamp-2 hover:text-brandGold transition-colors">
                {product.name}
              </h3>
            </Link>
            {product.category && (
              <p className="text-[10px] uppercase tracking-wider text-brandMutedText mt-1">
                {product.category}
              </p>
            )}
          </div>
          <button
            onClick={() => removeFromCart(product.id)}
            className="text-brandMutedText hover:text-brandEspresso transition-colors p-1 -mr-1 -mt-1 flex-shrink-0"
            aria-label="Remove item"
          >
            <Trash2 className="h-[18px] w-[18px]" />
          </button>
        </div>
        
        <div className="mt-2 flex items-center gap-2">
          <span className="font-semibold text-brandEspresso text-sm">
            {formatPrice ? formatPrice(product.salePrice) : `₹${product.salePrice?.toLocaleString()}`}
          </span>
          {(product.salePrice < product.regularPrice) && (
            <span className="text-xs text-brandMutedText line-through">
              {formatPrice ? formatPrice(product.regularPrice) : `₹${product.regularPrice?.toLocaleString()}`}
            </span>
          )}
        </div>
        
        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center rounded-md border border-brandBorder/50 bg-white overflow-hidden shadow-sm">
            <button
              onClick={() => decrease(product.id)}
              className="px-2 py-1 text-brandMutedText hover:text-brandEspresso hover:bg-brandMainBg transition-colors disabled:opacity-50"
              disabled={quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="px-2 text-xs font-semibold text-brandEspresso w-7 text-center select-none">
              {quantity}
            </span>
            <button
              onClick={() => increase(product.id)}
              className="px-2 py-1 text-brandMutedText hover:text-brandEspresso hover:bg-brandMainBg transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          
          <div className="text-[11px] font-semibold text-brandMutedText">
            {formatPrice ? formatPrice(product.salePrice * quantity) : `Total: ₹${(product.salePrice * quantity).toLocaleString()}`}
          </div>
        </div>
      </div>
    </div>
  );
}
