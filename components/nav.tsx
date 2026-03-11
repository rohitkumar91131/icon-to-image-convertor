"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/lucide", label: "Lucide" },
  { href: "/tb", label: "Tabler" },
  { href: "/fa", label: "Font Awesome" },
  { href: "/md", label: "Material" },
  { href: "/api-docs", label: "API Docs" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        backgroundColor: "rgba(0,0,0,0.7)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #818cf8, #e879f9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              flexShrink: 0,
            }}
          >
            ⬡
          </div>
          <span
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "#ffffff",
              letterSpacing: "-0.01em",
            }}
          >
            IconImg
          </span>
        </Link>

        {/* Desktop nav */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          className="hidden-mobile"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: 500,
                color: pathname === link.href ? "#ffffff" : "var(--foreground-secondary)",
                background: pathname === link.href ? "rgba(255,255,255,0.08)" : "transparent",
                textDecoration: "none",
                transition: "color 0.15s ease, background 0.15s ease",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/lucide"
            style={{
              padding: "7px 16px",
              borderRadius: "8px",
              background: "#ffffff",
              color: "#000000",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              transition: "opacity 0.15s ease",
              letterSpacing: "-0.01em",
            }}
          >
            Browse Icons
          </Link>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            style={{
              display: "none",
              background: "transparent",
              border: "none",
              color: "#ffffff",
              cursor: "pointer",
              padding: "4px",
              fontSize: "20px",
            }}
            className="show-mobile"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          style={{
            borderTop: "1px solid var(--border)",
            background: "rgba(0,0,0,0.95)",
            padding: "12px 24px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{
                padding: "10px 12px",
                borderRadius: "6px",
                fontSize: "15px",
                fontWeight: 500,
                color: pathname === link.href ? "#ffffff" : "var(--foreground-secondary)",
                background: pathname === link.href ? "rgba(255,255,255,0.08)" : "transparent",
                textDecoration: "none",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .hidden-mobile { display: flex !important; }
          .show-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
