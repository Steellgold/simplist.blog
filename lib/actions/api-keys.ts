"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUser } from "../auth-helper"
import { prisma } from "../db"
import { createApiKeySchema } from "../validations/api-key"

// Generate a random API key
function generateApiKey(): string {
  const prefix = "sk"
  const randomBytes = crypto.getRandomValues(new Uint8Array(32))
  const key = Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
  return `${prefix}_${key}`
}

export async function getProjectApiKeys(projectId: string) {
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
      lastUsedAt: true,
      expiresAt: true,
      status: true,
      createdAt: true,
    },
  })

  return apiKeys
}

export async function createApiKey(projectId: string, input: { name: string; expiresInDays?: number | null }) {
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

  // Validate input
  const validatedData = createApiKeySchema.parse(input)

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
      projectId: projectId,
      expiresAt: expiresAt,
      status: "active",
    },
  })

  revalidatePath("/api-keys")
  return newApiKey
}

export async function deleteApiKey(apiKeyId: string) {
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

  if (!apiKey || apiKey.project.userId !== user.id) {
    throw new Error("API key not found or you don't have permission")
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
  })

  revalidatePath("/api-keys")
}
