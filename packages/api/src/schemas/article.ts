import { z } from 'zod'
import { paginationQuerySchema, createResponseSchema } from './common'

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
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  publishedAt: z.string().datetime().nullable()
})

// Article list item (without full content)
export const articleListItemSchema = articleSchema.omit({ content: true })

// Query parameters for article list
export const articleListQuerySchema = paginationQuerySchema.extend({
  published: z.coerce.boolean().default(true),
  search: z.string().optional(),
  status: z.enum(['draft', 'published']).optional()
})

// Response schemas
export const articleResponseSchema = createResponseSchema(articleSchema)
export const articleListResponseSchema = createResponseSchema(z.array(articleListItemSchema))

export type Article = z.infer<typeof articleSchema>
export type ArticleListItem = z.infer<typeof articleListItemSchema>
export type ArticleListQuery = z.infer<typeof articleListQuerySchema>