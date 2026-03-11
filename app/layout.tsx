import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://iconimg.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
    "favicon generator",
    "icon to image",
    "icon export",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Icon → Image Converter",
    description: "Convert any React icon into a perfect image. Customize and export instantly.",
    url: siteUrl,
    siteName: "IconImg",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Icon → Image Converter",
    description: "Convert any React icon into a perfect image. Customize and export instantly.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
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
