# Icon to Image Converter

A full-stack Next.js web application that lets you search for icons from popular React icon libraries, preview them, and download them as high-quality **PNG, ICO, JPEG, or WebP** images.

![UI Screenshot](https://github.com/user-attachments/assets/92d8e1d2-a6ca-40ce-878e-db8fcfa21ae7)

## Features

- 🔍 **Search across 10 icon libraries** — Lucide React, Font Awesome, Feather Icons, Material Design, Bootstrap Icons, Ionicons, Game Icons, Remix Icons, Simple Icons, and Tabler Icons
- 🎨 **Custom color picker** — render any icon in any color
- 📐 **Configurable size** — from 16 px up to 1024 px
- 🖼 **Multiple output formats** — PNG, ICO, JPEG, WebP
- 👁 **Live preview** — transparent checkerboard background so you can judge the icon clearly
- ⬇️ **One-click download** — downloads the image directly as `<IconName>.<ext>` via a programmatic fetch (no new tab opened)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS |
| Icons | `lucide-react` + `react-icons` |
| SVG → Image | `sharp` (via `react-dom/server` → `renderToStaticMarkup`) |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API

The converter exposes a public REST API endpoint that developers can integrate directly into their own applications.

### `GET /api/generate-icon`

| Parameter | Default | Description |
|-----------|---------|-------------|
| `library` | `lucide` | Library slug: `lucide`, `fa`, `fi`, `md`, `bs`, `io`, `gi`, `ri`, `si`, `tb` |
| `iconName` | `Star` | Exact exported name of the icon (e.g. `Camera`, `FaBeer`, `FiHome`) |
| `size` | `256` | Output size in pixels (16–1024). ICO format is capped at 256 × 256. |
| `color` | `#000000` | Hex color string |
| `format` | `png` | Output image format: `png`, `ico`, `jpeg`, `webp` |

**Response:** an image buffer with the matching `Content-Type`, or a JSON error with the appropriate HTTP status code.

| Format | Content-Type | Notes |
|--------|-------------|-------|
| `png`  | `image/png` | Transparent background |
| `ico`  | `image/x-icon` | ICO with embedded PNG; max 256 × 256 |
| `jpeg` | `image/jpeg` | White background (JPEG has no transparency) |
| `webp` | `image/webp` | Transparent background, small file size |

### Examples

```
# PNG (default)
/api/generate-icon?library=lucide&iconName=Camera&size=512&color=%23FF5733

# ICO – perfect for favicons
/api/generate-icon?library=lucide&iconName=Star&size=32&color=%23000000&format=ico

# JPEG
/api/generate-icon?library=fa&iconName=FaBeer&size=256&color=%230000FF&format=jpeg

# WebP
/api/generate-icon?library=fi&iconName=FiHome&size=128&color=%2322C55E&format=webp
```

### Using the API in your app

```js
// Fetch a PNG and display it
const res = await fetch('/api/generate-icon?library=lucide&iconName=Heart&size=64&color=%23e11d48&format=png');
const blob = await res.blob();
const url = URL.createObjectURL(blob);
document.querySelector('#icon').src = url;
```

```bash
# Download a favicon ICO with curl
curl -o favicon.ico "http://localhost:3000/api/generate-icon?library=lucide&iconName=Star&size=32&color=%23000000&format=ico"
```
