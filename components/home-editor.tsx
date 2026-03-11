"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { LIBRARIES, LIBRARY_SLUGS } from "@/lib/libraries";

const FORMATS = [
  { value: "png", label: "PNG", ext: "png" },
  { value: "svg", label: "SVG", ext: "svg" },
  { value: "webp", label: "WebP", ext: "webp" },
  { value: "ico", label: "ICO", ext: "ico" },
] as const;
type FormatValue = (typeof FORMATS)[number]["value"];

const SAMPLE_ICONS: Record<string, string> = {
  lucide: "Sparkles",
  tb: "TbStar",
  md: "MdFavorite",
  si: "SiGithub",
  gi: "GiDragonHead",
  ri: "RiHeartLine",
  fa: "FaStar",
  bs: "BsHeart",
  fi: "FiHome",
  io: "IoIosStar",
};

function buildApiUrl(
  library: string,
  iconName: string,
  size: number,
  color: string,
  format: string,
  background: string
): string {
  const params = new URLSearchParams({
    library,
    iconName,
    size: String(size),
    color,
    format,
    background,
  });
  return `/api/generate-icon?${params}`;
}

export default function HomeEditor() {
  const [library, setLibrary] = useState<string>("lucide");
  const [iconName, setIconName] = useState("Sparkles");
  const [color, setColor] = useState("#a78bfa");
  const [size, setSize] = useState(128);
  const [format, setFormat] = useState<FormatValue>("png");
  const [background, setBackground] = useState("transparent");
  const [previewKey, setPreviewKey] = useState(0);
  const [previewError, setPreviewError] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const lib = LIBRARIES[library];

  // GSAP entrance animation for the editor panel
  useEffect(() => {
    if (!editorRef.current) return;
    gsap.fromTo(
      editorRef.current,
      { opacity: 0, y: 48 },
      { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", delay: 0.15 }
    );
  }, []);

  // When library changes, reset icon name to a known sample
  useEffect(() => {
    setIconName(SAMPLE_ICONS[library] ?? "");
    setPreviewError(false);
    setPreviewKey((k) => k + 1);
  }, [library]);

  // Rebuild preview when any control changes
  useEffect(() => {
    setPreviewError(false);
    setPreviewKey((k) => k + 1);
  }, [color, size, format, iconName, background]);

  const previewUrl = buildApiUrl(library, iconName, size, color, format === "svg" ? "png" : format, background);

  const handleDownload = useCallback(async () => {
    if (!iconName.trim()) return;
    setDownloading(true);
    const ext = FORMATS.find((f) => f.value === format)?.ext ?? "png";
    const url = buildApiUrl(library, iconName, size, color, format, background);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `${iconName}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      alert("Download failed. Check that the icon name is correct.");
    } finally {
      setDownloading(false);
    }
  }, [library, iconName, size, color, format, background]);

  const copyApiUrl = useCallback(async () => {
    const url = buildApiUrl(library, iconName, size, color, format, background);
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }, [library, iconName, size, color, format, background]);

  return (
    <div
      ref={editorRef}
      className="gsap-editor-panel"
      style={{
        border: "1px solid var(--border)",
        borderRadius: "16px",
        background: "var(--surface)",
        overflow: "hidden",
      }}
    >
      <div className="home-editor-grid">
        {/* Preview pane */}
        <div
          className="checkerboard"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "280px",
            padding: "32px",
            gap: "20px",
          }}
        >
          {previewError || !iconName.trim() ? (
            <div
              style={{
                textAlign: "center",
                color: "var(--foreground-secondary)",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>⚠️</div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>
                {!iconName.trim() ? "Enter an icon name" : "Icon not found"}
              </p>
              <p style={{ fontSize: "12px" }}>
                {!iconName.trim()
                  ? "Type an icon name in the panel →"
                  : `"${iconName}" doesn't exist in ${lib?.name}`}
              </p>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={previewKey}
              src={previewUrl}
              alt={`${iconName} preview`}
              width={size}
              height={size}
              style={{
                maxWidth: "180px",
                maxHeight: "180px",
                objectFit: "contain",
                filter: "drop-shadow(0 0 24px rgba(167,139,250,0.35))",
                animation: "float 4s ease-in-out infinite",
              }}
              onError={() => setPreviewError(true)}
              onLoad={() => setPreviewError(false)}
            />
          )}

          <Link
            href={`/${library}`}
            style={{
              fontSize: "12px",
              color: "var(--foreground-muted)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            Browse all {lib?.name} icons →
          </Link>
        </div>

        {/* Controls pane */}
        <div
          className="home-editor-controls"
          style={{
            borderLeft: "1px solid var(--border)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--foreground-muted)",
              margin: 0,
            }}
          >
            Quick Editor
          </p>

          {/* Library selector */}
          <div>
            <label
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--foreground-secondary)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Icon Pack
            </label>
            <select
              value={library}
              onChange={(e) => setLibrary(e.target.value)}
              style={{
                width: "100%",
                height: "34px",
                borderRadius: "7px",
                border: "1px solid var(--border)",
                background: "var(--surface-raised)",
                color: "#fff",
                fontSize: "13px",
                padding: "0 10px",
                cursor: "pointer",
              }}
            >
              {LIBRARY_SLUGS.map((slug) => (
                <option key={slug} value={slug} style={{ background: "#111" }}>
                  {LIBRARIES[slug].emoji} {LIBRARIES[slug].name}
                </option>
              ))}
            </select>
          </div>

          {/* Icon name */}
          <div>
            <label
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--foreground-secondary)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Icon Name
            </label>
            <input
              type="text"
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              placeholder={SAMPLE_ICONS[library] ?? "e.g. Sparkles"}
              style={{
                width: "100%",
                height: "34px",
                borderRadius: "7px",
                border: "1px solid var(--border)",
                background: "var(--surface-raised)",
                color: "#fff",
                fontSize: "13px",
                padding: "0 10px",
                outline: "none",
              }}
            />
          </div>

          {/* Color */}
          <div>
            <label
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--foreground-secondary)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Color
            </label>
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
              <input
                type="text"
                value={color}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setColor(v);
                }}
                style={{
                  flex: 1,
                  height: "28px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  background: "var(--surface-raised)",
                  color: "#fff",
                  fontSize: "12px",
                  padding: "0 8px",
                  fontFamily: "monospace",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Background */}
          <div>
            <label
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--foreground-secondary)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Background
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={() => setBackground("transparent")}
                title="Transparent"
                style={{
                  width: "36px",
                  height: "28px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  border: background === "transparent"
                    ? "2px solid #818cf8"
                    : "1px solid var(--border)",
                  padding: 0,
                  overflow: "hidden",
                  flexShrink: 0,
                  background:
                    "repeating-conic-gradient(#555 0% 25%, #222 0% 50%) 0 0 / 10px 10px",
                }}
              />
              <input
                type="color"
                value={background === "transparent" ? "#ffffff" : background}
                onChange={(e) => setBackground(e.target.value)}
                style={{
                  width: "36px",
                  height: "28px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  border: background !== "transparent"
                    ? "2px solid #818cf8"
                    : "1px solid var(--border)",
                  background: "transparent",
                  padding: "2px",
                }}
              />
              <input
                type="text"
                value={background}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "transparent" || /^#[0-9a-fA-F]{0,6}$/.test(v)) setBackground(v);
                }}
                style={{
                  flex: 1,
                  height: "28px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  background: "var(--surface-raised)",
                  color: "#fff",
                  fontSize: "12px",
                  padding: "0 8px",
                  fontFamily: "monospace",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Size */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--foreground-secondary)",
                }}
              >
                Size
              </label>
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--foreground-muted)",
                  fontFamily: "monospace",
                }}
              >
                {size}px
              </span>
            </div>
            <input
              type="range"
              min={16}
              max={512}
              step={8}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

          {/* Format */}
          <div>
            <label
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--foreground-secondary)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Format
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  style={{
                    padding: "6px",
                    borderRadius: "6px",
                    border: "1px solid",
                    borderColor: format === f.value ? "#818cf8" : "var(--border)",
                    background: format === f.value ? "rgba(129,140,248,0.15)" : "var(--surface-raised)",
                    color: format === f.value ? "#818cf8" : "var(--foreground-secondary)",
                    fontSize: "12px",
                    fontWeight: format === f.value ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              onClick={handleDownload}
              disabled={downloading || !iconName.trim()}
              style={{
                width: "100%",
                height: "38px",
                borderRadius: "8px",
                border: "none",
                background: "linear-gradient(135deg, #818cf8, #e879f9)",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: downloading || !iconName.trim() ? "not-allowed" : "pointer",
                opacity: downloading || !iconName.trim() ? 0.6 : 1,
                transition: "opacity 0.15s ease",
              }}
            >
              {downloading ? "Downloading…" : `↓ Download ${format.toUpperCase()}`}
            </button>
            <button
              onClick={copyApiUrl}
              disabled={!iconName.trim()}
              style={{
                width: "100%",
                height: "34px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: copied ? "rgba(129,140,248,0.12)" : "transparent",
                color: copied ? "#818cf8" : "var(--foreground-secondary)",
                fontSize: "12px",
                fontWeight: 500,
                cursor: !iconName.trim() ? "not-allowed" : "pointer",
                opacity: !iconName.trim() ? 0.5 : 1,
                transition: "all 0.15s ease",
              }}
            >
              {copied ? "✓ API URL Copied!" : "Copy API URL"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
