"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getProducts } from "@/lib/firestore";
import { Product } from "@/types";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setLoading(true);
      // Pre-load products into memory when modal opens
      getProducts().then((data) => {
        setProducts(data.filter((p) => p.isActive !== false));
        setLoading(false);
      }).catch((err) => {
        console.error("Search failed:", err);
        setLoading(false);
      });
      
      // Auto-focus the input shortly after opening
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = ["Earrings", "Necklaces", "Rings", "Bracelets"];

  const normalizedQuery = query.toLowerCase().trim();
  const results = normalizedQuery
    ? products.filter((p) => {
        const n = (p.name || "").toLowerCase();
        const c = (p.category || "").toLowerCase();
        const cs = (p.categorySlug || "").toLowerCase();
        const t = (p.tags || []).map(x => x.toLowerCase());
        const d = (p.description || "").toLowerCase();

        return (
          n.includes(normalizedQuery) ||
          c.includes(normalizedQuery) ||
          cs.includes(normalizedQuery) ||
          t.some((tag) => tag.includes(normalizedQuery)) ||
          d.includes(normalizedQuery)
        );
      }).slice(0, 10) // Limit to top 10 results for speed/UI
    : [];

  return (
    <>
      <div 
        className="fixed inset-0 z-[150] bg-stone-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div 
        className="fixed left-0 right-0 top-0 z-[160] mx-auto w-full max-w-4xl bg-[#FAF9F6] shadow-2xl transition-transform duration-300 sm:top-4 sm:rounded-3xl"
        style={{ maxHeight: "85vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header / Input */}
        <div className="flex items-center gap-3 border-b border-stone-200 p-4 sm:p-6">
          <Search className="h-5 w-5 text-stoneGray shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for jewellery..."
            className="flex-1 bg-transparent text-lg text-charcoalBrown outline-none placeholder:text-stoneGray/60"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            onClick={onClose}
            className="rounded-full p-2 text-stoneGray transition hover:bg-stone-200/50 hover:text-charcoalBrown shrink-0"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-champagne" />
            </div>
          ) : !query ? (
            // Quick Links
            <div className="py-2">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-stoneGray">Quick Suggestions</h3>
              <div className="flex flex-wrap gap-2">
                {quickLinks.map((link) => (
                  <button
                    key={link}
                    onClick={() => setQuery(link)}
                    className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-charcoalBrown shadow-sm transition hover:border-champagne hover:text-champagne"
                  >
                    {link}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            // Results List
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-stoneGray">
                Products ({results.length})
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {results.map((product) => {
                  const isSale = product.regularPrice && product.regularPrice > product.salePrice;
                  const img = product.images?.[0] || (product as any).imageUrl || "/placeholder.png";

                  return (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug || product.id}`}
                      onClick={onClose}
                      className="group flex items-center gap-4 rounded-2xl border border-transparent p-2 transition hover:bg-white hover:border-stone-200 hover:shadow-sm"
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                        <img 
                          src={img} 
                          alt={product.name} 
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-110" 
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-serif text-sm text-charcoalBrown group-hover:text-champagne">
                          {product.name}
                        </h4>
                        <p className="mt-0.5 text-xs text-stoneGray">
                          {(product.categorySlug || product.category || "").replace("-", " ")}
                        </p>
                        <div className="mt-1 flex items-baseline gap-2 text-sm">
                          {isSale ? (
                            <>
                              <span className="font-semibold text-charcoalBrown">₹{product.salePrice}</span>
                              <span className="text-xs text-stoneGray line-through">₹{product.regularPrice}</span>
                            </>
                          ) : (
                            <span className="font-semibold text-charcoalBrown">₹{product.salePrice}</span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-stoneGray opacity-0 transition group-hover:opacity-100 mr-2 shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            // No Results
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="mb-4 h-12 w-12 text-stone-300" />
              <p className="font-serif text-lg text-charcoalBrown">No results found for "{query}"</p>
              <p className="mt-1 text-sm text-stoneGray">Try checking your spelling or use more general terms.</p>
              <button 
                onClick={() => setQuery("")}
                className="mt-6 text-sm font-semibold text-champagne hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
