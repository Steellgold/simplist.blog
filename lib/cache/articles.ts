import { getCurrentUser } from "@/lib/auth-helper"
import { getCachedProjectArticlesByProjectId } from "@/lib/cache/db-queries"
import { prisma } from "@/lib/db"
import { forbidden, redirect } from "next/navigation"

/**
 * Get project articles with caching optimization
 * Uses cached DB queries for better performance
 */
export const getCachedProjectArticles = async (projectId: string) => {
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

  if (!project) forbidden()

  // Use cached query for articles
  const articles = await getCachedProjectArticlesByProjectId(projectId)
  return articles
}