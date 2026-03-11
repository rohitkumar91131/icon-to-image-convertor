import type { MetadataRoute } from "next";
import { LIBRARY_SLUGS } from "@/lib/libraries";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://iconimg.vercel.app";

const EXCLUDED = new Set(["Fragment", "StrictMode", "Suspense", "Children", "Component"]);
const STARTS_WITH_UPPERCASE = /^[A-Z]/;

async function loadIconNames(slug: string): Promise<string[]> {
  try {
    let mod: Record<string, unknown>;
    switch (slug) {
      case "lucide": mod = await import("lucide-react"); break;
      case "fa":     mod = await import("react-icons/fa"); break;
      case "fi":     mod = await import("react-icons/fi"); break;
      case "md":     mod = await import("react-icons/md"); break;
      case "bs":     mod = await import("react-icons/bs"); break;
      case "io":     mod = await import("react-icons/io"); break;
      case "gi":     mod = await import("react-icons/gi"); break;
      case "ri":     mod = await import("react-icons/ri"); break;
      case "si":     mod = await import("react-icons/si"); break;
      case "tb":     mod = await import("react-icons/tb"); break;
      default: return [];
    }
    return Object.entries(mod)
      .filter(([key, val]) => {
        if (!val || EXCLUDED.has(key) || !STARTS_WITH_UPPERCASE.test(key)) return false;
        const t = typeof val;
        if (t === "function") return true;
        if (t === "object" && !Array.isArray(val) && "$$typeof" in (val as object)) return true;
        return false;
      })
      .map(([key]) => key)
      .sort();
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/api-docs/`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const libraryRoutes: MetadataRoute.Sitemap = LIBRARY_SLUGS.map((slug) => ({
    url: `${siteUrl}/${slug}/`,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Load all icon names in parallel across all libraries for efficiency
  const iconNamesByLibrary = await Promise.all(
    LIBRARY_SLUGS.map((slug) =>
      loadIconNames(slug).then((names) => ({ slug, names }))
    )
  );

  const iconRoutes: MetadataRoute.Sitemap = iconNamesByLibrary.flatMap(
    ({ slug, names }) =>
      names.map((name) => ({
        url: `${siteUrl}/${slug}/${name}/`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }))
  );

  return [...staticRoutes, ...libraryRoutes, ...iconRoutes];
}
