import { simplistClient } from "@/lib/blog/simplist-client";

export async function GET() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://www.simplist.blog";
    const rssFeed = await simplistClient.seo.getRssFeed(baseUrl, 50);

    return new Response(rssFeed, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Error generating RSS feed:", error);

    return new Response("Error generating RSS feed", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
