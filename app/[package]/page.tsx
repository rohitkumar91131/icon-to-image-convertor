"use client";

import { Component, use, useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Nav from "@/components/nav";
import { LIBRARIES, isValidLibrary } from "@/lib/libraries";
import { CATEGORIES, categorizeIcon } from "@/lib/categories";

/** Catches render errors in a single icon card so one bad component can't crash the whole grid. */
class IconErrorBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: false };
  }
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    if (this.state.error) return null;
    return this.props.children;
  }
}

const PAGE_SIZE = 96;

type IconEntry = { name: string; category: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IconComponent = React.ComponentType<any>;

/** Dynamically imports the icon module for a given library slug. */
async function importLibrary(slug: string): Promise<Record<string, IconComponent>> {
  let mod: Record<string, unknown>;
  try {
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
      default: return {};
    }
  } catch {
    return {};
  }
  // Filter to exported icon components only.
  // lucide-react exports forwardRef objects (typeof === "object")
  // react-icons exports plain functions (typeof === "function")
  // Both have PascalCase names.
  // "Icon" is a lucide-react utility component that requires an `iconNode` prop;
  // rendering it without that prop throws at runtime.
  const EXCLUDED = new Set(["Fragment", "StrictMode", "Suspense", "Children", "Component", "Icon"]);
  const result: Record<string, IconComponent> = {};
  for (const [key, val] of Object.entries(mod)) {
    if (!val || EXCLUDED.has(key) || !/^[A-Z]/.test(key)) continue;
    const t = typeof val;
    if (t === "function") {
      result[key] = val as IconComponent;
    } else if (t === "object" && !Array.isArray(val) && "$$typeof" in (val as object)) {
      // forwardRef / memo component
      result[key] = val as IconComponent;
    }
  }
  return result;
}

export default function PackagePage({
  params,
}: {
  params: Promise<{ package: string }>;
}) {
  const { package: slug } = use(params);
  const router = useRouter();

  const library = isValidLibrary(slug) ? LIBRARIES[slug] : null;

  const [iconComponents, setIconComponents] = useState<Record<string, IconComponent>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Redirect unknown slugs
  useEffect(() => {
    if (!library) router.replace("/");
  }, [library, router]);

  // Load icon library client-side
  useEffect(() => {
    if (!library) return;
    setLoading(true);
    importLibrary(slug).then((components) => {
      setIconComponents(components);
      setLoading(false);
    });
  }, [slug, library]);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const stored: string[] = JSON.parse(
        localStorage.getItem("icon-favorites") || "[]"
      );
      setFavorites(new Set(stored));
    } catch {
      /* ignore */
    }
  }, []);

  const toggleFavorite = useCallback(
    (iconName: string) => {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(iconName)) next.delete(iconName);
        else next.add(iconName);
        try {
          localStorage.setItem("icon-favorites", JSON.stringify([...next]));
        } catch { /* ignore */ }
        return next;
      });
    },
    []
  );

  // Keyboard shortcut: "/" to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // All icon names sorted
  const allIcons: IconEntry[] = useMemo(
    () =>
      Object.keys(iconComponents)
        .sort()
        .map((name) => ({ name, category: categorizeIcon(name) })),
    [iconComponents]
  );

  // Filter
  const filtered = useMemo(() => {
    return allIcons.filter(({ name, category: cat }) => {
      const matchesSearch = !search || name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || cat === category;
      const matchesFav = !showFavoritesOnly || favorites.has(name);
      return matchesSearch && matchesCategory && matchesFav;
    });
  }, [allIcons, search, category, showFavoritesOnly, favorites]);

  // Reset page when filter changes
  useEffect(() => setPage(1), [search, category, showFavoritesOnly]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visibleIcons = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!library) return null;

  return (
    <>
      <Nav />
      <main style={{ paddingTop: "60px", minHeight: "100vh" }}>

        {/* ── Pack header ──────────────────────────────────────────────── */}
        <div
          style={{
            borderBottom: "1px solid var(--border)",
            background: "var(--surface)",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "40px 24px 32px",
            }}
          >
            <Link
              href="/"
              style={{
                fontSize: "13px",
                color: "var(--foreground-muted)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "20px",
              }}
            >
              ← All packs
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "14px",
                  background: `linear-gradient(135deg, ${library.gradientFrom}22, ${library.gradientTo}22)`,
                  border: `1px solid ${library.gradientFrom}44`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  flexShrink: 0,
                }}
              >
                {library.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <h1
                  style={{
                    fontSize: "28px",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    margin: "0 0 4px",
                  }}
                >
                  {library.name}
                </h1>
                <p className="pack-description" style={{ fontSize: "14px", color: "var(--foreground-secondary)", margin: 0 }}>
                  {library.description}
                </p>
              </div>
              <div style={{ display: "flex", gap: "32px", flexShrink: 0 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em" }}>
                    {loading ? "…" : allIcons.length.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--foreground-muted)", marginTop: "2px" }}>Icons</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em" }}>
                    {filtered.length < allIcons.length ? filtered.length.toLocaleString() : "—"}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--foreground-muted)", marginTop: "2px" }}>Shown</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Search + Filters ──────────────────────────────────────────── */}
        <div
          style={{
            position: "sticky",
            top: "60px",
            zIndex: 20,
            borderBottom: "1px solid var(--border)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            background: "rgba(0,0,0,0.8)",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "12px 24px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            {/* Search */}
            <div style={{ position: "relative", flex: "1 1 260px", minWidth: "200px" }}>
              <span
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--foreground-muted)",
                  fontSize: "14px",
                  pointerEvents: "none",
                }}
              >
                🔍
              </span>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search icons… (press / to focus)"
                style={{
                  width: "100%",
                  height: "38px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "var(--surface-raised)",
                  color: "#ffffff",
                  fontSize: "14px",
                  padding: "0 12px 0 36px",
                  outline: "none",
                }}
              />
            </div>

            {/* Favorites toggle */}
            <button
              onClick={() => setShowFavoritesOnly((v) => !v)}
              style={{
                height: "38px",
                padding: "0 14px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: showFavoritesOnly ? "rgba(232,121,249,0.15)" : "var(--surface-raised)",
                color: showFavoritesOnly ? "#e879f9" : "var(--foreground-secondary)",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                whiteSpace: "nowrap",
              }}
            >
              ❤️ Favorites {favorites.size > 0 && `(${favorites.size})`}
            </button>
          </div>

          {/* Category tabs */}
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "0 24px 12px",
              display: "flex",
              gap: "6px",
              overflowX: "auto",
            }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "100px",
                  border: "1px solid",
                  borderColor: category === cat.id ? library.gradientFrom : "var(--border)",
                  background: category === cat.id ? `${library.gradientFrom}18` : "transparent",
                  color: category === cat.id ? library.gradientFrom : "var(--foreground-secondary)",
                  fontSize: "12px",
                  fontWeight: category === cat.id ? 600 : 400,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Icon grid ─────────────────────────────────────────────────── */}
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "32px 24px",
          }}
        >
          {loading ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                gap: "8px",
              }}
            >
              {Array.from({ length: 48 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: "100px",
                    borderRadius: "10px",
                    background: "var(--surface-raised)",
                    animation: "shimmer 1.5s linear infinite",
                    backgroundImage:
                      "linear-gradient(90deg, var(--surface-raised) 0%, rgba(255,255,255,0.04) 50%, var(--surface-raised) 100%)",
                    backgroundSize: "200% 100%",
                  }}
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 24px",
                color: "var(--foreground-secondary)",
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔍</div>
              <p style={{ fontSize: "16px", fontWeight: 600, color: "#ffffff", marginBottom: "8px" }}>
                No icons found
              </p>
              <p style={{ fontSize: "14px" }}>
                Try a different search term or category.
              </p>
            </div>
          ) : (
            <>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--foreground-muted)",
                  marginBottom: "16px",
                }}
              >
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length.toLocaleString()} icons
                {search && ` matching "${search}"`}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: "8px",
                }}
              >
                {visibleIcons.map(({ name }) => {
                  const IconComp = iconComponents[name];
                  const isFav = favorites.has(name);
                  return (
                    <IconErrorBoundary key={name}>
                    <div style={{ position: "relative" }}>
                      <Link
                        href={`/${slug}/${name}`}
                        style={{ textDecoration: "none" }}
                      >
                        <div
                          className="icon-card card-hover"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            padding: "16px 8px 12px",
                            borderRadius: "10px",
                            border: "1px solid var(--border)",
                            background: "var(--surface)",
                            cursor: "pointer",
                            height: "100px",
                            overflow: "hidden",
                          }}
                        >
                          {IconComp && (
                            <IconComp
                              size={28}
                              color={library.gradientFrom}
                              style={{ flexShrink: 0 }}
                            />
                          )}
                          <span
                            className="icon-name"
                            style={{
                              fontSize: "10px",
                              color: "var(--foreground-muted)",
                              textAlign: "center",
                              wordBreak: "break-all",
                              lineHeight: 1.3,
                              maxWidth: "100%",
                            }}
                          >
                            {name}
                          </span>
                        </div>
                      </Link>
                      {/* Favorite button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(name);
                        }}
                        title={isFav ? "Remove from favorites" : "Add to favorites"}
                        style={{
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "11px",
                          opacity: isFav ? 1 : 0,
                          transition: "opacity 0.15s ease",
                          lineHeight: 1,
                          padding: "2px",
                          zIndex: 2,
                        }}
                        className={isFav ? "" : "fav-btn"}
                      >
                        {isFav ? "❤️" : "🤍"}
                      </button>
                    </div>
                    </IconErrorBoundary>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  style={{
                    marginTop: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      background: "var(--surface-raised)",
                      color: page === 1 ? "var(--foreground-muted)" : "#ffffff",
                      fontSize: "13px",
                      cursor: page === 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    ← Prev
                  </button>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "var(--foreground-secondary)",
                      padding: "0 8px",
                    }}
                  >
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      background: "var(--surface-raised)",
                      color: page === totalPages ? "var(--foreground-muted)" : "#ffffff",
                      fontSize: "13px",
                      cursor: page === totalPages ? "not-allowed" : "pointer",
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Show fav button on icon card hover */}
      <style>{`
        .icon-card:hover .fav-btn { opacity: 0.5 !important; }
        .icon-card:hover .fav-btn:hover { opacity: 1 !important; }
      `}</style>
    </>
  );
}
