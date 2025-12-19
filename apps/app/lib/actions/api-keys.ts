"use server"

import { requirePermission } from "@/lib/auth/permissions"
import { checkFeatureAccess } from "@/lib/subscription/quota-check"
import { createApiKeySchema } from "@/lib/validations/api-key"
import { apiKeyCache, prisma } from "@simplist/db"
import { revalidatePath } from "next/cache"

// Generate a random API key
const generateApiKey = (): string => {
  const prefix = "prj"
  const randomBytes = crypto.getRandomValues(new Uint8Array(32))
  const key = Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
  return `${prefix}_${key}`
}

export const getProjectApiKeys = async (projectId: string) => {
  await requirePermission(projectId, "canManageApiKeys");

  const apiKeys = await prisma.apiKey.findMany({
    where: {
      projectId: projectId,
      status: "active", // Only return active keys
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      key: true,
      permissions: true,
      lastUsedAt: true,
      expiresAt: true,
      status: true,
      createdAt: true,
    }
  });

  return apiKeys;
}

export const createApiKey = async (projectId: string, input: { name: string; permissions: string[]; expiresInDays?: number | null }) => {
  const { user } = await requirePermission(projectId, "canManageApiKeys");

  // Get project for slug (needed for revalidatePath)
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { slug: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Validate input
  const validatedData = createApiKeySchema.parse(input);

  // Check if custom expiration is allowed (Pro feature)
  if (validatedData.expiresInDays && validatedData.expiresInDays > 0) {
    const hasCustomExpiration = await checkFeatureAccess(projectId, "bulkOperations");
    if (!hasCustomExpiration) {
      throw new Error("Custom expiration is a Pro feature");
    }
  }

  // Generate unique API key
  const apiKey = generateApiKey()

  // Calculate expiration date if provided
  let expiresAt: Date | null = null
  if (validatedData.expiresInDays && validatedData.expiresInDays > 0) {
    expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + validatedData.expiresInDays)
  }

  const newApiKey = await prisma.apiKey.create({
    data: {
      name: validatedData.name,
      key: apiKey,
      permissions: validatedData.permissions,
      projectId: projectId,
      expiresAt: expiresAt,
      status: "active",
    },
  })

  // Invalidate cache for the new API key (fire and forget)
  apiKeyCache.invalidate(apiKey).catch(() => {
    // Ignore cache invalidation errors
  })

  revalidatePath(`/${project.slug}`, "layout");
  revalidatePath(`/${project.slug}/api-keys`, "page");
  return newApiKey;
}

export const deleteApiKey = async (apiKeyId: string) => {
  // Get the API key first to find its project
  const apiKey = await prisma.apiKey.findUnique({
    where: { id: apiKeyId },
    select: {
      id: true,
      key: true,
      projectId: true,
      status: true,
    },
  });

  if (!apiKey) {
    throw new Error("API key not found");
  }

  if (apiKey.status !== "active") {
    throw new Error("Only active API keys can be deleted");
  }

  // Check permission
  await requirePermission(apiKey.projectId, "canManageApiKeys");

  // Get project for revalidation
  const project = await prisma.project.findUnique({
    where: { id: apiKey.projectId },
    select: { slug: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Soft delete: update status and set deletedAt
  await prisma.apiKey.update({
    where: {
      id: apiKeyId,
    },
    data: {
      status: "deleted",
      deletedAt: new Date(),
    },
  });

  // Invalidate cache for the deleted API key (fire and forget)
  apiKeyCache.invalidate(apiKey.key).catch(() => {
    // Ignore cache invalidation errors
  });

  revalidatePath(`/${project.slug}`, "layout");
  revalidatePath(`/${project.slug}/api-keys`, "page");
}
