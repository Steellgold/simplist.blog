import { z } from "zod"

// Common pagination schema
export const paginationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z.enum(["createdAt", "updatedAt", "title"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc")
})

// Common response wrapper
export const createResponseSchema = <T extends z.ZodType>(dataSchema: T) => z.object({
  data: dataSchema,
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number()
  }).optional()
})

// Error response schema
export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
  details: z.any().optional()
})

export type PaginationQuery = z.infer<typeof paginationQuerySchema>
export type ErrorResponse = z.infer<typeof errorResponseSchema>