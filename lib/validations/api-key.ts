import { z } from "zod"

export const apiKeyTypes = ["secret", "public"] as const
export const apiKeyPermissions = ["read", "analytics"] as const

export const createApiKeySchema = z.object({
  name: z
    .string()
    .min(1, "API key name is required")
    .max(100, "API key name must be less than 100 characters"),
  type: z.enum(apiKeyTypes),
  permissions: z.array(z.enum(apiKeyPermissions)).min(1, "At least one permission is required"),
  expiresInDays: z
    .number()
    .int()
    .min(1, "Expiration must be at least 1 day")
    .max(90, "Expiration cannot exceed 90 days")
    .nullable()
    .optional(),
})

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>
