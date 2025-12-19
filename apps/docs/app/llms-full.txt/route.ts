import { existsSync, promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";

const CONTENT_ROOTS = [
  path.join(process.cwd(), "apps", "docs", "content"),
  path.join(process.cwd(), "content"),
];

const getContentRoot = () => CONTENT_ROOTS.find(existsSync) ?? CONTENT_ROOTS[0];

interface DocPage {
  slug: string;
  title: string;
  description?: string;
  category?: string;
  content: string;
}

async function walkAndReadMdx(root: string, dir = ""): Promise<DocPage[]> {
  const dirPath = path.join(root, dir);
  if (!existsSync(dirPath)) return [];

  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const pages: DocPage[] = [];

  for (const entry of entries) {
    const relPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      pages.push(...(await walkAndReadMdx(root, relPath)));
    } else if (entry.name.endsWith(".mdx")) {
      const filePath = path.join(root, relPath);
      const source = await fs.readFile(filePath, "utf8");

      // Parse frontmatter
      const frontmatterMatch = source.match(
        /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/,
      );

      let title = entry.name.replace(/\.mdx$/, "");
      let description: string | undefined;
      let category: string | undefined;
      let content = source;

      if (frontmatterMatch) {
        const fm = frontmatterMatch[1];
        content = frontmatterMatch[2];

        const titleMatch = fm.match(/title:\s*(.+)/i);
        const descMatch = fm.match(/description:\s*(.+)/i);
        const catMatch = fm.match(/category:\s*(.+)/i);

        if (titleMatch)
          title = titleMatch[1].replace(/^["']|["']$/g, "").trim();
        if (descMatch)
          description = descMatch[1].replace(/^["']|["']$/g, "").trim();
        if (catMatch) category = catMatch[1].replace(/^["']|["']$/g, "").trim();
      }

      const slug = relPath.replace(/\\/g, "/").replace(/\.mdx$/, "");

      pages.push({
        slug: slug === "index" ? "/" : `/${slug}`,
        title,
        description,
        category,
        content: content.trim(),
      });
    }
  }

  return pages;
}

export async function GET() {
  const pages = await walkAndReadMdx(getContentRoot());

  // Sort by category then title
  pages.sort((a, b) => {
    const catCompare = (a.category ?? "").localeCompare(b.category ?? "");
    if (catCompare !== 0) return catCompare;
    return a.title.localeCompare(b.title);
  });

  // Build full output
  let output = "# Simplist Documentation (Full)\n\n";
  output +=
    "> Complete documentation for Simplist, a headless CMS for blogs.\n";
  output += "> This file contains all documentation pages in full.\n\n";

  for (const page of pages) {
    output += "---\n\n";
    output += `# ${page.title}\n\n`;
    if (page.description) {
      output += `> ${page.description}\n\n`;
    }
    output += `URL: ${page.slug}\n`;
    if (page.category) {
      output += `Category: ${page.category}\n`;
    }
    output += "\n";
    output += page.content;
    output += "\n\n";
  }

  return new NextResponse(output, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
