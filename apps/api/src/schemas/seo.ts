import { z } from "zod"

export const hreflangTagSchema = z.object({
  lang: z.string(),
  url: z.url()
})

export const seoMetadataSchema = z.object({
  metaTitle: z.string(),
  metaDescription: z.string(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.url().optional(),
  ogType: z.string().default("article"),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  twitterImage: z.url().optional(),
  twitterCard: z.enum(["summary", "summary_large_image"]).default("summary_large_image"),
  canonicalUrl: z.url().optional(),
  structuredData: z.record(z.string(), z.any()).optional(),
  keywords: z.array(z.string()).optional(),
  language: z.string().default("en"),
  author: z.string().optional(),
  publishedTime: z.iso.datetime().optional(),
  modifiedTime: z.iso.datetime().optional(),
  readingTime: z.number().optional(),
  hreflang: z.array(hreflangTagSchema).optional()
})

export const articleSeoSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  content: z.string(),
  coverImage: z.string().nullable(),
  published: z.boolean(),
  viewCount: z.number(),
  wordCount: z.number(),
  characterCount: z.number(),
  lineCount: z.number(),
  readTimeMinutes: z.number(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  publishedAt: z.iso.datetime().nullable(),
  seo: seoMetadataSchema,
  project: z.object({
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable()
  })
})

export const sitemapEntrySchema = z.object({
  url: z.url(),
  lastModified: z.iso.datetime(),
  changeFrequency: z.enum(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"]),
  priority: z.number().min(0).max(1)
})

export const sitemapSchema = z.object({
  entries: z.array(sitemapEntrySchema),
  generatedAt: z.iso.datetime()
})

export type HreflangTag = z.infer<typeof hreflangTagSchema>
export type SeoMetadata = z.infer<typeof seoMetadataSchema>
export type ArticleSeo = z.infer<typeof articleSeoSchema>
export type SitemapEntry = z.infer<typeof sitemapEntrySchema>
export type Sitemap = z.infer<typeof sitemapSchema>