import Link from "next/link";
import { LONA_CATEGORIES } from "@/lib/categories";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Collections - LONA JEWELS",
  description: "Explore our premium jewelry collections",
};

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-[#FFF9FB] pb-24 pt-24 md:pt-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#3A2428] md:text-5xl">
            Our Collections
          </h1>
          <p className="mt-3 text-sm text-[#8F817B] md:text-base">
            Discover the perfect piece for every occasion.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {LONA_CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/shop?category=${category.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-[1.25rem] bg-white shadow-sm ring-1 ring-[#E8D7C8]/50 transition-all hover:shadow-md hover:ring-[#B8955E]/30"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#FAF9F6]">
                {/* Fallback pattern if image is missing */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
                
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
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
      </div>
    </div>
  );
}
