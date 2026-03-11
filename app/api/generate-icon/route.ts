import { NextRequest, NextResponse } from "next/server";
import React from "react";
import sharp from "sharp";

/** CORS headers applied to every response so external developers can use the API. */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Use dynamic import to avoid Turbopack's static analysis restrictions
// on react-dom/server in API route contexts.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { renderToStaticMarkup } = require("react-dom/server") as typeof import("react-dom/server");

/** Supported output formats. */
const SUPPORTED_FORMATS = ["png", "ico", "jpeg", "webp", "svg"] as const;
type OutputFormat = (typeof SUPPORTED_FORMATS)[number];

/**
 * Wraps a PNG buffer in a minimal ICO container so the result can be saved
 * as a .ico file.  Modern ICO files support embedded PNG data for images
 * up to 256 × 256 px (a width/height byte value of 0 represents 256).
 */
function buildIcoFromPng(pngBuffer: Buffer, size: number): Buffer {
  // ICO dimensions are capped at 256; use 0 to represent 256 in the header.
  const dim = size >= 256 ? 0 : size;

  // 6-byte ICONDIR header
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type = ICO
  header.writeUInt16LE(1, 4); // image count = 1

  // 16-byte ICONDIRENTRY
  const entry = Buffer.alloc(16);
  entry.writeUInt8(dim, 0);              // width  (0 → 256)
  entry.writeUInt8(dim, 1);              // height (0 → 256)
  entry.writeUInt8(0, 2);               // color palette size (0 = no palette)
  entry.writeUInt8(0, 3);               // reserved
  entry.writeUInt16LE(1, 4);            // colour planes
  entry.writeUInt16LE(32, 6);           // bits per pixel
  entry.writeUInt32LE(pngBuffer.length, 8);  // image data size in bytes
  entry.writeUInt32LE(22, 12);          // offset to image data (6 + 16)

  return Buffer.concat([header, entry, pngBuffer]);
}

/**
 * Dynamically resolves an icon component from the requested library.
 * Supports: lucide, fa, fi, md, bs, io, gi, ri, si, tb
 */
async function resolveIcon(
  library: string,
  iconName: string
): Promise<React.ComponentType<React.SVGProps<SVGSVGElement>> | null> {
  try {
    let icons: Record<string, unknown>;

    switch (library) {
      case "lucide":
        icons = await import("lucide-react");
        break;
      case "fa":
        icons = await import("react-icons/fa");
        break;
      case "fi":
        icons = await import("react-icons/fi");
        break;
      case "md":
        icons = await import("react-icons/md");
        break;
      case "bs":
        icons = await import("react-icons/bs");
        break;
      case "io":
        icons = await import("react-icons/io");
        break;
      case "gi":
        icons = await import("react-icons/gi");
        break;
      case "ri":
        icons = await import("react-icons/ri");
        break;
      case "si":
        icons = await import("react-icons/si");
        break;
      case "tb":
        icons = await import("react-icons/tb");
        break;
      default:
        return null;
    }

    const icon = icons[iconName];
    if (typeof icon !== "function" && typeof icon !== "object") return null;
    return icon as React.ComponentType<React.SVGProps<SVGSVGElement>>;
  } catch {
    return null;
  }
}

/**
 * Parses a CSS color value (hex or named) and returns a sharp-compatible RGBA
 * object, or null if the value represents "transparent".
 */
function parseBackground(
  raw: string
): { r: number; g: number; b: number; alpha: number } | null {
  const v = raw.trim().toLowerCase();
  if (v === "transparent" || v === "none" || v === "") return null;

  // 6-digit hex: #rrggbb
  const hex6 = v.match(/^#?([0-9a-f]{6})$/);
  if (hex6) {
    const n = parseInt(hex6[1], 16);
    return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff, alpha: 1 };
  }

  // 3-digit hex: #rgb
  const hex3 = v.match(/^#?([0-9a-f]{3})$/);
  if (hex3) {
    const [, h] = hex3;
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
      alpha: 1,
    };
  }

  // rgb(r,g,b)
  const rgb = v.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
  if (rgb) {
    return {
      r: Math.min(255, parseInt(rgb[1])),
      g: Math.min(255, parseInt(rgb[2])),
      b: Math.min(255, parseInt(rgb[3])),
      alpha: 1,
    };
  }

  // Named colours (common subset)
  const NAMED: Record<string, [number, number, number]> = {
    white: [255, 255, 255],
    black: [0, 0, 0],
    red: [255, 0, 0],
    green: [0, 128, 0],
    blue: [0, 0, 255],
    yellow: [255, 255, 0],
    gray: [128, 128, 128],
    grey: [128, 128, 128],
  };
  if (NAMED[v]) {
    const [r, g, b] = NAMED[v];
    return { r, g, b, alpha: 1 };
  }

  return null; // unrecognised → fall back to transparent
}

/**
 * GET /api/generate-icon
 *
 * Query parameters:
 *   - library    : Icon library slug (e.g. 'lucide', 'fa', 'fi'). Default: 'lucide'
 *   - iconName   : Exact exported name of the icon (e.g. 'Camera', 'FaBeer'). Default: 'Star'
 *   - size       : Output image size in pixels. Default: 256
 *   - color      : Hex color for the icon stroke/fill. Default: '#000000'
 *   - format     : Output image format — 'png' | 'ico' | 'jpeg' | 'webp' | 'svg'. Default: 'png'
 *   - background : Background color (hex, rgb(), named color, or 'transparent'). Default: 'transparent'
 *
 * Returns an image buffer with the appropriate Content-Type, or a JSON error
 * with HTTP 400/404/500 on failure.
 *
 * CORS headers are included on every response so this endpoint can be called
 * directly from any origin (browser, server, scripts, etc.).
 */

/** Handles preflight CORS requests from browsers. */
export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const library = searchParams.get("library") || "lucide";
  const iconName = searchParams.get("iconName") || "Star";
  const size = Math.min(Math.max(parseInt(searchParams.get("size") || "256", 10), 16), 1024);
  const color = searchParams.get("color") || "#000000";

  // `background` defaults to transparent; callers can pass any CSS color or "transparent"
  const bgParam = searchParams.get("background") ?? "transparent";
  const bgColor = parseBackground(bgParam);

  const rawFormat = (searchParams.get("format") || "png").toLowerCase();
  if (!SUPPORTED_FORMATS.includes(rawFormat as OutputFormat)) {
    return NextResponse.json(
      { error: `Unsupported format "${rawFormat}". Supported formats: ${SUPPORTED_FORMATS.join(", ")}` },
      { status: 400, headers: CORS_HEADERS }
    );
  }
  const format = rawFormat as OutputFormat;

  // Resolve the icon component dynamically
  const IconComponent = await resolveIcon(library, iconName);

  if (!IconComponent) {
    return NextResponse.json(
      { error: `Icon "${iconName}" not found in library "${library}"` },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  // Render the icon component to an SVG string.
  // For lucide-react icons, the `color` and `size` props are natively supported.
  // For react-icons, we pass `color` and set explicit width/height via style.
  let svgString: string;
  try {
    svgString = renderToStaticMarkup(
      React.createElement(IconComponent, {
        // lucide-react uses `color` and `size`
        color,
        // react-icons accept width/height; lucide uses size
        width: size,
        height: size,
        style: { color },
      } as React.SVGProps<SVGSVGElement>)
    );
  } catch {
    return NextResponse.json(
      { error: `Failed to render icon "${iconName}"` },
      { status: 500, headers: CORS_HEADERS }
    );
  }

  // Replace `currentColor` occurrences so that librsvg (used by sharp) can
  // resolve the color correctly when it encounters fill/stroke="currentColor".
  svgString = svgString.replace(/currentColor/g, color);

  // Ensure the SVG has explicit width and height attributes for sharp.
  // If they are missing or set to "1em", replace them with the pixel size.
  svgString = svgString
    .replace(/width="[^"]*"/, `width="${size}"`)
    .replace(/height="[^"]*"/, `height="${size}"`);

  // If no width/height attributes exist at all, inject them after the opening <svg tag.
  if (!svgString.includes(`width="${size}"`)) {
    svgString = svgString.replace("<svg", `<svg width="${size}" height="${size}"`);
  }

  // If SVG format is requested, return the prepared SVG string directly
  // (skip the rasterisation pipeline entirely).
  if (format === "svg") {
    return new NextResponse(svgString as unknown as BodyInit, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  // Convert SVG to a transparent PNG first; then apply background / format conversion.
  // ensureAlpha() guarantees the output PNG has an alpha channel even when sharp's
  // SVG renderer does not emit one by default.
  let pngBuffer: Buffer;
  try {
    pngBuffer = await sharp(Buffer.from(svgString), { density: 300 })
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .ensureAlpha()
      .png()
      .toBuffer();
  } catch {
    return NextResponse.json(
      { error: "Failed to convert SVG to PNG" },
      { status: 500, headers: CORS_HEADERS }
    );
  }

  // Composite a solid background behind the icon when the caller requested one.
  if (bgColor) {
    pngBuffer = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: bgColor,
      },
    })
      .composite([{ input: pngBuffer, blend: "over" }])
      .png()
      .toBuffer();
  }

  // For ICO, wrap the PNG buffer in a minimal ICO container.
  // For JPEG/WebP, re-process the PNG through sharp with a white background
  // (these formats don't support transparency).
  let imageBuffer: Buffer;
  let contentType: string;

  switch (format) {
    case "ico": {
      // ICO spec supports up to 256 × 256; clamp and produce a square PNG first.
      const icoSize = Math.min(size, 256);
      if (icoSize !== size) {
        pngBuffer = await sharp(pngBuffer)
          .resize(icoSize, icoSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .ensureAlpha()
          .png()
          .toBuffer();
      }
      imageBuffer = buildIcoFromPng(pngBuffer, icoSize);
      contentType = "image/x-icon";
      break;
    }

    case "jpeg": {
      // JPEG does not support transparency; composite over caller's background or white.
      const jpegBg = bgColor ?? { r: 255, g: 255, b: 255, alpha: 1 };
      imageBuffer = await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: jpegBg,
        },
      })
        .composite([{ input: pngBuffer, blend: "over" }])
        .jpeg({ quality: 95 })
        .toBuffer();
      contentType = "image/jpeg";
      break;
    }

    case "webp":
      // WebP supports transparency; if a background was requested it was already applied above.
      imageBuffer = await sharp(pngBuffer).webp({ quality: 95 }).toBuffer();
      contentType = "image/webp";
      break;

    default: // "png"
      imageBuffer = pngBuffer;
      contentType = "image/png";
      break;
  }

  return new NextResponse(imageBuffer as unknown as BodyInit, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
