import { getDocsNavItems } from "@/lib/content";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://docs.simplist.blog";

  const navItems = await getDocsNavItems();

  const docPages = navItems.map((item) => ({
    url: `${baseUrl}${item.href}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: item.href === "/" ? 1 : 0.8,
  }));

  return docPages;
}
