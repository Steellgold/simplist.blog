import { getDocsNavItems } from "@/lib/content";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://docs.simplist.blog";

  const navItems = await getDocsNavItems();

  const docPages = navItems.map((item) => {
    // Remove trailing /index from URLs
    const cleanHref = item.href.replace(/\/index$/, "") || "/";

    // Use lastModified from frontmatter or fallback to current date
    const lastModified = item.lastModified
      ? new Date(item.lastModified)
      : new Date();

    return {
      url: `${baseUrl}${cleanHref}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: cleanHref === "/" ? 1 : 0.8,
    };
  });

  return docPages;
}
