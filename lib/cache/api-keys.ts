import { getCurrentUser } from "@/lib/auth-helper"
import { getCachedProjectApiKeysByProjectId } from "@/lib/cache/db-queries"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"

/**
 * Get project API keys with caching optimization
 * Uses cached DB queries for better performance
 */
export const getCachedProjectApiKeys = async (projectId: string) => {
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

  // Use cached query for API keys
  const apiKeys = await getCachedProjectApiKeysByProjectId(projectId)
  return apiKeys
}