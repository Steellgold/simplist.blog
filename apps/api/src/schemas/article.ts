import { z } from "zod";
import { createResponseSchema, paginationQuerySchema } from "./common";

// Tag schema for article responses
export const articleTagSchema = z.object({
  name: z.string(),
  color: z.string().nullable(),
  icon: z.string().nullable(),
});

// Author/User schema for article responses
export const articleAuthorSchema = z.object({
  name: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  image: z.string().nullable(),
});

// Article variant schema
export const articleVariantSchema = z.object({
  lang: z.string(),
  title: z.string(),
  excerpt: z.string().nullable(),
  content: z.string(),
  coverImage: z.string().nullable(),
  wordCount: z.number(),
  characterCount: z.number(),
  lineCount: z.number(),
  readTimeMinutes: z.number(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

// Project schema for article responses
export const articleProjectSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Article schema for API responses
export const articleSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().nullable(),
  coverImage: z.string().nullable(),
  published: z.boolean(),
  status: z.string(),
  viewCount: z.number(),
  wordCount: z.number(),
  characterCount: z.number(),
  lineCount: z.number(),
  readTimeMinutes: z.number(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
  publishedAt: z.string().nullable(),
  tags: z.array(articleTagSchema).optional(),
  author: articleAuthorSchema.optional(),
  lastUpdatedBy: articleAuthorSchema.nullable().optional(),
  variants: z.record(z.string(), articleVariantSchema).optional(),
  project: articleProjectSchema.optional(),
});

// Article list item (without full content)
export const articleListItemSchema = articleSchema.omit({ content: true });

// Query parameters for article list
export const articleListQuerySchema = paginationQuerySchema.extend({
  published: z.coerce.boolean().default(true),
  search: z.string().optional(),
  status: z.enum(["draft", "published"]).optional(),
});

// Response schemas
export const articleResponseSchema = createResponseSchema(articleSchema);
export const articleListResponseSchema = createResponseSchema(
  z.array(articleListItemSchema),
);

export type ArticleTag = z.infer<typeof articleTagSchema>;
export type ArticleAuthor = z.infer<typeof articleAuthorSchema>;
export type ArticleVariant = z.infer<typeof articleVariantSchema>;
export type ArticleProject = z.infer<typeof articleProjectSchema>;
export type Article = z.infer<typeof articleSchema>;
export type ArticleListItem = z.infer<typeof articleListItemSchema>;
export type ArticleListQuery = z.infer<typeof articleListQuerySchema>;
