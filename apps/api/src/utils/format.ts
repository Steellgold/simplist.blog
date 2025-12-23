import { getColorHex } from "@/utils/color-mapper";
import type { Color } from "@simplist/db/generated/client";
import type {
  ArticleWithRelationsAndAuthor,
  CachedArticleType,
  ArticleVariant,
  ArticleVariantFlexible,
  DateLike,
  FormattedArticle,
  FormattedProject,
  FormattedTag,
  FormattedVariant,
  TagWithCount,
  ProjectFromPrisma,
  ProjectFlexible,
  TagFlexible,
} from "@/types";

// Helper to convert date to ISO string (handles both Date objects and strings from cache)
export const toISOString = (date: DateLike): string | null => {
  if (!date) return null;
  if (typeof date === "string") return date;
  return date.toISOString();
};

// Format bytes to human readable string
export const formatBytes = (bytes: bigint): string => {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === BigInt(0)) return "0 Bytes";

  const i = Math.floor(Math.log(Number(bytes)) / Math.log(1024));
  const value = Number(bytes) / Math.pow(1024, i);

  return `${Math.round(value * 100) / 100} ${sizes[i]}`;
};

// Format article variants as key-value map
export const formatVariants = (
  variants: ArticleVariant[] | ArticleVariantFlexible[],
): Record<string, FormattedVariant> => {
  const formattedVariants: Record<string, FormattedVariant> = {};

  for (const variant of variants) {
    formattedVariants[variant.lang] = {
      lang: variant.lang,
      title: variant.title,
      excerpt: variant.excerpt,
      content: variant.content,
      coverImage: variant.coverImage,
      wordCount: variant.wordCount,
      characterCount: variant.characterCount,
      lineCount: variant.lineCount,
      readTimeMinutes: variant.readTimeMinutes,
      createdAt: toISOString(variant.createdAt),
      updatedAt: toISOString(variant.updatedAt),
    };
  }

  return formattedVariants;
};

// Format article for API response
export const formatArticle = (
  article: ArticleWithRelationsAndAuthor | CachedArticleType,
): FormattedArticle => {
  // Format variants as key-value map if present
  const formattedVariants =
    article.variants && Array.isArray(article.variants)
      ? formatVariants(article.variants)
      : undefined;

  // Format tags if present - convert color enum to hex
  const formattedTags =
    article.tags && Array.isArray(article.tags)
      ? article.tags.map((tag: TagFlexible) => ({
          name: tag.name,
          color:
            tag.color !== undefined && tag.color !== null
              ? getColorHex(tag.color)
              : null,
          icon: tag.icon !== undefined ? tag.icon : null,
        }))
      : undefined;

  const formatted: FormattedArticle = {
    ...article,
    createdAt: toISOString(article.createdAt),
    updatedAt: toISOString(article.updatedAt),
    publishedAt: toISOString(article.publishedAt),
    variants: formattedVariants,
    tags: formattedTags,
  };

  return formatted;
};

// Format project for API response
export const formatProject = (
  project: ProjectFromPrisma | ProjectFlexible,
): FormattedProject => {
  return {
    ...project,
    createdAt:
      typeof project.createdAt === "string"
        ? project.createdAt
        : project.createdAt.toISOString(),
    updatedAt:
      typeof project.updatedAt === "string"
        ? project.updatedAt
        : project.updatedAt.toISOString(),
  };
};

// Format tag for API response - convert Color enum to hex
export const formatTag = (tag: TagWithCount): FormattedTag => {
  return {
    id: tag.id,
    name: tag.name,
    icon: tag.icon,
    color: tag.color ? getColorHex(tag.color as Color) : null,
    articleCount: tag._count?.articles || 0,
    createdAt: toISOString(tag.createdAt),
    updatedAt: toISOString(tag.updatedAt),
  };
};
