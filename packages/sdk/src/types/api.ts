import { LanguageCode } from "./languages";

// API Response types
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}

// Article variant type
export interface ArticleVariant {
  lang: LanguageCode;
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  wordCount: number;
  characterCount: number;
  lineCount: number;
  readTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

// Author type
export interface Author {
  name: string;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
}

// Tag type
export interface Tag {
  name: string;
  color?: string | null; // Hex color code (e.g., "#EF4444")
  icon?: string | null;
}

// Tag list item with article count
export interface TagListItem {
  id: string;
  name: string;
  icon: string | null;
  color: string | null; // Hex color code
  articleCount: number;
  createdAt: string;
  updatedAt: string;
}

// Article types
export interface Article {
  id: string;
  lang?: LanguageCode; // Language of the main article (defaults to fallback language if not specified)
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  published: boolean;
  status: string;
  viewCount: number;
  wordCount: number;
  characterCount: number;
  lineCount: number;
  readTimeMinutes: number;
  author: Author;
  lastUpdatedBy: Author | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  tags: Tag[];
  variants?: Record<LanguageCode, ArticleVariant>;
}

export interface ArticleListItem extends Omit<Article, "content"> {}

// Project types
export interface Project {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectStats {
  totalArticles: number;
  publishedArticles: number;
  totalViews: number;
  storageUsed: string;
  storageLimit: string;
}

export interface ProjectInfo {
  project: Project;
  stats: ProjectStats;
}

// Optional fields configuration for articles
export type ArticleSelectFields = {
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

  // Tag-specific fields (only applies if tags are included)
  tagColor?: boolean;
  tagIcon?: boolean;

  // Timestamps
  createdAt?: boolean;
  updatedAt?: boolean;
  publishedAt?: boolean;
};

// Legacy alias for backwards compatibility
export type ArticleOptionalFields = ArticleSelectFields;

// Query parameters
export interface ArticleListParams {
  page?: number;
  limit?: number;
  sort?: "createdAt" | "updatedAt" | "title" | "publishedAt" | "viewCount";
  order?: "asc" | "desc";
  published?: boolean;
  search?: string;
  status?: "draft" | "published";
  select?: ArticleSelectFields;
  // Tag filters
  tags?: string[]; // OR logic: at least one tag
  tagsAll?: string[]; // AND logic: all tags required
  excludeTags?: string[]; // Exclude articles with these tags
}
