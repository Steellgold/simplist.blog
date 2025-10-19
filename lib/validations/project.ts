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
  allowedOrigins: z
    .array(
      z.string()
        .min(1, "Domain is required")
        .max(200, "Domain must be less than 200 characters")
        .transform((val) => {
          // Handle wildcard domains like *.example.com
          if (val.startsWith('*.')) {
            return `https://${val.replace('*.', 'subdomain.')}`;
          }
          return `https://${val}`;
        })
        .pipe(z.url("Please enter a valid domain (supports *.domain.com)"))
        .transform((url) => {
          // Transform back to original format if it was a wildcard
          if (url.includes('subdomain.')) {
            return url.replace('https://subdomain.', 'https://*.');
          }
          return url;
        })
    ),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
