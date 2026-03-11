"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Nav from "@/components/nav";
import { LIBRARIES, isValidLibrary } from "@/lib/libraries";

/* ─── Types ──────────────────────────────────────────────────────────────── */

const FORMATS = [
  { value: "png",  label: "PNG",  ext: "png",  mime: "image/png" },
  { value: "svg",  label: "SVG",  ext: "svg",  mime: "image/svg+xml" },
  { value: "webp", label: "WebP", ext: "webp", mime: "image/webp" },
  { value: "ico",  label: "ICO",  ext: "ico",  mime: "image/x-icon" },
  { value: "jpeg", label: "JPEG", ext: "jpg",  mime: "image/jpeg" },
] as const;
type FormatValue = (typeof FORMATS)[number]["value"];

type PreviewBg = "transparent" | "light" | "dark";

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function buildApiUrl(
  library: string,
  iconName: string,
  size: number,
  color: string,
  format: string,
  bgColor?: string
): string {
  const params = new URLSearchParams({
    library,
    iconName,
    size: String(size),
    color,
    format,
  });
  if (bgColor) params.set("bgColor", bgColor);
  return `/api/generate-icon?${params}`;
}

function buildReactImport(slug: string, iconName: string): string {
  const pkg =
    slug === "lucide"
      ? "lucide-react"
      : `react-icons/${slug}`;
  return `import { ${iconName} } from "${pkg}";`;
}

function buildReactSnippet(slug: string, iconName: string, color: string, size: number): string {
  const importLine = buildReactImport(slug, iconName);
  const jsx =
    slug === "lucide"
      ? `<${iconName} color="${color}" size={${size}} />`
      : `<${iconName} color="${color}" size={${size}} />`;
  return `${importLine}\n\n// JSX\n${jsx}`;
}

function buildHtmlSnippet(apiUrl: string): string {
  return `<img src="${apiUrl}" alt="icon" width="64" height="64" />`;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function IconEditorPage({
  params,
}: {
  params: Promise<{ package: string; iconname: string }>;
}) {
  const { package: slug, iconname } = use(params);
  const router = useRouter();

  const library = isValidLibrary(slug) ? LIBRARIES[slug] : null;

  // Controls
  const [color, setColor] = useState("#818cf8");
  const [size, setSize] = useState(256);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [padding, setPadding] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [previewBg, setPreviewBg] = useState<PreviewBg>("transparent");
  const [format, setFormat] = useState<FormatValue>("png");

  // State
  const [previewKey, setPreviewKey] = useState(0);
  const [previewError, setPreviewError] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const favKey = `${slug}/${iconname}`;

  useEffect(() => {
    if (!library) router.replace("/");
  }, [library, router]);

  // Load favorite status
  useEffect(() => {
    try {
      const stored: string[] = JSON.parse(
        localStorage.getItem("icon-favorites") || "[]"
      );
      setIsFavorite(stored.includes(iconname));
    } catch { /* ignore */ }
  }, [iconname]);

  const toggleFavorite = useCallback(() => {
    setIsFavorite((prev) => {
      const next = !prev;
      try {
        const stored: string[] = JSON.parse(
          localStorage.getItem("icon-favorites") || "[]"
        );
        const updated = next
          ? [...new Set([...stored, iconname])]
          : stored.filter((n) => n !== iconname);
        localStorage.setItem("icon-favorites", JSON.stringify(updated));
      } catch { /* ignore */ }
      return next;
    });
  }, [iconname]);

  // Build the preview URL — rebuild whenever any control changes
  const effectiveSize = Math.max(size - padding * 2, 16);
  const previewUrl = buildApiUrl(slug, iconname, effectiveSize, color, format === "svg" ? "png" : format);
  const svgUrl = buildApiUrl(slug, iconname, size, color, "svg");

  // Re-generate preview when params change
  useEffect(() => {
    setPreviewError(false);
    setPreviewKey((k) => k + 1);
  }, [color, size, strokeWidth, padding, rotation, format, flipH, flipV]);

  // Copy helpers
  const copyText = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch { /* ignore */ }
  }, []);

  const copySvg = useCallback(async () => {
    const resp = await fetch(svgUrl);
    if (!resp.ok) return;
    const svg = await resp.text();
    copyText(svg, "SVG");
  }, [svgUrl, copyText]);

  const copyReact = useCallback(() => {
    copyText(buildReactSnippet(slug, iconname, color, size), "React");
  }, [slug, iconname, color, size, copyText]);

  const copyHtml = useCallback(() => {
    const url = buildApiUrl(slug, iconname, size, color, "png");
    copyText(buildHtmlSnippet(url), "HTML");
  }, [slug, iconname, size, color]);

  const copyApiUrl = useCallback(() => {
    const url = buildApiUrl(slug, iconname, size, color, "png");
    copyText(`${window.location.origin}${url}`, "URL");
  }, [slug, iconname, size, color]);

  // Download
  const handleDownload = useCallback(async () => {
    setDownloading(true);
    const ext = FORMATS.find((f) => f.value === format)?.ext ?? "png";
    const url = buildApiUrl(slug, iconname, size, color, format);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `${iconname}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      alert("Download failed.");
    } finally {
      setDownloading(false);
    }
  }, [slug, iconname, size, color, format]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === "s") { e.preventDefault(); handleDownload(); }
      if (meta && e.key === "c" && !e.shiftKey) { e.preventDefault(); copySvg(); }
      if (e.key === "b") setPreviewBg((bg) => bg === "transparent" ? "light" : bg === "light" ? "dark" : "transparent");
      if (e.key === "f") toggleFavorite();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleDownload, copySvg, toggleFavorite]);

  if (!library) return null;

  /* ─── Preview background ──────────────────────────────────────────────── */
  const previewBgStyle: React.CSSProperties =
    previewBg === "transparent"
      ? {
          backgroundImage:
            "linear-gradient(45deg,#1a1a1a 25%,transparent 25%),linear-gradient(-45deg,#1a1a1a 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#1a1a1a 75%),linear-gradient(-45deg,transparent 75%,#1a1a1a 75%)",
          backgroundSize: "16px 16px",
          backgroundPosition: "0 0,0 8px,8px -8px,-8px 0px",
          backgroundColor: "#111111",
        }
      : previewBg === "light"
      ? { backgroundColor: "#f5f5f5" }
      : { backgroundColor: "#0a0a0a" };

  /* ─── Icon transform ──────────────────────────────────────────────────── */
  const iconTransform = [
    rotation !== 0 ? `rotate(${rotation}deg)` : "",
    flipH ? "scaleX(-1)" : "",
    flipV ? "scaleY(-1)" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const apiUrlForDisplay = buildApiUrl(slug, iconname, size, color, "png");

  return (
    <>
      <Nav />
      <main style={{ paddingTop: "60px", minHeight: "100vh" }}>

        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <div
          style={{
            borderBottom: "1px solid var(--border)",
            background: "var(--surface)",
            padding: "12px 24px",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: "var(--foreground-muted)",
            }}
          >
            <Link href="/" style={{ color: "var(--foreground-muted)", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <Link href={`/${slug}`} style={{ color: "var(--foreground-muted)", textDecoration: "none" }}>{library.name}</Link>
            <span>/</span>
            <span style={{ color: "#ffffff", fontWeight: 500 }}>{iconname}</span>
            <button
              onClick={toggleFavorite}
              title={isFavorite ? "Remove from favorites (F)" : "Add to favorites (F)"}
              style={{
                marginLeft: "8px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                padding: 0,
                lineHeight: 1,
              }}
            >
              {isFavorite ? "❤️" : "🤍"}
            </button>
          </div>
        </div>

        {/* ── Editor layout ─────────────────────────────────────────────── */}
        <div
          className="editor-grid"
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "32px 24px",
          }}
        >
          {/* Left: Preview ──────────────────────────────────────────────── */}
          <div>
            {/* Preview modes */}
            <div
              style={{
                display: "flex",
                gap: "6px",
                marginBottom: "16px",
              }}
            >
              {(["transparent", "light", "dark"] as PreviewBg[]).map((bg) => (
                <button
                  key={bg}
                  onClick={() => setPreviewBg(bg)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    border: "1px solid",
                    borderColor: previewBg === bg ? library.gradientFrom : "var(--border)",
                    background: previewBg === bg ? `${library.gradientFrom}18` : "var(--surface)",
                    color: previewBg === bg ? library.gradientFrom : "var(--foreground-secondary)",
                    fontSize: "12px",
                    fontWeight: previewBg === bg ? 600 : 400,
                    cursor: "pointer",
                    textTransform: "capitalize",
                    transition: "all 0.15s ease",
                  }}
                >
                  {bg}
                </button>
              ))}
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: "11px",
                  color: "var(--foreground-muted)",
                  alignSelf: "center",
                }}
              >
                Press B to cycle
              </span>
            </div>

            {/* Preview area */}
            <div
              style={{
                ...previewBgStyle,
                borderRadius: "16px",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "420px",
                padding: `${padding}px`,
                overflow: "hidden",
              }}
            >
              {previewError ? (
                <div style={{ textAlign: "center", color: "var(--foreground-secondary)", padding: "40px" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>
                    Icon not found
                  </p>
                  <p style={{ fontSize: "13px" }}>
                    &ldquo;{iconname}&rdquo; doesn&apos;t exist in {library.name}.
                  </p>
                  <Link
                    href={`/${slug}`}
                    style={{
                      display: "inline-block",
                      marginTop: "16px",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      background: "var(--surface-raised)",
                      border: "1px solid var(--border)",
                      color: "#fff",
                      fontSize: "13px",
                      textDecoration: "none",
                    }}
                  >
                    ← Browse {library.name}
                  </Link>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={previewKey}
                  src={previewUrl}
                  alt={`${iconname} preview`}
                  width={effectiveSize}
                  height={effectiveSize}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "380px",
                    objectFit: "contain",
                    transform: iconTransform || undefined,
                    transition: "transform 0.2s ease",
                  }}
                  onError={() => setPreviewError(true)}
                  onLoad={() => setPreviewError(false)}
                />
              )}
            </div>

            {/* API URL */}
            <div
              style={{
                marginTop: "16px",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--surface-raised)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span style={{ fontSize: "11px", color: "var(--foreground-muted)", whiteSpace: "nowrap", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                API
              </span>
              <code
                style={{
                  fontSize: "12px",
                  color: "var(--foreground-secondary)",
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontFamily: "monospace",
                }}
              >
                {apiUrlForDisplay}
              </code>
              <button
                onClick={copyApiUrl}
                style={{
                  padding: "4px 10px",
                  borderRadius: "5px",
                  border: "1px solid var(--border)",
                  background: copied === "URL" ? `${library.gradientFrom}20` : "transparent",
                  color: copied === "URL" ? library.gradientFrom : "var(--foreground-secondary)",
                  fontSize: "12px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {copied === "URL" ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* Right: Controls ──────────────────────────────────────────────── */}
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "16px",
              background: "var(--surface)",
              overflow: "hidden",
            }}
          >
            {/* Icon info header */}
            <div
              style={{
                padding: "20px 20px 16px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: `linear-gradient(135deg, ${library.gradientFrom}22, ${library.gradientTo}22)`,
                    border: `1px solid ${library.gradientFrom}44`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                  }}
                >
                  {library.emoji}
                </div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.01em" }}>{iconname}</div>
                  <div style={{ fontSize: "12px", color: "var(--foreground-muted)" }}>{library.name}</div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ padding: "20px" }}>
              <SectionLabel>Appearance</SectionLabel>

              {/* Color */}
              <ControlRow label="Color">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    style={{
                      width: "36px",
                      height: "28px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      border: "1px solid var(--border)",
                      background: "transparent",
                      padding: "2px",
                    }}
                  />
                  <code
                    style={{
                      fontSize: "12px",
                      color: "var(--foreground-secondary)",
                      fontFamily: "monospace",
                    }}
                  >
                    {color.toUpperCase()}
                  </code>
                </div>
              </ControlRow>

              {/* Size */}
              <ControlRow label={`Size — ${size}px`}>
                <input
                  type="range"
                  min={16}
                  max={512}
                  step={8}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
              </ControlRow>

              {/* Stroke */}
              <ControlRow label={`Stroke — ${strokeWidth.toFixed(1)}`}>
                <input
                  type="range"
                  min={0.5}
                  max={4}
                  step={0.5}
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
              </ControlRow>

              {/* Padding */}
              <ControlRow label={`Padding — ${padding}px`}>
                <input
                  type="range"
                  min={0}
                  max={64}
                  step={4}
                  value={padding}
                  onChange={(e) => setPadding(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
              </ControlRow>

              {/* Rotation */}
              <ControlRow label={`Rotation — ${rotation}°`}>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={15}
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
              </ControlRow>

              {/* Flip */}
              <ControlRow label="Flip">
                <div style={{ display: "flex", gap: "6px" }}>
                  <ToggleButton
                    active={flipH}
                    onClick={() => setFlipH((v) => !v)}
                    accentColor={library.gradientFrom}
                  >
                    H
                  </ToggleButton>
                  <ToggleButton
                    active={flipV}
                    onClick={() => setFlipV((v) => !v)}
                    accentColor={library.gradientFrom}
                  >
                    V
                  </ToggleButton>
                  {(flipH || flipV || rotation !== 0) && (
                    <button
                      onClick={() => { setFlipH(false); setFlipV(false); setRotation(0); }}
                      style={{
                        padding: "5px 10px",
                        borderRadius: "6px",
                        border: "1px solid var(--border)",
                        background: "transparent",
                        color: "var(--foreground-muted)",
                        fontSize: "11px",
                        cursor: "pointer",
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>
              </ControlRow>

              <div style={{ margin: "20px 0", borderTop: "1px solid var(--border)" }} />
              <SectionLabel>Export Format</SectionLabel>

              {/* Format */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px", marginBottom: "20px" }}>
                {FORMATS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFormat(f.value)}
                    style={{
                      padding: "8px 4px",
                      borderRadius: "6px",
                      border: "1px solid",
                      borderColor: format === f.value ? library.gradientFrom : "var(--border)",
                      background: format === f.value ? `${library.gradientFrom}18` : "var(--surface-raised)",
                      color: format === f.value ? library.gradientFrom : "var(--foreground-secondary)",
                      fontSize: "11px",
                      fontWeight: format === f.value ? 700 : 400,
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Download button */}
              <button
                onClick={handleDownload}
                disabled={downloading || previewError}
                style={{
                  width: "100%",
                  padding: "11px",
                  borderRadius: "9px",
                  border: "none",
                  background:
                    downloading || previewError
                      ? "rgba(255,255,255,0.06)"
                      : `linear-gradient(135deg, ${library.gradientFrom}, ${library.gradientTo})`,
                  color: downloading || previewError ? "var(--foreground-muted)" : "#ffffff",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: downloading || previewError ? "not-allowed" : "pointer",
                  letterSpacing: "-0.01em",
                  transition: "opacity 0.15s ease",
                  marginBottom: "8px",
                }}
              >
                {downloading
                  ? "Downloading…"
                  : `↓ Download ${FORMATS.find((f) => f.value === format)?.label ?? format.toUpperCase()}`}
              </button>

              <div style={{ margin: "16px 0", borderTop: "1px solid var(--border)" }} />
              <SectionLabel>Copy</SectionLabel>

              {/* Copy buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {[
                  { label: "Copy SVG", id: "SVG",   action: copySvg,    icon: "⟨/⟩" },
                  { label: "Copy React", id: "React", action: copyReact,  icon: "⚛" },
                  { label: "Copy HTML",  id: "HTML",  action: copyHtml,   icon: "🌐" },
                  { label: "Copy API URL", id: "URL", action: copyApiUrl, icon: "🔗" },
                ].map(({ label, id, action, icon }) => (
                  <button
                    key={id}
                    onClick={action}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      background: copied === id ? `${library.gradientFrom}14` : "var(--surface-raised)",
                      color: copied === id ? library.gradientFrom : "var(--foreground-secondary)",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span style={{ fontSize: "14px" }}>{icon}</span>
                    <span style={{ flex: 1 }}>{label}</span>
                    {copied === id && (
                      <span style={{ fontSize: "11px", fontWeight: 600 }}>✓ Copied</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Keyboard shortcuts hint */}
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--foreground-muted)", margin: "0 0 8px" }}>
                  Keyboard Shortcuts
                </p>
                {[
                  { keys: "⌘S", desc: "Download" },
                  { keys: "⌘C", desc: "Copy SVG" },
                  { keys: "B",  desc: "Cycle background" },
                  { keys: "F",  desc: "Toggle favorite" },
                  { keys: "/",  desc: "Focus search (pack page)" },
                ].map(({ keys, desc }) => (
                  <div
                    key={keys}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "5px",
                    }}
                  >
                    <span style={{ fontSize: "11px", color: "var(--foreground-muted)" }}>{desc}</span>
                    <kbd
                      style={{
                        fontSize: "10px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.06)",
                        color: "var(--foreground-secondary)",
                        fontFamily: "monospace",
                      }}
                    >
                      {keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* React snippet */}
            {!previewError && (
              <div
                style={{
                  borderTop: "1px solid var(--border)",
                  padding: "16px 20px",
                }}
              >
                <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--foreground-muted)", margin: "0 0 10px" }}>
                  React Usage
                </p>
                <pre
                  style={{
                    margin: 0,
                    padding: "12px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    fontSize: "11px",
                    color: "var(--foreground-secondary)",
                    fontFamily: "monospace",
                    overflowX: "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                  }}
                >
                  <code>{buildReactSnippet(slug, iconname, color, size)}</code>
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* ── Related icons ──────────────────────────────────────────────── */}
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 24px 64px",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              color: "var(--foreground-muted)",
              marginBottom: "12px",
            }}
          >
            ← Back to{" "}
            <Link
              href={`/${slug}`}
              style={{ color: library.gradientFrom, textDecoration: "none" }}
            >
              {library.name}
            </Link>
          </p>
        </div>
      </main>

      {/* Responsive two-column → single column */}
      <style>{`
        @media (max-width: 900px) {
          main > div:last-of-type > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}

/* ─── Small helper components ────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: "11px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: "var(--foreground-muted)",
        margin: "0 0 12px",
      }}
    >
      {children}
    </p>
  );
}

function ControlRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div
        style={{
          fontSize: "13px",
          color: "var(--foreground-secondary)",
          marginBottom: "8px",
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
  accentColor,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  accentColor: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 12px",
        borderRadius: "6px",
        border: "1px solid",
        borderColor: active ? accentColor : "var(--border)",
        background: active ? `${accentColor}18` : "var(--surface-raised)",
        color: active ? accentColor : "var(--foreground-secondary)",
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      {children}
    </button>
  );
}
