"use server"

import { getCurrentUser } from "@/lib/auth-helper"
import { apiKeyCache, prisma } from "@/lib/db"
import { checkApiKeyQuota, checkFeatureAccess } from "@/lib/subscription/quota-check"
import { createApiKeySchema } from "@/lib/validations/api-key"
import { revalidatePath } from "next/cache"
import { forbidden, notFound, redirect } from "next/navigation"

// Generate a random API key
const generateApiKey = (type: "secret" | "public" = "secret"): string => {
  const prefix = type === "secret" ? "sk" : "pk"
  const randomBytes = crypto.getRandomValues(new Uint8Array(32))
  const key = Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
  return `${prefix}_${key}`
}

export const getProjectApiKeys = async (projectId: string) => {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verify the project belongs to the user
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: user.id,
    },
  })

  if (!project) {
    throw new Error("Project not found or you don't have permission")
  }

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
      type: true,
      permissions: true,
      lastUsedAt: true,
      expiresAt: true,
      status: true,
      createdAt: true,
    },
    cacheStrategy: { ttl: 60 },
  })

  return apiKeys
}

export const createApiKey = async (projectId: string, input: { name: string; type?: "secret" | "public"; expiresInDays?: number | null }) => {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verify the project belongs to the user
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: user.id,
    },
  })

  if (!project) return notFound();

  // Check API key quota
  const quotaCheck = await checkApiKeyQuota(user.id, projectId);
  if (!quotaCheck.allowed) forbidden();

  // Validate input
  const validatedData = createApiKeySchema.parse(input)

  // Check if custom expiration is allowed (Pro feature)
  if (validatedData.expiresInDays && validatedData.expiresInDays > 0) {
    const hasCustomExpiration = await checkFeatureAccess(user.id, projectId, "bulkOperations");
    if (!hasCustomExpiration) forbidden();
  }

  // Generate unique API key
  const apiKey = generateApiKey(validatedData.type)

  // Determine permissions based on key type
  // Secret keys (sk_) get "read" permission for articles & project data
  // Public keys (pk_) get "analytics" permission for tracking only
  const permissions = validatedData.type === "public" ? ["analytics"] : ["read"]

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
      type: validatedData.type,
      permissions: permissions,
      projectId: projectId,
      expiresAt: expiresAt,
      status: "active",
    },
  })

  // Invalidate cache for the new API key (fire and forget)
  apiKeyCache.invalidate(apiKey).catch(() => {
    // Ignore cache invalidation errors
  })

  revalidatePath(`/${project.slug}`, "layout")
  revalidatePath(`/${project.slug}/api-keys`, "page")
  return newApiKey
}

export const deleteApiKey = async (apiKeyId: string) => {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verify the API key belongs to a project owned by the user
  const apiKey = await prisma.apiKey.findFirst({
    where: {
      id: apiKeyId,
      status: "active", // Only allow deleting active keys
    },
    include: {
      project: true,
    },
  })

  if (!apiKey || apiKey.project.userId !== user.id) forbidden()

  // Soft delete: update status and set deletedAt
  await prisma.apiKey.update({
    where: {
      id: apiKeyId,
    },
    data: {
      status: "deleted",
      deletedAt: new Date(),
    },
  })

  // Invalidate cache for the deleted API key (fire and forget)
  apiKeyCache.invalidate(apiKey.key).catch(() => {
    // Ignore cache invalidation errors
  })

  revalidatePath(`/${apiKey.project.slug}`, "layout")
  revalidatePath(`/${apiKey.project.slug}/api-keys`, "page")
}
