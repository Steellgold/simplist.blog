import { getDocsNavItems } from "@/lib/content";
import { NextResponse } from "next/server";

export async function GET() {
  const items = await getDocsNavItems();

  // Group by category
  const grouped = items.reduce(
    (acc, item) => {
      const category = item.category ?? "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, typeof items>,
  );

  // Build the text output
  let output = "# Simplist Documentation\n\n";
  output +=
    "> Simplist is a headless CMS for blogs with built-in analytics, webhooks, and multi-language support.\n\n";

  for (const [category, categoryItems] of Object.entries(grouped)) {
    output += `## ${category}\n\n`;

    for (const item of categoryItems) {
      const description = item.description ? `: ${item.description}` : "";
      output += `- [${item.title}](${item.href})${description}\n`;
    }

    output += "\n";
  }

  return new NextResponse(output, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
