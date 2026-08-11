import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";
import { adminDb } from "@/lib/firebaseAdmin";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // 1. Static Public Pages
  const staticRoutes = [
    "",
    "/about",
    "/bundles",
    "/collections",
    "/contact",
    "/faq",
    "/privacy-policy",
    "/return-policy",
    "/shop",
  ];

  staticRoutes.forEach((route) => {
    sitemapEntries.push({
      url: route === "" ? `${SITE_URL}/` : `${SITE_URL}${route}`,
      changeFrequency: route === "" ? "daily" : "weekly",
      priority: route === "" ? 1 : 0.8,
    });
  });

  // 2. Dynamic Products & Bundles
  if (adminDb) {
    try {
      // Using Firebase Admin SDK for server-side generation.
      const snap = await adminDb.collection("products").get();
      const allProducts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
      
      // Strict filter for active, publicly indexable products with valid slugs
      const activeProducts = allProducts.filter((p) => p.isActive !== false && p.slug && typeof p.slug === "string" && p.slug.trim() !== "");
      
      for (const product of activeProducts) {
        let lastMod: Date | undefined = undefined;
        
        if (product.updatedAt) {
          const ud = new Date(product.updatedAt);
          if (!isNaN(ud.getTime())) lastMod = ud;
        } else if (product.createdAt) {
          const cd = new Date(product.createdAt);
          if (!isNaN(cd.getTime())) lastMod = cd;
        }

        const entry: MetadataRoute.Sitemap[number] = {
          url: `${SITE_URL}/product/${product.slug.trim()}`,
          changeFrequency: "weekly",
          priority: 0.6,
        };
        
        if (lastMod) {
          entry.lastModified = lastMod;
        }

        sitemapEntries.push(entry);
      }
    } catch (err) {
      console.error("Failed to fetch products for sitemap:", err);
      // Fail the build rather than returning an empty or half-finished sitemap
      throw new Error(`Sitemap generation blocked by Firestore Admin error: ${err}`);
    }
  } else {
    // If Admin config is not provided at all, we can't generate the dynamic part
    console.warn("No Firebase Admin config found. Sitemap will only contain static routes.");
  }

  // Deduplicate just in case
  const uniqueUrls = new Set<string>();
  const deduplicatedSitemap: MetadataRoute.Sitemap = [];
  
  for (const entry of sitemapEntries) {
    if (!uniqueUrls.has(entry.url)) {
      uniqueUrls.add(entry.url);
      deduplicatedSitemap.push(entry);
    }
  }

  return deduplicatedSitemap;
}
