import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Icon → Image Converter",
    template: "%s | Icon → Image Converter",
  },
  description:
    "Convert any icon from Lucide, Tabler, Font Awesome, Material Design and more into a perfect PNG, SVG, WebP or ICO image. Customize color, size, stroke, padding and export instantly.",
  keywords: [
    "icon converter",
    "png icon",
    "svg to png",
    "lucide icons",
    "tabler icons",
    "react icons",
    "icon download",
    "icon customizer",
    "developer tools",
  ],
  openGraph: {
    title: "Icon → Image Converter",
    description: "Convert any React icon into a perfect image. Customize and export instantly.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
