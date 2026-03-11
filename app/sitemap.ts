import type { MetadataRoute } from "next";
import { LIBRARY_SLUGS } from "@/lib/libraries";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://iconimg.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/api-docs`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const libraryRoutes: MetadataRoute.Sitemap = LIBRARY_SLUGS.map((slug) => ({
    url: `${siteUrl}/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...libraryRoutes];
}
