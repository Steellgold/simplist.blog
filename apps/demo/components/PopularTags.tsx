import Link from "next/link";
import { getAllTags } from "@/lib/advanced-features";
import type { LanguageCode } from "@simplist.blog/sdk";

interface PopularTagsProps {
  locale: LanguageCode;
}

export async function PopularTags({ locale }: PopularTagsProps) {
  const tags = await getAllTags();

  if (tags.length === 0) {
    return null;
  }

  // Sort by article count and take top 10
  const popularTags = tags
    .sort((a, b) => b.articleCount - a.articleCount)
    .slice(0, 10);

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        {locale === "fr" ? "Tags populaires" : "Popular Tags"}
      </h3>
      <div className="flex flex-wrap gap-2">
        {popularTags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tag/${tag.name}?lang=${locale}`}
            className="rounded-full px-3 py-1 text-sm transition-colors"
            style={
              tag.color
                ? {
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                    borderColor: tag.color,
                    borderWidth: "1px",
                  }
                : {
                    backgroundColor: "#e5e7eb",
                    color: "#374151",
                  }
            }
          >
            {tag.icon && <span className="mr-1">{tag.icon}</span>}
            {tag.name} ({tag.articleCount})
          </Link>
        ))}
      </div>
    </div>
  );
}
