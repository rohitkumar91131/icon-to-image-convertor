import { NextRequest, NextResponse } from "next/server";
import React from "react";
import sharp from "sharp";

// Use dynamic import to avoid Turbopack's static analysis restrictions
// on react-dom/server in API route contexts.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { renderToStaticMarkup } = require("react-dom/server") as typeof import("react-dom/server");

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
 * GET /api/generate-icon
 *
 * Query parameters:
 *   - library  : Icon library slug (e.g. 'lucide', 'fa', 'fi'). Default: 'lucide'
 *   - iconName : Exact exported name of the icon (e.g. 'Camera', 'FaBeer'). Default: 'Star'
 *   - size     : Output PNG size in pixels. Default: 256
 *   - color    : Hex color for the icon. Default: '#000000'
 *
 * Returns a PNG image buffer with Content-Type: image/png.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const library = searchParams.get("library") || "lucide";
  const iconName = searchParams.get("iconName") || "Star";
  const size = Math.min(Math.max(parseInt(searchParams.get("size") || "256", 10), 16), 1024);
  const color = searchParams.get("color") || "#000000";

  // Resolve the icon component dynamically
  const IconComponent = await resolveIcon(library, iconName);

  if (!IconComponent) {
    return NextResponse.json(
      { error: `Icon "${iconName}" not found in library "${library}"` },
      { status: 404 }
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
      { status: 500 }
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

  // Convert SVG buffer to PNG using sharp
  let pngBuffer: Buffer;
  try {
    pngBuffer = await sharp(Buffer.from(svgString), { density: 300 })
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
  } catch {
    return NextResponse.json(
      { error: "Failed to convert SVG to PNG" },
      { status: 500 }
    );
  }

  return new NextResponse(pngBuffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
