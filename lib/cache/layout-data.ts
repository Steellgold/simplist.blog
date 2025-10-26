import { getCurrentUser } from "@/lib/auth-helper"
import { getCachedUserWithProjectsById, getCachedProjectWithStatsBySlugAndUserId } from "@/lib/cache/db-queries"
import { redirect } from "next/navigation"

/**
 * Get layout data (user + projects) with optimized caching
 * This reduces multiple DB calls in the layout to a single cached query
 */
export const getLayoutData = async () => {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  // Get cached user with projects in one query
  const userWithProjects = await getCachedUserWithProjectsById(user.id)
  if (!userWithProjects) redirect("/auth/login")

  return {
    user: {
      id: userWithProjects.id,
      name: userWithProjects.name,
      email: userWithProjects.email,
      image: userWithProjects.image,
    },
    projects: userWithProjects.projects,
  }
}

/**
 * Get project with articles count using cached queries
 * Used for pages that need project info + article stats
 */
export const getProjectWithStats = async (projectSlug: string) => {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const project = await getCachedProjectWithStatsBySlugAndUserId(projectSlug, user.id)
  return project
}