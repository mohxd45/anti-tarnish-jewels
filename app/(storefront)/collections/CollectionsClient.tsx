"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategories } from "@/lib/firestore";
import { Category } from "@/types";

export function CollectionsClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(false);
        const data = await getCategories(true);
        const activeCategories = data.filter((c) => c.isActive !== false);
        setCategories(activeCategories);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-[4/5] bg-stone-50/50 animate-pulse rounded-[1.25rem] w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FAF9F6] border border-stone-200 rounded-2xl p-8 text-center text-stone-500">
        <p>Sorry, we could not load the collections at this time.</p>
        <p className="mt-2 text-sm">Please try again later.</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-[#FAF9F6] border border-stone-200 rounded-2xl p-8 text-center text-stone-500">
        <p>No collections available right now.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/shop?category=${category.slug}`}
          className="group relative flex flex-col overflow-hidden rounded-[1.25rem] bg-white shadow-sm ring-1 ring-[#E8D7C8]/50 transition-all hover:shadow-md hover:ring-[#B8955E]/30"
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#FAF9F6]">
            {/* Fallback pattern if image is missing */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
            
            {category.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={category.imageUrl}
                alt={category.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[#FAF9F6] text-[#3A2428]/30">
                <span className="font-serif text-2xl font-semibold opacity-50 px-4 text-center">
                  {category.name}
                </span>
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80" />
            
            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5 flex flex-col items-center text-center">
              <h3 className="font-serif text-base sm:text-lg font-medium text-white">
                {category.name}
              </h3>
              <p className="mt-0.5 sm:mt-1 hidden text-xs text-white/80 sm:block">
                {category.description}
              </p>
              
              <div className="mt-2 sm:mt-3 flex h-6 sm:h-8 w-6 sm:w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors group-hover:bg-[#B8955E]">
                <ArrowRight className="h-3 sm:h-4 w-3 sm:w-4 text-white" />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
