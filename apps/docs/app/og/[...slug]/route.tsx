import { getMdxFrontmatter } from "@/lib/content";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;

  const pageSlug = slug.slice(0, -1);
  const { title = "Documentation" } = await getMdxFrontmatter(
    pageSlug.length === 0 ? ["index"] : pageSlug,
  );

  const isAPI = pageSlug.includes("api");
  const category = isAPI ? "REST API" : "SDK";

  if (!title && pageSlug.length > 0) {
    notFound();
  }

  const path = pageSlug.join("/");

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "space-between",
        background: "linear-gradient(35deg, black 0%, #39392E 100%)",
        padding: "80px 80px",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            src="https://cdn.simplist.blog/assets/simplist-text-icon-light.svg"
            alt="Simplist"
            width={180}
            height={32}
          />
        </div>

        {category && (
          <div
            style={{
              background: "rgba(234, 179, 8, 0.15)",
              border: "2px solid rgba(234, 179, 8, 0.3)",
              borderRadius: "24px",
              padding: "4px 14px",
              fontSize: "18px",
              color: "#fbbf24",
              fontWeight: "600",
            }}
          >
            {category}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          maxWidth: "900px",
          position: "relative",
        }}
      >
        <h1
          style={{
            fontSize: "64px",
            fontWeight: "bold",
            color: "white",
            lineHeight: "1.2",
            margin: 0,
          }}
        >
          {title}
        </h1>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "20px",
            color: "#94a3b8",
            fontFamily: "monospace",
          }}
        >
          <span style={{ color: "#64748b" }}>docs.simplist.blog</span>
          {path && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#475569" }}>/</span>
              <span style={{ color: "#fbbf24" }}>{path}</span>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
              linear-gradient(rgba(234, 179, 8, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(234, 179, 8, 0.03) 1px, transparent 1px)
            `,
          backgroundSize: "60px 60px",
        }}
      />
    </div>,
    { width: 1200, height: 630 },
  );
}
