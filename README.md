# Icon to Image Converter

A full-stack Next.js web application that lets you search for icons from popular React icon libraries, preview them, and download them as high-quality PNG images.

![UI Screenshot](https://github.com/user-attachments/assets/92d8e1d2-a6ca-40ce-878e-db8fcfa21ae7)

## Features

- 🔍 **Search across 10 icon libraries** — Lucide React, Font Awesome, Feather Icons, Material Design, Bootstrap Icons, Ionicons, Game Icons, Remix Icons, Simple Icons, and Tabler Icons
- 🎨 **Custom color picker** — render any icon in any color
- 📐 **Configurable size** — from 16 px up to 1024 px
- 👁 **Live preview** — transparent checkerboard background so you can judge the icon clearly
- ⬇️ **One-click download** — downloads the PNG directly as `<IconName>.png` via a programmatic fetch (no new tab opened)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS |
| Icons | `lucide-react` + `react-icons` |
| SVG → PNG | `sharp` (via `react-dom/server` → `renderToStaticMarkup`) |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API

`GET /api/generate-icon`

| Parameter | Default | Description |
|-----------|---------|-------------|
| `library` | `lucide` | Library slug: `lucide`, `fa`, `fi`, `md`, `bs`, `io`, `gi`, `ri`, `si`, `tb` |
| `iconName` | `Star` | Exact exported name of the icon (e.g. `Camera`, `FaBeer`, `FiHome`) |
| `size` | `256` | Output size in pixels (16–1024) |
| `color` | `#000000` | Hex color string |

Returns a `image/png` response, or a JSON error with HTTP 404 if the icon is not found.

## Example

```
/api/generate-icon?library=lucide&iconName=Camera&size=512&color=%23FF5733
/api/generate-icon?library=fa&iconName=FaBeer&size=256&color=%230000FF
/api/generate-icon?library=fi&iconName=FiHome&size=128&color=%2322C55E
```
