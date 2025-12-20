"use server";

import { requirePermission } from "@/lib/auth/permissions";
import { checkWebhookQuota } from "@/lib/subscription/quota-check";
import {
  createWebhookSchema,
  updateWebhookSchema,
  type WebhookEvent,
} from "@/lib/validations/webhooks";
import {
  getWebhookDeliveries as dbGetWebhookDeliveries,
  sendTestWebhook as dbSendTestWebhook,
  testWebhookFromData as dbTestWebhookFromData,
  prisma,
} from "@simplist/db";
import { revalidatePath } from "next/cache";

const revalidateProjectWebhooks = async (projectSlug: string) => {
  revalidatePath(`/${projectSlug}`, "layout");
  revalidatePath(`/${projectSlug}/webhooks`, "page");
};

export const getProjectWebhooks = async (projectId: string) => {
  await requirePermission(projectId, "canManageWebhooks");

  return prisma.webhook.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      url: true,
      events: true,
      status: true,
      secret: true,
      headers: true,
      customPayload: true,
      templateId: true,
      failureCount: true,
      lastSentAt: true,
      createdAt: true,
      updatedAt: true,
      projectId: true,
    },
  });
};

export const getWebhookById = async (webhookId: string) => {
  const webhook = await prisma.webhook.findUnique({
    where: { id: webhookId },
    include: {
      project: {
        select: { id: true, slug: true, name: true },
      },
    },
  });

  if (!webhook) {
    throw new Error("Webhook not found");
  }

  await requirePermission(webhook.projectId, "canManageWebhooks");

  return webhook;
};

export const createWebhook = async (
  projectId: string,
  input: Parameters<(typeof createWebhookSchema)["parse"]>[0],
) => {
  const { user, membership } = await requirePermission(
    projectId,
    "canManageWebhooks",
  );

  // Quota check
  const quota = await checkWebhookQuota(projectId);
  if (!quota.allowed) {
    throw new Error(quota.reason);
  }

  const validated = createWebhookSchema.parse(input);

  const project =
    membership.project ??
    (await prisma.project.findUnique({
      where: { id: projectId },
      select: { slug: true },
    }));

  if (!project) {
    throw new Error("Project not found");
  }

  const webhook = await prisma.webhook.create({
    data: {
      name: validated.name,
      url: validated.url,
      events: validated.events,
      secret: validated.secret,
      status: validated.status,
      headers: validated.headers,
      customPayload: validated.customPayload,
      templateId: validated.templateId,
      projectId,
    },
  });

  await revalidateProjectWebhooks(project.slug);
  return webhook;
};

export const updateWebhook = async (
  webhookId: string,
  projectId: string,
  input: Parameters<(typeof updateWebhookSchema)["parse"]>[0],
) => {
  await requirePermission(projectId, "canManageWebhooks");

  const existing = await prisma.webhook.findUnique({
    where: { id: webhookId },
    select: { id: true, projectId: true, project: { select: { slug: true } } },
  });

  if (!existing || existing.projectId !== projectId) {
    throw new Error("Webhook not found");
  }

  const validated = updateWebhookSchema.parse(input);

  const webhook = await prisma.webhook.update({
    where: { id: webhookId },
    data: {
      ...(validated.name !== undefined && { name: validated.name }),
      ...(validated.url !== undefined && { url: validated.url }),
      ...(validated.events !== undefined && { events: validated.events }),
      ...(validated.secret !== undefined && { secret: validated.secret }),
      ...(validated.status !== undefined && { status: validated.status }),
      ...(validated.headers !== undefined && { headers: validated.headers }),
      ...(validated.customPayload !== undefined && {
        customPayload: validated.customPayload,
      }),
      ...(validated.templateId !== undefined && {
        templateId: validated.templateId,
      }),
    },
  });

  await revalidateProjectWebhooks(existing.project.slug);
  return webhook;
};

export const deleteWebhook = async (webhookId: string) => {
  const webhook = await prisma.webhook.findUnique({
    where: { id: webhookId },
    select: {
      id: true,
      projectId: true,
      project: { select: { slug: true } },
    },
  });

  if (!webhook) {
    throw new Error("Webhook not found");
  }

  await requirePermission(webhook.projectId, "canManageWebhooks");

  await prisma.webhook.delete({
    where: { id: webhookId },
  });

  await revalidateProjectWebhooks(webhook.project.slug);
};

export const testWebhook = async (
  webhookId: string,
  event: WebhookEvent = "article.published",
) => {
  const webhook = await prisma.webhook.findUnique({
    where: { id: webhookId },
    select: {
      id: true,
      projectId: true,
      project: { select: { slug: true } },
    },
  });

  if (!webhook) {
    throw new Error("Webhook not found");
  }

  await requirePermission(webhook.projectId, "canManageWebhooks");

  const result = await dbSendTestWebhook(webhookId, event);

  await revalidateProjectWebhooks(webhook.project.slug);

  return result;
};

export const getWebhookDeliveries = async (
  webhookId: string,
  options: { limit?: number; offset?: number } = {},
) => {
  const webhook = await prisma.webhook.findUnique({
    where: { id: webhookId },
    select: {
      id: true,
      projectId: true,
    },
  });

  if (!webhook) {
    throw new Error("Webhook not found");
  }

  await requirePermission(webhook.projectId, "canManageWebhooks");

  return dbGetWebhookDeliveries(webhookId, options);
};

export const testWebhookFromData = async (
  projectId: string,
  data: {
    url: string;
    event: WebhookEvent;
    secret?: string | null;
    headers?: Record<string, string> | null;
    customPayload?: unknown;
  },
) => {
  await requirePermission(projectId, "canManageWebhooks");

  return dbTestWebhookFromData(data.url, data.event, {
    secret: data.secret,
    headers: data.headers,
    customPayload: data.customPayload,
  });
};
