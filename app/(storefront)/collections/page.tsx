import { CollectionsClient } from "./CollectionsClient";

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

        <CollectionsClient />
      </div>
    </div>
  );
}
