import { LANGUAGES } from "@/lib/types/languages";
import { ColorsEnum } from "@simplist/ui/lib/color";
import { IconsEnum } from "@simplist/ui/lib/icons.enum";
import { z } from "zod";

// Reserved slugs that cannot be used for project names
export const RESERVED_SLUGS = [
  // Next.js system routes
  "api",
  "_next",
  "_vercel",
  "public",
  "static",
  "project",

  // Authentication routes
  "auth",
  "login",
  "register",
  "signup",
  "signin",
  "signout",
  "logout",
  "forgot-password",
  "reset-password",
  "verify-email",
  "verify",

  // Admin/Dashboard routes
  "admin",
  "dashboard",
  "settings",
  "billing",
  "account",
  "profile",

  // Application routes
  "home",
  "about",
  "contact",
  "pricing",
  "features",
  "blog",
  "docs",
  "documentation",
  "help",
  "support",
  "faq",

  // Legal routes
  "legal",
  "privacy",
  "terms",
  "cookies",
  "gdpr",
  "terms-of-service",
  "privacy-policy",
  "cookie-policy",

  // Status/monitoring routes
  "health",
  "status",
  "metrics",
  "monitoring",
  "ping",

  // Common subdomains/prefixes
  "www",
  "app",
  "cdn",
  "mail",
  "email",
  "smtp",
  "assets",
  "uploads",
  "downloads",
  "files",
  "images",
  "img",
  "js",
  "css",
  "fonts",
  "media",

  // Webhook routes
  "webhooks",
  "webhook",
  "hooks",

  // App-specific routes
  "articles",
  "analytics",
  "api-keys",
  "create-project",
  "projects",
  "search",
  "subscription",
  "limits",

  // Content management routes
  "new",
  "edit",

  // API versioning and technical routes
  "v1",
  "version",
  "cron",
  "track",
  "stats",
  "rss",
  "feed",

  // AI/ML routes
  "ai",

  // Upload routes
  "icon",
  "banner",

  // Error pages
  "error",
  "forbidden",
  "unauthorized",
  "not-found",

  // Payment providers
  "stripe",
  "paypal",
  "checkout",

  // Technical/reserved words
  "null",
  "undefined",
  "true",
  "false",
  "root",
  "system",
  "test",
  "demo",
  "example",
  "sample",

  // Other common routes
  "sitemap",
  "robots",
  "favicon",
  "manifest",
  "service-worker",
  "sw",
] as const;

/**
 * Check if a slug is in the reserved slugs list
 */
export const isReservedSlug = (slug: string): boolean => {
  return (RESERVED_SLUGS as readonly string[]).includes(slug);
};

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name must be less than 100 characters"),
  icon: IconsEnum.optional(),
  color: ColorsEnum.optional(),
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
  icon: z.string().optional(),
  color: z.string().optional(),
  subscriptionTier: z.enum(["STARTER", "PRO"]).optional(),
  allowedOrigins: z.array(z.object({ value: z.string() })).optional(),
})

export type CreateProjectActionInput = z.infer<typeof createProjectActionSchema>

export const updateProjectSettingsSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name must be less than 100 characters"),
  slug: z
    .string()
    .min(1, "Project slug is required")
    .max(100, "Project slug must be less than 100 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .refine(
      (slug) => !isReservedSlug(slug),
      "This slug is reserved and cannot be used"
    ),
  icon: IconsEnum.optional(),
  color: ColorsEnum.optional(),
  avatarUrl: z.union([
    z.url(),
    z.literal(""),
    z.literal("pending"),
    z.null()
  ]).optional(),
  defaultLanguage: z
    .string()
    .refine((val) => LANGUAGES.some(lang => lang.code === val), "Please select a valid language"),
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
    )
    .optional(),
  baseUrl: z
    .url("Please enter a valid URL")
    .optional()
    .nullable(),
  articleUrlPattern: z
    .string()
    .min(1, "URL pattern is required")
    .max(200, "URL pattern must be less than 200 characters")
    .refine(
      (val) => val.includes("{slug}"),
      "URL pattern must include {slug}"
    )
    .optional(),
})

export type UpdateProjectSettingsInput = z.infer<typeof updateProjectSettingsSchema>
