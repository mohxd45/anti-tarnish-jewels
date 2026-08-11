import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  // If we are in a Vercel preview deployment, we should disallow everything
  // to be extra safe, though Vercel already emits X-Robots-Tag: noindex.
  const isPreview = process.env.VERCEL_ENV !== "production" && process.env.VERCEL === "1";

  if (isPreview) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/account/",
        "/cart/",
        "/checkout/",
        "/login/",
        "/signup/",
        "/orders/",
        "/order-success/",
        "/wishlist/",
        "/track-order/",
        "/returns/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
