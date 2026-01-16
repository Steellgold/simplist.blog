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

// Field selection configuration
export interface ArticleFieldSelection {
  // Content fields
  content?: boolean;
  excerpt?: boolean;
  coverImage?: boolean;

  // Metadata fields
  title?: boolean;
  slug?: boolean;
  published?: boolean;
  status?: boolean;
  viewCount?: boolean;

  // Statistics fields
  wordCount?: boolean;
  characterCount?: boolean;
  lineCount?: boolean;
  readTimeMinutes?: boolean;

  // Relations
  author?: boolean;
  lastUpdatedBy?: boolean;
  tags?: boolean;
  variants?: boolean;
  project?: boolean;

  // Tag-specific fields
  tagColor?: boolean;
  tagIcon?: boolean;

  // Timestamps
  createdAt?: boolean;
  updatedAt?: boolean;
  publishedAt?: boolean;
}

// Helper to filter article fields based on selection
const filterArticleFields = (
  article: FormattedArticle,
  selection?: ArticleFieldSelection,
): FormattedArticle => {
  // If no selection provided, return all fields (default behavior)
  if (!selection) {
    return article;
  }

  const filtered: Partial<FormattedArticle> = {
    // ID is always included
    id: article.id,
  };

  // Content fields
  if (selection.content !== false) filtered.content = article.content;
  if (selection.excerpt !== false) filtered.excerpt = article.excerpt;
  if (selection.coverImage !== false) filtered.coverImage = article.coverImage;

  // Metadata fields
  if (selection.title !== false) filtered.title = article.title;
  if (selection.slug !== false) filtered.slug = article.slug;
  if (selection.published !== false) filtered.published = article.published;
  if (selection.status !== false) filtered.status = article.status;
  if (selection.viewCount !== false) filtered.viewCount = article.viewCount;

  // Statistics fields
  if (selection.wordCount !== false) filtered.wordCount = article.wordCount;
  if (selection.characterCount !== false)
    filtered.characterCount = article.characterCount;
  if (selection.lineCount !== false) filtered.lineCount = article.lineCount;
  if (selection.readTimeMinutes !== false)
    filtered.readTimeMinutes = article.readTimeMinutes;

  // Relations
  if (selection.author !== false) filtered.author = article.author;
  if (selection.lastUpdatedBy !== false)
    filtered.lastUpdatedBy = article.lastUpdatedBy;
  if (selection.tags !== false) filtered.tags = article.tags;
  if (selection.variants !== false) filtered.variants = article.variants;
  if (selection.project !== false) filtered.project = article.project;

  // Timestamps
  if (selection.createdAt !== false) filtered.createdAt = article.createdAt;
  if (selection.updatedAt !== false) filtered.updatedAt = article.updatedAt;
  if (selection.publishedAt !== false)
    filtered.publishedAt = article.publishedAt;

  // Language field
  if (article.lang !== undefined) filtered.lang = article.lang;

  return filtered as FormattedArticle;
};

// Format article for API response
export const formatArticle = (
  article: ArticleWithRelationsAndAuthor | CachedArticleType,
  selection?: ArticleFieldSelection,
): FormattedArticle => {
  // Format variants as key-value map if present
  const formattedVariants =
    article.variants && Array.isArray(article.variants)
      ? formatVariants(article.variants)
      : undefined;

  // Format tags if present - convert color enum to hex
  // Handle tag field filtering based on selection
  const includeTagColor = selection?.tagColor !== false;
  const includeTagIcon = selection?.tagIcon !== false;

  const formattedTags =
    article.tags && Array.isArray(article.tags)
      ? article.tags.map((tag: TagFlexible) => ({
          name: tag.name,
          ...(includeTagColor && {
            color:
              tag.color !== undefined && tag.color !== null
                ? getColorHex(tag.color)
                : null,
          }),
          ...(includeTagIcon && {
            icon: tag.icon !== undefined ? tag.icon : null,
          }),
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

  // Apply field filtering
  return filterArticleFields(formatted, selection);
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
