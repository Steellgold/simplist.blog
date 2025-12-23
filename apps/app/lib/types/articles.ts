import type { ArticleStatus, Prisma } from "@simplist/db";

/** Article statuses that can be set in forms (excludes "deleted") */
export type ArticleFormStatus = Exclude<ArticleStatus, "deleted">;

/** Re-export ArticleStatus enum from Prisma */
export type { ArticleStatus };

/**
 * Article with variants and tags
 * Used in article edit/create forms
 */
export type ArticleWithVariantsAndTags = Prisma.ArticleGetPayload<{
  include: {
    variants: true;
    tags: {
      select: {
        id: true;
        name: true;
      };
    };
    project: {
      select: {
        defaultLanguage: true;
      };
    };
  };
}>;

/**
 * Article variant for form state
 * Lighter version without DB metadata
 */
export interface ArticleVariantFormData {
  lang: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
}
