import { NextResponse } from "next/server";
import { generateRssFeed } from "@/lib/advanced-features";

export async function GET() {
  try {
    // Replace with your actual domain
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
    const rssXml = await generateRssFeed(baseUrl, 20);

    return new NextResponse(rssXml, {
      headers: {
        "Content-Type": "application/rss+xml",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("Error generating RSS feed:", error);
    return NextResponse.json(
      { error: "Failed to generate RSS feed" },
      { status: 500 },
    );
  }
}
