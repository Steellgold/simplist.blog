import type { Prisma, Color } from "@simplist/db/generated/client";

/**
 * Article with all relations for API responses
 */
export type ArticleWithRelations = Prisma.ArticleGetPayload<{
  include: {
    variants: true;
    tags: true;
    project: true;
  };
}>;

/**
 * Article with relations including author - used in cache and format
 */
export type ArticleWithRelationsAndAuthor = Prisma.ArticleGetPayload<{
  include: {
    variants: true;
    tags: true;
    project: true;
    author: {
      select: {
        name: true;
        firstName: true;
        lastName: true;
        image: true;
      };
    };
    lastUpdatedBy: {
      select: {
        name: true;
        firstName: true;
        lastName: true;
        image: true;
      };
    };
  };
}>;

/**
 * Tag from Prisma with full fields
 */
export type TagFromPrisma = Prisma.TagGetPayload<object>;

/**
 * Article variant type
 */
export type ArticleVariant = Prisma.ArticleVariantGetPayload<object>;

/**
 * Article variant with date-like fields (from cache or DB)
 */
export type ArticleVariantFlexible = {
  id: string;
  articleId: string;
  lang: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  wordCount: number;
  characterCount: number;
  lineCount: number;
  readTimeMinutes: number;
  createdAt: Date | string;
  updatedAt: Date | string;
};

/**
 * Project type from Prisma
 */
export type ProjectFromPrisma = Prisma.ProjectGetPayload<object>;

/**
 * Project with flexible dates (from cache or DB)
 */
export type ProjectFlexible = {
  id: string;
  userId: string;
  name: string;
  slug: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

/**
 * Author/User info
 */
export type AuthorInfo = {
  name: string;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
};

/**
 * Tag with flexible dates (from cache or DB)
 */
export type TagFlexible = {
  id: string;
  slug: string | null;
  projectId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  name: string;
  description: string | null;
  color: Color | null;
  icon: string | null;
};

/**
 * Cached article - flexible version that accepts both Date and string
 */
export type CachedArticleType = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  published: boolean;
  status: string;
  viewCount: number;
  wordCount: number;
  characterCount: number;
  lineCount: number;
  readTimeMinutes: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  publishedAt: Date | string | null;
  tags: TagFlexible[];
  author: AuthorInfo;
  lastUpdatedBy: AuthorInfo | null;
  variants: ArticleVariantFlexible[];
  project: ProjectFlexible;
};

/**
 * Cached article list item
 */
export type CachedArticleListItemType = Omit<CachedArticleType, "content">;

/**
 * Date-like type (Date or string from cache)
 */
export type DateLike = Date | string | null | undefined;

/**
 * Tag with article count - flexible version
 */
export type TagWithCount = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  _count?: {
    articles: number;
  };
  [key: string]: unknown;
};

/**
 * Tag type from relation
 */
export type ArticleTag = {
  name: string;
  color?: string | null;
  icon?: string | null;
};

/**
 * API Key with permissions
 */
export type ApiKeyWithPermissions = {
  id: string;
  key: string;
  permissions: string[];
  project?: {
    id: string;
    name: string;
    slug: string;
    userId: string;
  };
};

/**
 * Project for SEO generation
 */
export type SeoProject = {
  id: string;
  slug: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
};

/**
 * Variant interface for SEO
 */
export type SeoVariant = {
  title: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  wordCount: number;
  characterCount: number;
  lineCount: number;
  readTimeMinutes: number;
  createdAt: string | null;
  updatedAt: string | null;
};

/**
 * Formatted article variant for API response
 */
export type FormattedVariant = {
  lang: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  wordCount: number;
  characterCount: number;
  lineCount: number;
  readTimeMinutes: number;
  createdAt: string | null;
  updatedAt: string | null;
};

/**
 * Formatted article for API response
 */
export type FormattedArticle = {
  [key: string]: unknown;
  slug: string;
  variants?: Record<string, FormattedVariant>;
  tags?: ArticleTag[];
  createdAt: string | null;
  updatedAt: string | null;
  publishedAt: string | null;
};

/**
 * Formatted tag for API response
 */
export type FormattedTag = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  articleCount: number;
  createdAt: string | null;
  updatedAt: string | null;
};

/**
 * Formatted project for API response
 */
export type FormattedProject = {
  [key: string]: unknown;
  createdAt: string;
  updatedAt: string;
};

/**
 * Article for SEO generation
 */
export type SeoArticle = {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  wordCount: number;
  characterCount: number;
  lineCount: number;
  readTimeMinutes: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  publishedAt: Date | string | null;
  variants?: Record<string, SeoVariant>;
  tags?: ArticleTag[];
  [key: string]: unknown;
};
