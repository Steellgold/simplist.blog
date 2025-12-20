import type { WebhookEvent, WebhookStatus } from "@/lib/validations/webhooks";

/** Webhook data for the edit form */
export type WebhookFormData = {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: string;
  secret: string | null;
  headers: Record<string, string> | null;
  customPayload?: unknown;
  templateId?: string | null;
};

/** Webhook item for the list view */
export type WebhookListItem = {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: "active" | "disabled" | string;
  secret?: string | null;
  headers?: Record<string, string> | null;
  failureCount: number;
  lastSentAt?: Date | null;
  createdAt: Date;
  projectId?: string;
};

/** Project context for webhooks */
export type WebhookProjectContext = {
  id: string;
  name: string;
  slug: string;
  subscriptionTier: string;
};

/** Form mode */
export type WebhookFormMode = "create" | "edit";

/** Test webhook result */
export type WebhookTestResult = {
  success: boolean;
  statusCode?: number;
  error?: string;
};

export type { WebhookEvent, WebhookStatus };
