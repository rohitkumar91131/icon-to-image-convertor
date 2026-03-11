import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/nav";

export const metadata: Metadata = {
  title: "API Docs",
  description:
    "Developer API reference for Icon → Image Converter. Send GET requests to convert any icon into a PNG, SVG, WebP or ICO image with custom color, size, and background.",
};

type Param = {
  name: string;
  type: string;
  default: string;
  description: string;
};

const PARAMS: Param[] = [
  {
    name: "library",
    type: "string",
    default: "lucide",
    description:
      "Icon library slug. One of: lucide, fa, fi, md, bs, io, gi, ri, si, tb.",
  },
  {
    name: "iconName",
    type: "string",
    default: "Star",
    description:
      'Exact exported name of the icon from the library (e.g. "Camera", "FaBeer", "TbHome").',
  },
  {
    name: "size",
    type: "integer",
    default: "256",
    description: "Output image dimension in pixels. Min: 16, Max: 1024.",
  },
  {
    name: "color",
    type: "string",
    default: "#000000",
    description:
      'Icon stroke / fill color. Accepts any CSS hex color (e.g. "#a78bfa").',
  },
  {
    name: "format",
    type: "string",
    default: "png",
    description:
      "Output format. One of: png, svg, webp, ico, jpeg. PNG, WebP and ICO support transparency; JPEG always uses a solid background.",
  },
  {
    name: "background",
    type: "string",
    default: "transparent",
    description:
      'Background color. Accepts a CSS hex color (e.g. "#ffffff"), a named color (e.g. "white"), or "transparent" for no background. JPEG output always gets a solid background (defaults to white when transparent is requested).',
  },
];

const EXAMPLES = [
  {
    title: "Transparent PNG (default)",
    url: "/api/generate-icon?library=lucide&iconName=Star&size=256&color=%23a78bfa&format=png",
  },
  {
    title: "White background PNG",
    url: "/api/generate-icon?library=lucide&iconName=Star&size=256&color=%23a78bfa&format=png&background=%23ffffff",
  },
  {
    title: "Dark background WebP",
    url: "/api/generate-icon?library=lucide&iconName=Sparkles&size=128&color=%23e879f9&format=webp&background=%23111111",
  },
  {
    title: "Raw SVG",
    url: "/api/generate-icon?library=fa&iconName=FaStar&size=64&color=%23f59e0b&format=svg",
  },
  {
    title: "ICO (favicon)",
    url: "/api/generate-icon?library=lucide&iconName=Home&size=32&color=%23ffffff&format=ico&background=%23000000",
  },
];

export default function ApiDocsPage() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: "60px" }}>
        <div
          style={{
            maxWidth: "860px",
            margin: "0 auto",
            padding: "60px 24px 80px",
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: "48px" }}>
            <p
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--foreground-muted)",
                fontWeight: 600,
                marginBottom: "12px",
              }}
            >
              Developer Reference
            </p>
            <h1
              style={{
                fontSize: "clamp(28px, 5vw, 48px)",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                lineHeight: 1.1,
                margin: "0 0 16px",
              }}
            >
              Icon API
            </h1>
            <p
              style={{
                fontSize: "16px",
                color: "var(--foreground-secondary)",
                lineHeight: 1.7,
                maxWidth: "580px",
              }}
            >
              Fetch any icon as a ready-to-use image via a simple{" "}
              <code
                style={{
                  fontFamily: "monospace",
                  background: "var(--surface-raised)",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              >
                GET
              </code>{" "}
              request — no API key required. Customize color, size, background
              and output format on the fly.
            </p>
          </div>

          {/* Endpoint */}
          <Section title="Endpoint">
            <CodeBlock>{`GET https://icon-to-image-convertor.vercel.app/api/generate-icon`}</CodeBlock>
            <p
              style={{
                fontSize: "14px",
                color: "var(--foreground-secondary)",
                marginTop: "12px",
                lineHeight: 1.6,
              }}
            >
              CORS headers are included on every response — you can call this
              endpoint from any browser, server, or script without additional
              configuration.
            </p>
          </Section>

          {/* Parameters */}
          <Section title="Query Parameters">
            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "var(--surface-raised)",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <Th>Parameter</Th>
                    <Th>Type</Th>
                    <Th>Default</Th>
                    <Th>Description</Th>
                  </tr>
                </thead>
                <tbody>
                  {PARAMS.map((p, i) => (
                    <tr
                      key={p.name}
                      style={{
                        borderBottom:
                          i < PARAMS.length - 1
                            ? "1px solid var(--border)"
                            : "none",
                        background:
                          i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                      }}
                    >
                      <Td>
                        <code
                          style={{
                            fontFamily: "monospace",
                            color: "#818cf8",
                            fontWeight: 600,
                          }}
                        >
                          {p.name}
                        </code>
                      </Td>
                      <Td>
                        <span
                          style={{
                            color: "var(--foreground-muted)",
                            fontFamily: "monospace",
                          }}
                        >
                          {p.type}
                        </span>
                      </Td>
                      <Td>
                        <code
                          style={{
                            fontFamily: "monospace",
                            background: "var(--surface-raised)",
                            padding: "1px 5px",
                            borderRadius: "3px",
                            fontSize: "12px",
                          }}
                        >
                          {p.default}
                        </code>
                      </Td>
                      <Td style={{ color: "var(--foreground-secondary)" }}>
                        {p.description}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Examples */}
          <Section title="Examples">
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {EXAMPLES.map((ex) => (
                <div
                  key={ex.title}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "10px 16px",
                      background: "var(--surface-raised)",
                      borderBottom: "1px solid var(--border)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--foreground-secondary)",
                    }}
                  >
                    {ex.title}
                  </div>
                  <div
                    style={{
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ex.url}
                      alt={ex.title}
                      width={48}
                      height={48}
                      style={{
                        borderRadius: "6px",
                        border: "1px solid var(--border)",
                        background:
                          "repeating-conic-gradient(#555 0% 25%, #222 0% 50%) 0 0 / 8px 8px",
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <code
                        style={{
                          fontFamily: "monospace",
                          fontSize: "12px",
                          color: "var(--foreground-secondary)",
                          wordBreak: "break-all",
                        }}
                      >
                        GET{" "}
                        <a
                          href={ex.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#818cf8", textDecoration: "none" }}
                        >
                          {ex.url}
                        </a>
                      </code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Code snippets */}
          <Section title="Code Snippets">
            <p
              style={{
                fontSize: "14px",
                color: "var(--foreground-secondary)",
                marginBottom: "16px",
                lineHeight: 1.6,
              }}
            >
              Use the API from any language — no SDK needed.
            </p>

            <h3
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--foreground-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: "0 0 8px",
              }}
            >
              JavaScript / Fetch
            </h3>
            <CodeBlock>{`const url = new URL("https://icon-to-image-convertor.vercel.app/api/generate-icon");
url.searchParams.set("library", "lucide");
url.searchParams.set("iconName", "Star");
url.searchParams.set("size", "256");
url.searchParams.set("color", "#a78bfa");
url.searchParams.set("format", "png");
url.searchParams.set("background", "transparent");

const response = await fetch(url);
const blob = await response.blob();
const objectUrl = URL.createObjectURL(blob);
// Use objectUrl as <img src> or trigger a download`}</CodeBlock>

            <h3
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--foreground-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: "20px 0 8px",
              }}
            >
              HTML — Embed directly
            </h3>
            <CodeBlock>{`<img
  src="/api/generate-icon?library=lucide&iconName=Star&size=64&color=%23a78bfa&format=png"
  alt="Star icon"
  width="64"
  height="64"
/>`}</CodeBlock>

            <h3
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--foreground-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: "20px 0 8px",
              }}
            >
              cURL
            </h3>
            <CodeBlock>{`curl -o star.png \\
  "https://icon-to-image-convertor.vercel.app/api/generate-icon?library=lucide&iconName=Star&size=256&color=%23a78bfa&format=png"`}</CodeBlock>

            <h3
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--foreground-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: "20px 0 8px",
              }}
            >
              Python
            </h3>
            <CodeBlock>{`import requests

params = {
    "library": "lucide",
    "iconName": "Star",
    "size": 256,
    "color": "#a78bfa",
    "format": "png",
    "background": "transparent",
}

response = requests.get("https://icon-to-image-convertor.vercel.app/api/generate-icon", params=params)
with open("star.png", "wb") as f:
    f.write(response.content)`}</CodeBlock>
          </Section>

          {/* Response section */}
          <Section title="Response">
            <p
              style={{
                fontSize: "14px",
                color: "var(--foreground-secondary)",
                lineHeight: 1.7,
                marginBottom: "16px",
              }}
            >
              On success the API returns the raw image bytes with the
              appropriate{" "}
              <code
                style={{
                  fontFamily: "monospace",
                  background: "var(--surface-raised)",
                  padding: "1px 5px",
                  borderRadius: "3px",
                }}
              >
                Content-Type
              </code>{" "}
              header (e.g.{" "}
              <code
                style={{
                  fontFamily: "monospace",
                  background: "var(--surface-raised)",
                  padding: "1px 5px",
                  borderRadius: "3px",
                }}
              >
                image/png
              </code>
              ) and a{" "}
              <code
                style={{
                  fontFamily: "monospace",
                  background: "var(--surface-raised)",
                  padding: "1px 5px",
                  borderRadius: "3px",
                }}
              >
                Cache-Control: public, max-age=3600
              </code>{" "}
              header. On failure a JSON object with an{" "}
              <code
                style={{
                  fontFamily: "monospace",
                  background: "var(--surface-raised)",
                  padding: "1px 5px",
                  borderRadius: "3px",
                }}
              >
                error
              </code>{" "}
              field is returned with HTTP 400, 404, or 500.
            </p>
            <CodeBlock>{`// Error response shape
{ "error": "Icon \\"FooBar\\" not found in library \\"lucide\\"" }`}</CodeBlock>
          </Section>

          {/* Back link */}
          <div style={{ marginTop: "48px" }}>
            <Link
              href="/"
              style={{
                fontSize: "14px",
                color: "#818cf8",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              ← Back to editor
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

/* ── Small layout helpers ─────────────────────────────────────────────────── */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: "48px" }}>
      <h2
        style={{
          fontSize: "20px",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          margin: "0 0 16px",
          paddingBottom: "12px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre
      style={{
        background: "var(--surface-raised)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "16px",
        fontSize: "12px",
        lineHeight: 1.6,
        overflowX: "auto",
        color: "var(--foreground-secondary)",
        fontFamily: "monospace",
        margin: 0,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {children}
    </pre>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        padding: "10px 14px",
        textAlign: "left",
        fontSize: "11px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "var(--foreground-muted)",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <td
      style={{
        padding: "12px 14px",
        verticalAlign: "top",
        lineHeight: 1.5,
        ...style,
      }}
    >
      {children}
    </td>
  );
}
