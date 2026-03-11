"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

/** Supported icon library options shown in the dropdown. */
const LIBRARIES = [
  { value: "lucide", label: "Lucide React" },
  { value: "fa", label: "Font Awesome (fa)" },
  { value: "fi", label: "Feather Icons (fi)" },
  { value: "md", label: "Material Design (md)" },
  { value: "bs", label: "Bootstrap Icons (bs)" },
  { value: "io", label: "Ionicons (io)" },
  { value: "gi", label: "Game Icons (gi)" },
  { value: "ri", label: "Remix Icons (ri)" },
  { value: "si", label: "Simple Icons (si)" },
  { value: "tb", label: "Tabler Icons (tb)" },
] as const;

/** Build the API URL from the current form state. */
function buildApiUrl(
  library: string,
  iconName: string,
  size: number,
  color: string
): string {
  const params = new URLSearchParams({
    library,
    iconName,
    size: String(size),
    color,
  });
  return `/api/generate-icon?${params.toString()}`;
}

export default function Home() {
  // Form state
  const [library, setLibrary] = useState<string>("lucide");
  const [iconName, setIconName] = useState<string>("Star");
  const [size, setSize] = useState<number>(256);
  const [color, setColor] = useState<string>("#000000");

  // Preview state
  const [previewUrl, setPreviewUrl] = useState<string>(
    buildApiUrl("lucide", "Star", 256, "#000000")
  );
  const [previewError, setPreviewError] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  /** Regenerates the preview URL from current form values. */
  const handleGenerate = useCallback(() => {
    if (!iconName.trim()) return;
    setPreviewError(false);
    setPreviewUrl(buildApiUrl(library, iconName.trim(), size, color));
  }, [library, iconName, size, color]);

  /** Downloads the current preview as icon.png via a programmatic fetch. */
  const handleDownload = useCallback(async () => {
    if (!iconName.trim()) return;
    setDownloading(true);
    try {
      const url = buildApiUrl(library, iconName.trim(), size, color);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Icon not found");

      // Convert response to a Blob and trigger a download link
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `${iconName}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(objectUrl);
    } catch {
      alert("Failed to download icon. Please check the icon name and library.");
    } finally {
      setDownloading(false);
    }
  }, [library, iconName, size, color]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <main className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 space-y-8">
        {/* Page header */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Icon → Image Converter
          </h1>
          <p className="text-slate-500 text-sm">
            Pick an icon from any popular React icon library and download it as a
            high-quality PNG.
          </p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Library selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="library">
              Icon Library
            </label>
            <select
              id="library"
              value={library}
              onChange={(e) => setLibrary(e.target.value)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              {LIBRARIES.map((lib) => (
                <option key={lib.value} value={lib.value}>
                  {lib.label}
                </option>
              ))}
            </select>
          </div>

          {/* Icon name input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="iconName">
              Icon Name
            </label>
            <input
              id="iconName"
              type="text"
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="e.g. Camera, FaBeer, FiHome"
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          {/* Color picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="color">
              Color
            </label>
            <div className="flex items-center gap-3">
              <input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-16 cursor-pointer rounded-lg border border-slate-300 p-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              <span className="text-sm font-mono text-slate-600">{color}</span>
            </div>
          </div>

          {/* Size input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="size">
              Size (px)
            </label>
            <input
              id="size"
              type="number"
              min={16}
              max={1024}
              value={size}
              onChange={(e) =>
                setSize(Math.min(1024, Math.max(16, parseInt(e.target.value, 10) || 256)))
              }
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          className="w-full h-11 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow hover:bg-slate-700 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          Generate Preview
        </button>

        {/* Preview panel */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">Preview</p>
          <div
            className={cn(
              "flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-8",
              "min-h-[200px]"
            )}
            style={{
              backgroundImage:
                "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
              backgroundSize: "16px 16px",
              backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
              backgroundColor: "#f8fafc",
            }}
          >
            {previewError ? (
              <p className="text-sm text-red-500 font-medium">
                ⚠ Icon not found. Check the library and icon name.
              </p>
            ) : (
              /* Live preview — src is regenerated on each "Generate Preview" click */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={previewUrl}
                src={previewUrl}
                alt={`${iconName} icon preview`}
                width={size}
                height={size}
                style={{ maxWidth: "100%", maxHeight: "320px", objectFit: "contain" }}
                onError={() => setPreviewError(true)}
                onLoad={() => setPreviewError(false)}
              />
            )}
          </div>
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          disabled={downloading || previewError}
          className={cn(
            "w-full h-11 rounded-xl text-sm font-semibold shadow transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
            downloading || previewError
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-emerald-600 text-white hover:bg-emerald-500 active:scale-[0.98]"
          )}
        >
          {downloading ? "Downloading…" : "⬇ Download Image"}
        </button>
      </main>
    </div>
  );
}
