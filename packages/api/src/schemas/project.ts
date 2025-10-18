import { z } from 'zod'
import { createResponseSchema } from './common'

// Project schema for API responses
export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

// Project stats schema
export const projectStatsSchema = z.object({
  totalArticles: z.number(),
  publishedArticles: z.number(),
  totalViews: z.number(),
  storageUsed: z.string(), // formatted as human readable string
  storageLimit: z.string()
})

// Combined project info
export const projectInfoSchema = z.object({
  project: projectSchema,
  stats: projectStatsSchema
})

// Response schemas
export const projectResponseSchema = createResponseSchema(projectInfoSchema)

export type Project = z.infer<typeof projectSchema>
export type ProjectStats = z.infer<typeof projectStatsSchema>
export type ProjectInfo = z.infer<typeof projectInfoSchema>