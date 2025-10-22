import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  timezone: z
    .string()
    .min(1, "Timezone is required"),
  allowedOrigins: z
    .array(
      z.object({
        value: z.string()
          .min(1, "Domain is required")
          .max(200, "Domain must be less than 200 characters")
          .transform((val) => {
            // Normalize the input first
            let normalized = val.trim();
            
            // Handle wildcard domains like *.example.com
            if (normalized.startsWith("*.")) {
              // If it already has https://, remove it before processing
              if (normalized.startsWith("https://*.")) {
                normalized = normalized.replace("https://*.", "*.");
              }
              return `https://${normalized.replace("*.", "subdomain.")}`;
            }
            
            // If it already starts with https://, don't add it again
            if (normalized.startsWith("https://") || normalized.startsWith("http://")) {
              return normalized.startsWith("http://") ? normalized.replace("http://", "https://") : normalized;
            }
            
            return `https://${normalized}`;
          })
          .pipe(z.url("Please enter a valid domain (supports *.domain.com)"))
          .transform((url) => {
            // Transform back to original format if it was a wildcard
            if (url.includes("subdomain.")) {
              return url.replace("https://subdomain.", "https://*.");
            }
            return url;
          })
      })
    ),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>

export const createProjectActionSchema = z.object({
  name: z.string(),
  slug: z.string(),
  timezone: z.string(),
  description: z.string().optional(),
  allowedOrigins: z.array(z.object({ value: z.string() })).optional(),
})

export type CreateProjectActionInput = z.infer<typeof createProjectActionSchema>
