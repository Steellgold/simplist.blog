import { NextResponse } from "next/server";
import { generateSitemapXml } from "@/lib/advanced-features";

export async function GET() {
  try {
    // Replace with your actual domain
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
    const sitemapXml = await generateSitemapXml(baseUrl);

    return new NextResponse(sitemapXml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return NextResponse.json(
      { error: "Failed to generate sitemap" },
      { status: 500 },
    );
  }
}
