import { webhookTemplateIds } from "@/lib/types/webhook-templates";
import { z } from "zod";

export const webhookEvents = [
  "article.published",
  "article.deleted",
  "article.scheduled",
  "article.updated",
] as const;

export type WebhookEvent = (typeof webhookEvents)[number];

export const webhookStatuses = ["active", "disabled"] as const;

export type WebhookStatus = (typeof webhookStatuses)[number];

export const createWebhookSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  url: z.url("Invalid URL"),
  events: z.array(z.enum(webhookEvents)).min(1, "Select at least one event"),
  secret: z
    .string()
    .max(200, "Secret must be less than 200 characters")
    .optional(),
  headers: z.record(z.string(), z.string()).optional(),
  status: z.enum(webhookStatuses),
  customPayload: z.any().optional(),
  templateId: z.enum(webhookTemplateIds).nullable().optional(),
});

export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;

export const updateWebhookSchema = createWebhookSchema.partial();

export type UpdateWebhookInput = z.infer<typeof updateWebhookSchema>;

// Event metadata for UI
export const eventMetadata: Record<
  WebhookEvent,
  {
    name: string;
    description: string;
  }
> = {
  "article.published": {
    name: "Article Published",
    description: "Triggered when an article is published",
  },
  "article.updated": {
    name: "Article Updated",
    description: "Triggered when a published article is updated",
  },
  "article.deleted": {
    name: "Article Deleted",
    description: "Triggered when an article is deleted",
  },
  "article.scheduled": {
    name: "Article Scheduled",
    description: "Triggered when an article is scheduled for publishing",
  },
};
