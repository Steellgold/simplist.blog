import { createHmac } from "crypto"
import { prisma } from "./client"

export type WebhookEvent =
  | "article.published"
  | "article.deleted"
  | "article.scheduled"
  | "article.updated"

type ArticlePayload = {
  id: string
  title: string
  slug: string
  excerpt?: string
  author?: string
  tags?: string[]
  publishedAt?: string
  url?: string
  coverImage?: string
  wordCount?: number
  characterCount?: number
  lineCount?: number
  readTimeMinutes?: number
  variantCount?: number
}

/**
 * Replace variables in a string with values from the article
 * Supports: {title}, {slug}, {excerpt}, {author}, {tags}, {publishedAt}, {url}, {event},
 * {coverImage}, {wordCount}, {characterCount}, {lineCount}, {readTimeMinutes}, {variantCount}
 */
const replaceVariables = (
  text: string,
  event: WebhookEvent,
  article: ArticlePayload
): string => {
  const variables: Record<string, string> = {
    title: article.title ?? "Untitled",
    slug: article.slug ?? "",
    excerpt: article.excerpt ?? "",
    author: article.author ?? "Unknown",
    tags: Array.isArray(article.tags) ? article.tags.join(", ") : "",
    publishedAt: article.publishedAt ?? new Date().toISOString(),
    url: article.url ?? "",
    event: event,
    coverImage: article.coverImage ?? "",
    wordCount: article.wordCount?.toString() ?? "0",
    characterCount: article.characterCount?.toString() ?? "0",
    lineCount: article.lineCount?.toString() ?? "0",
    readTimeMinutes: article.readTimeMinutes?.toString() ?? "0",
    variantCount: article.variantCount?.toString() ?? "0",
  }

  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key] ?? match
  })
}

/**
 * Recursively replace variables in a JSON object
 */
const replaceVariablesInObject = (
  obj: unknown,
  event: WebhookEvent,
  article: ArticlePayload
): unknown => {
  if (typeof obj === "string") {
    return replaceVariables(obj, event, article)
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => replaceVariablesInObject(item, event, article))
  }
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = replaceVariablesInObject(value, event, article)
    }
    return result
  }
  return obj
}

/**
 * Build the webhook payload - uses customPayload if present, otherwise generic format
 */
const buildBody = (
  event: WebhookEvent,
  article: ArticlePayload,
  customPayload?: unknown
): Record<string, unknown> => {
  // If custom payload is defined, use it with variable replacement
  if (customPayload && typeof customPayload === "object") {
    return replaceVariablesInObject(customPayload, event, article) as Record<string, unknown>
  }

  // Default generic payload
  return {
    event,
    timestamp: new Date().toISOString(),
    article: {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt ?? null,
      author: article.author ?? null,
      tags: article.tags ?? [],
      publishedAt: article.publishedAt ?? null,
      url: article.url ?? null,
      coverImage: article.coverImage ?? null,
      wordCount: article.wordCount ?? null,
      characterCount: article.characterCount ?? null,
      lineCount: article.lineCount ?? null,
      readTimeMinutes: article.readTimeMinutes ?? null,
      variantCount: article.variantCount ?? null,
    },
  }
}

const safeParseJson = (text: string) => {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export const sendWebhookEvent = async (
  projectId: string,
  event: WebhookEvent,
  article: ArticlePayload
) => {
  const webhooks = await prisma.webhook.findMany({
    where: {
      projectId,
      status: "active",
      events: {
        has: event,
      },
    },
  })

  if (webhooks.length === 0) return

  for (const hook of webhooks) {
    const body = buildBody(event, article, hook.customPayload)

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "simplist-webhooks/1.0",
    }

    if (hook.secret) {
      const signature = createHmac("sha256", hook.secret)
        .update(JSON.stringify(body))
        .digest("hex")
      headers["X-Simplist-Signature"] = signature
    }

    if (hook.headers && typeof hook.headers === "object") {
      for (const [k, v] of Object.entries(
        hook.headers as Record<string, string>
      )) {
        if (typeof v === "string") headers[k] = v
      }
    }

    try {
      const response = await fetch(hook.url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      })

      const text = await response.text()
      const parsed = text ? safeParseJson(text) : null

      await prisma.webhookDelivery.create({
        data: {
          webhookId: hook.id,
          status: response.ok ? "success" : "failed",
          statusCode: response.status,
          response: parsed,
          attemptedAt: new Date(),
        },
      })

      await prisma.webhook.update({
        where: { id: hook.id },
        data: {
          lastSentAt: new Date(),
          failureCount: response.ok ? 0 : { increment: 1 },
        },
      })
    } catch (error) {
      await prisma.webhookDelivery.create({
        data: {
          webhookId: hook.id,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
          attemptedAt: new Date(),
        },
      })

      await prisma.webhook.update({
        where: { id: hook.id },
        data: {
          failureCount: { increment: 1 },
        },
      })
    }
  }
}

/**
 * Send a test webhook with sample data
 */
export const sendTestWebhook = async (
  webhookId: string,
  event: WebhookEvent = "article.published"
): Promise<{ success: boolean; statusCode?: number; error?: string }> => {
  const hook = await prisma.webhook.findUnique({
    where: { id: webhookId },
  })

  if (!hook) {
    return { success: false, error: "Webhook not found" }
  }

  const sampleArticle: ArticlePayload = {
    id: "clxyz123456789",
    title: "Sample Article Title",
    slug: "sample-article-title",
    excerpt: "This is a sample excerpt for testing your webhook integration.",
    author: "John Doe",
    tags: ["test", "webhook", "sample"],
    publishedAt: new Date().toISOString(),
    url: "https://example.com/blog/sample-article-title",
    coverImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=300&fit=crop",
    wordCount: 250,
    characterCount: 1500,
    lineCount: 20,
    readTimeMinutes: 2,
    variantCount: 3,
  }

  const body = buildBody(event, sampleArticle, hook.customPayload)

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "simplist-webhooks/1.0",
    "X-Simplist-Test": "true",
  }

  if (hook.secret) {
    const signature = createHmac("sha256", hook.secret)
      .update(JSON.stringify(body))
      .digest("hex")
    headers["X-Simplist-Signature"] = signature
  }

  if (hook.headers && typeof hook.headers === "object") {
    for (const [k, v] of Object.entries(
      hook.headers as Record<string, string>
    )) {
      if (typeof v === "string") headers[k] = v
    }
  }

  try {
    const response = await fetch(hook.url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })

    const text = await response.text()
    const parsed = text ? safeParseJson(text) : null

    // Record the test delivery
    await prisma.webhookDelivery.create({
      data: {
        webhookId: hook.id,
        status: response.ok ? "success" : "failed",
        statusCode: response.status,
        response: parsed,
        attemptedAt: new Date(),
      },
    })

    return {
      success: response.ok,
      statusCode: response.status,
      error: response.ok ? undefined : `HTTP ${response.status}`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    await prisma.webhookDelivery.create({
      data: {
        webhookId: hook.id,
        status: "failed",
        error: errorMessage,
        attemptedAt: new Date(),
      },
    })

    return { success: false, error: errorMessage }
  }
}

/**
 * Test a webhook with provided data (without saving to database)
 */
export const testWebhookFromData = async (
  url: string,
  event: WebhookEvent,
  options: {
    secret?: string | null
    headers?: Record<string, string> | null
    customPayload?: unknown
  }
): Promise<{ success: boolean; statusCode?: number; error?: string }> => {
  const sampleArticle: ArticlePayload = {
    id: "clxyz123456789",
    title: "Sample Article Title",
    slug: "sample-article-title",
    excerpt: "This is a sample excerpt for testing your webhook integration.",
    author: "John Doe",
    tags: ["test", "webhook", "sample"],
    publishedAt: new Date().toISOString(),
    url: "https://example.com/blog/sample-article-title",
    coverImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=300&fit=crop",
    wordCount: 250,
    characterCount: 1500,
    lineCount: 20,
    readTimeMinutes: 2,
    variantCount: 3,
  }

  const body = buildBody(event, sampleArticle, options.customPayload)

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "simplist-webhooks/1.0",
    "X-Simplist-Test": "true",
  }

  if (options.secret) {
    const signature = createHmac("sha256", options.secret)
      .update(JSON.stringify(body))
      .digest("hex")
    headers["X-Simplist-Signature"] = signature
  }

  if (options.headers && typeof options.headers === "object") {
    for (const [k, v] of Object.entries(options.headers)) {
      if (typeof v === "string") headers[k] = v
    }
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })

    return {
      success: response.ok,
      statusCode: response.status,
      error: response.ok ? undefined : `HTTP ${response.status}`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return { success: false, error: errorMessage }
  }
}

/**
 * Get webhook deliveries with pagination
 */
export const getWebhookDeliveries = async (
  webhookId: string,
  options: { limit?: number; offset?: number } = {}
) => {
  const { limit = 20, offset = 0 } = options

  const [deliveries, total] = await Promise.all([
    prisma.webhookDelivery.findMany({
      where: { webhookId },
      orderBy: { attemptedAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.webhookDelivery.count({
      where: { webhookId },
    }),
  ])

  return { deliveries, total }
}
