import Link from "next/link";
import Nav from "@/components/nav";
import { LIBRARIES, LIBRARY_SLUGS } from "@/lib/libraries";

export default function HomePage() {
  const libraries = LIBRARY_SLUGS.map((slug) => LIBRARIES[slug]);

  return (
    <>
      <Nav />
      <main style={{ paddingTop: "60px" }}>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section style={{ minHeight: "92vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 24px", position: "relative", overflow: "hidden" }}>
          {/* Background glow */}
          <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translate(-50%, -50%)", width: "700px", height: "700px", borderRadius: "50%", background: "radial-gradient(circle, rgba(129,140,248,0.12) 0%, transparent 70%)" }} />
            <div style={{ position: "absolute", top: "60%", right: "5%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(232,121,249,0.07) 0%, transparent 70%)" }} />
          </div>

          {/* Badge */}
          <div className="animate-fade-up" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "100px", border: "1px solid rgba(129,140,248,0.3)", background: "rgba(129,140,248,0.08)", marginBottom: "32px", fontSize: "13px", fontWeight: 500, color: "#a78bfa" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a78bfa", boxShadow: "0 0 6px #a78bfa", flexShrink: 0, display: "inline-block" }} />
            10 icon packs · 15,000+ icons · 4 export formats
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up delay-100" style={{ fontSize: "clamp(40px, 7vw, 80px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, margin: "0 0 24px", maxWidth: "820px" }}>
            Convert Any Icon Into{" "}<span className="gradient-text">a Perfect Image</span>
          </h1>

          {/* Sub-headline */}
          <p className="animate-fade-up delay-200" style={{ fontSize: "18px", lineHeight: 1.7, color: "var(--foreground-secondary)", maxWidth: "520px", margin: "0 0 40px" }}>
            Pick an icon from any popular React icon pack. Customize color, size, stroke and background.
            Export as PNG, SVG, WebP or ICO — instantly, in your browser.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up delay-300" style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/lucide" style={{ padding: "13px 28px", borderRadius: "10px", background: "#ffffff", color: "#000000", fontSize: "15px", fontWeight: 600, textDecoration: "none", letterSpacing: "-0.01em", display: "inline-block" }}>
              Start Converting →
            </Link>
            <Link href="#packs" style={{ padding: "13px 28px", borderRadius: "10px", border: "1px solid var(--border-strong)", background: "transparent", color: "#ffffff", fontSize: "15px", fontWeight: 600, textDecoration: "none", letterSpacing: "-0.01em" }}>
              Browse Icon Packs
            </Link>
          </div>

          {/* Workflow steps */}
          <div className="animate-fade-up delay-400" style={{ marginTop: "72px", display: "flex", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            {([
              { icon: "⬡", label: "Pick Icon", sub: "10 icon packs" },
              { icon: "🎨", label: "Customize", sub: "Color, size, stroke" },
              { icon: "⬇", label: "Export", sub: "PNG, SVG, WebP, ICO" },
            ] as const).map((item, i) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ textAlign: "center", padding: "24px 32px", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--surface-raised)", minWidth: "160px" }}>
                  <div style={{ fontSize: "28px", marginBottom: "10px" }}>{item.icon}</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginBottom: "4px" }}>{item.label}</div>
                  <div style={{ fontSize: "12px", color: "var(--foreground-muted)" }}>{item.sub}</div>
                </div>
                {i < 2 && <div style={{ padding: "0 8px", fontSize: "18px", color: "var(--foreground-muted)" }}>→</div>}
              </div>
            ))}
          </div>
        </section>

        {/* ── Live preview mock ──────────────────────────────────────────── */}
        <section style={{ padding: "80px 24px", maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--foreground-muted)", fontWeight: 600, marginBottom: "12px" }}>The Editor</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, margin: 0 }}>Full control, zero friction</h2>
          </div>

          <div style={{ border: "1px solid var(--border)", borderRadius: "16px", background: "var(--surface)", overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 320px", minHeight: "400px" }}>
            {/* Preview pane */}
            <div className="checkerboard" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/api/generate-icon?library=lucide&iconName=Sparkles&size=128&color=%23a78bfa&format=png" alt="Sparkles icon preview" width={128} height={128} style={{ filter: "drop-shadow(0 0 30px rgba(167,139,250,0.4))", animation: "float 4s ease-in-out infinite" }} />
            </div>
            {/* Controls pane */}
            <div style={{ borderLeft: "1px solid var(--border)", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--foreground-muted)", marginBottom: "16px" }}>Customize</p>
                {(["Color", "Size — 128px", "Stroke — 2.0", "Padding — 12px", "Rotation — 0°"] as const).map((label) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                    <span style={{ fontSize: "13px", color: "var(--foreground-secondary)" }}>{label}</span>
                    <div style={{ width: "80px", height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.1)", position: "relative" }}>
                      <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "45%", borderRadius: "2px", background: label === "Color" ? "linear-gradient(90deg,#818cf8,#e879f9)" : "rgba(255,255,255,0.35)" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "auto" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--foreground-muted)", marginBottom: "10px" }}>Export</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  {(["PNG", "SVG", "WebP", "ICO"] as const).map((fmt) => (
                    <div key={fmt} style={{ padding: "8px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "12px", fontWeight: 600, color: "var(--foreground-secondary)", textAlign: "center", background: "var(--surface-raised)" }}>↓ {fmt}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Icon Packs ────────────────────────────────────────────────── */}
        <section id="packs" style={{ padding: "80px 24px", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <p style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--foreground-muted)", fontWeight: 600, marginBottom: "12px" }}>Icon Packs</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, margin: "0 0 16px" }}>10 packs. 15,000+ icons.</h2>
            <p style={{ fontSize: "16px", color: "var(--foreground-secondary)", maxWidth: "460px", margin: "0 auto", lineHeight: 1.6 }}>From minimal outlines to detailed brands — every icon you need for your project.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {libraries.map((lib) => (
              <Link key={lib.slug} href={`/${lib.slug}`} style={{ textDecoration: "none" }}>
                <div className="card-hover" style={{ padding: "28px", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", height: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `linear-gradient(135deg, ${lib.gradientFrom}22, ${lib.gradientTo}22)`, border: `1px solid ${lib.gradientFrom}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                      {lib.emoji}
                    </div>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>{lib.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--foreground-muted)", marginTop: "1px" }}>{lib.approxCount} icons</div>
                    </div>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--foreground-secondary)", lineHeight: 1.6, margin: "0 0 20px" }}>{lib.description}</p>
                  <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
                    {lib.sampleIcons.map((iconName) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={iconName} src={`/api/generate-icon?library=${lib.slug}&iconName=${iconName}&size=28&color=${encodeURIComponent(lib.gradientFrom)}&format=png`} alt={iconName} width={28} height={28} style={{ opacity: 0.85 }} />
                    ))}
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: lib.gradientFrom }}>Browse icons →</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────────────── */}
        <section style={{ padding: "80px 24px", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <p style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--foreground-muted)", fontWeight: 600, marginBottom: "12px" }}>Features</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, margin: 0 }}>Everything you need</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1px", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", background: "var(--border)" }}>
            {([
              { icon: "⚡", title: "Live Customization", desc: "Adjust color, size, stroke, padding, rotation and background in real time. Preview updates instantly." },
              { icon: "📦", title: "Multiple Export Formats", desc: "Download as PNG, SVG, WebP or ICO. Copy the SVG source or React component code with one click." },
              { icon: "🔍", title: "Global Icon Search", desc: "Search across all 15,000+ icons in a single keystroke. Filter by category, pack or keyword." },
              { icon: "❤️", title: "Favorites", desc: "Star any icon to save it to your local favorites list for lightning-fast access later." },
              { icon: "⌨️", title: "Keyboard Shortcuts", desc: "Copy SVG with ⌘C, cycle through preview backgrounds, download with ⌘S — no mouse needed." },
              { icon: "🔗", title: "Direct API Access", desc: "Every icon has a stable API URL. Embed icons in docs, emails or scripts without a build step." },
              { icon: "📋", title: "Copy React Component", desc: "Get the import statement and JSX snippet ready to paste into your React or Next.js project." },
              { icon: "📐", title: "Pixel-perfect Output", desc: "Icons are rasterised at 300 dpi via Sharp. Clean edges, no blur — at any size from 16 to 1024 px." },
            ] as const).map((feat) => (
              <div key={feat.title} style={{ padding: "32px", background: "var(--surface)" }}>
                <div style={{ fontSize: "28px", marginBottom: "16px" }}>{feat.icon}</div>
                <h3 style={{ fontSize: "16px", fontWeight: 600, letterSpacing: "-0.01em", margin: "0 0 8px", color: "#fff" }}>{feat.title}</h3>
                <p style={{ fontSize: "14px", color: "var(--foreground-secondary)", lineHeight: 1.6, margin: 0 }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Banner ───────────────────────────────────────────────── */}
        <section style={{ padding: "80px 24px", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ padding: "64px 40px", borderRadius: "20px", border: "1px solid var(--border)", background: "radial-gradient(ellipse at top, rgba(129,140,248,0.1) 0%, transparent 60%), var(--surface)" }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, margin: "0 0 16px" }}>Ready to convert your first icon?</h2>
            <p style={{ fontSize: "16px", color: "var(--foreground-secondary)", lineHeight: 1.6, margin: "0 0 32px" }}>No signup needed. Works in the browser. Free forever.</p>
            <Link href="/lucide" style={{ padding: "14px 32px", borderRadius: "10px", background: "linear-gradient(135deg, #818cf8, #e879f9)", color: "#ffffff", fontSize: "15px", fontWeight: 700, textDecoration: "none", letterSpacing: "-0.01em", display: "inline-block" }}>
              Browse Icon Packs →
            </Link>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <footer style={{ borderTop: "1px solid var(--border)", padding: "40px 24px", maxWidth: "1200px", margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "linear-gradient(135deg, #818cf8, #e879f9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>⬡</div>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground-secondary)" }}>IconImg</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
            {libraries.slice(0, 6).map((lib) => (
              <Link key={lib.slug} href={`/${lib.slug}`} style={{ fontSize: "13px", color: "var(--foreground-muted)", textDecoration: "none" }}>{lib.name}</Link>
            ))}
          </div>
          <p style={{ fontSize: "13px", color: "var(--foreground-muted)", margin: 0 }}>Free & open source</p>
        </footer>
      </main>
    </>
  );
}
