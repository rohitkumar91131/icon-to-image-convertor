import { NextRequest, NextResponse } from "next/server";
import { isValidLibrary } from "@/lib/libraries";
import { categorizeIcon } from "@/lib/categories";

/** Loads all icon names from the requested library. */
async function loadIconNames(slug: string): Promise<string[] | null> {
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
      default: return null;
    }

    // lucide-react exports both canonical names (e.g. "Star") and Icon-suffixed
    // aliases (e.g. "StarIcon") that point to the same component.  Use the
    // library's own `icons` registry to get only the canonical names.
    if (slug === "lucide" && mod.icons && typeof mod.icons === "object") {
      return Object.keys(mod.icons as Record<string, unknown>).sort();
    }

    // "Icon" is a lucide-react utility component that requires an `iconNode` prop;
    // rendering it without that prop throws at runtime.
    const EXCLUDED = new Set(["Fragment", "StrictMode", "Suspense", "Children", "Component", "Icon"]);
    return Object.entries(mod)
      .filter(([key, val]) => {
        if (!val || EXCLUDED.has(key) || !/^[A-Z]/.test(key)) return false;
        const t = typeof val;
        if (t === "function") return true;
        if (t === "object" && !Array.isArray(val) && "$$typeof" in (val as object)) return true;
        return false;
      })
      .map(([key]) => key)
      .sort();
  } catch {
    return null;
  }
}

/**
 * GET /api/icons/[package]
 *
 * Returns a JSON list of all icon names available in the given library,
 * each annotated with a broad UX category.
 *
 * Query params:
 *   - q        : optional search/filter string
 *   - category : optional category filter
 *   - page     : page number (default 1)
 *   - perPage  : items per page (default 96, max 500)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ package: string }> }
) {
  const { package: slug } = await params;

  if (!isValidLibrary(slug)) {
    return NextResponse.json(
      { error: `Unknown library "${slug}"` },
      { status: 404 }
    );
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").toLowerCase();
  const categoryFilter = searchParams.get("category") || "all";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const perPage = Math.min(500, Math.max(1, parseInt(searchParams.get("perPage") || "96", 10)));

  const allNames = await loadIconNames(slug);
  if (!allNames) {
    return NextResponse.json({ error: "Failed to load library" }, { status: 500 });
  }

  // Filter
  const filtered = allNames.filter((name) => {
    const matchesQ = !q || name.toLowerCase().includes(q);
    const cat = categorizeIcon(name);
    const matchesCat = categoryFilter === "all" || cat === categoryFilter;
    return matchesQ && matchesCat;
  });

  // Paginate
  const total = filtered.length;
  const totalPages = Math.ceil(total / perPage);
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  const icons = slice.map((name) => ({
    name,
    category: categorizeIcon(name),
  }));

  return NextResponse.json(
    { icons, total, page, perPage, totalPages },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
