import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Icon to Image Converter",
  description: "Search icons from popular React icon libraries and download them as PNG images.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
