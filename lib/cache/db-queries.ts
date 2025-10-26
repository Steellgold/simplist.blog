"use cache"

import { prisma } from "@/lib/db"

/**
 * Get user projects by user ID (cached)
 */
export const getCachedUserProjectsByUserId = async (userId: string) => {
  const projects = await prisma.project.findMany({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      timezone: true,
      defaultLanguage: true,
      createdAt: true,
      updatedAt: true,
      subscriptionTier: true,
      subscriptionExpiresAt: true,
      stripeCustomerId: true,
      allowedOrigins: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return projects
}

/**
 * Get project articles by project ID (cached)
 */
export const getCachedProjectArticlesByProjectId = async (projectId: string) => {
  const articles = await prisma.article.findMany({
    where: {
      projectId,
      status: {
        not: "deleted", // Exclude soft-deleted articles
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return articles
}

/**
 * Get project API keys by project ID (cached)
 */
export const getCachedProjectApiKeysByProjectId = async (projectId: string) => {
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
  })

  return apiKeys
}

/**
 * Get user with projects in one query (cached)
 */
export const getCachedUserWithProjectsById = async (userId: string) => {
  const userWithProjects = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      projects: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          timezone: true,
          defaultLanguage: true,
          createdAt: true,
          updatedAt: true,
          subscriptionTier: true,
          subscriptionExpiresAt: true,
          stripeCustomerId: true,
          allowedOrigins: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  return userWithProjects
}

/**
 * Get project with stats by slug and user ID (cached)
 */
export const getCachedProjectWithStatsBySlugAndUserId = async (projectSlug: string, userId: string) => {
  const project = await prisma.project.findFirst({
    where: {
      slug: projectSlug,
      userId: userId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      subscriptionTier: true,
      _count: {
        select: {
          articles: {
            where: {
              status: {
                not: "deleted",
              },
            },
          },
          apiKeys: {
            where: {
              status: "active",
            },
          },
        },
      },
    },
  })

  return project
}