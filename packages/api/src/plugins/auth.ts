import * as db from "@simplist/db"
import fp from "fastify-plugin"

const { prisma, apiKeyCache } = db

// Helper to check permissions
const checkPermission = (apiKey: any, permission: string): boolean => {
  return apiKey.permissions.includes(permission)
}

declare module "fastify" {
  interface FastifyRequest {
    apiKey?: {
      id: string
      name: string
      type: string
      permissions: string[]
      projectId: string
      project: {
        id: string
        name: string
        slug: string
        userId: string
      }
    }
    checkPermission?: (permission: string) => boolean
  }
}

export default fp(async function (fastify) {
  fastify.addHook("onRequest", async (request, reply) => {
    const apiKeyHeader = request.headers["x-api-key"] as string
    
    if (!apiKeyHeader) {
      return reply.code(401).send({
        error: "Unauthorized",
        message: "API key is required. Include it in the X-API-Key header.",
        statusCode: 401
      })
    }

    try {
      let apiKey = null

      // Try to get from cache first (if Redis is available)
      try {
        apiKey = await apiKeyCache.get(apiKeyHeader)
      } catch (cacheError) {
        // Cache not available, continue with database lookup
        fastify.log.warn("Redis cache not available, falling back to database only")
      }
      
      if (!apiKey) {
        // Cache miss or cache not available, fetch from database
        const dbApiKey = await prisma.apiKey.findFirst({
          where: {
            key: apiKeyHeader,
            status: "active",
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: new Date() } }
            ]
          },
          include: {
            project: {
              select: {
                id: true,
                name: true,
                slug: true,
                userId: true
              }
            }
          }
        })

        if (!dbApiKey) {
          return reply.code(401).send({
            error: "Unauthorized",
            message: "Invalid or expired API key.",
            statusCode: 401
          })
        }

        // Prepare API key data
        apiKey = {
          id: dbApiKey.id,
          name: dbApiKey.name,
          type: dbApiKey.type,
          permissions: dbApiKey.permissions,
          projectId: dbApiKey.projectId,
          project: dbApiKey.project
        }
        
        // Try to cache the API key data (if Redis is available)
        try {
          await apiKeyCache.set(apiKeyHeader, apiKey)
        } catch (cacheError) {
          // Cache not available, that's okay
        }
      }

      // Update last used timestamp and increment API call counter (fire and forget)
      prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() }
      }).catch(() => {
        // Ignore errors for last used timestamp
      })

      // Increment project's API call counter (fire and forget)
      prisma.project.update({
        where: { id: apiKey.projectId },
        data: {
          monthlyApiCalls: { increment: 1 }
        }
      }).catch(() => {
        // Ignore errors for API call counter
      })

      // Check API quota (this is checked but not blocking, for tracking purposes)
      const now = new Date()
      const project = await prisma.project.findUnique({
        where: { id: apiKey.projectId },
        select: {
          subscriptionTier: true,
          subscriptionExpiresAt: true,
          monthlyApiCalls: true,
          apiCallsResetAt: true
        }
      })

      if (project) {
        // Determine subscription tier
        const tier = project.subscriptionTier === "pro" &&
                     project.subscriptionExpiresAt &&
                     project.subscriptionExpiresAt > now
          ? "pro"
          : "free"

        // Check if we need to reset the counter
        const daysSinceReset = Math.floor(
          (now.getTime() - project.apiCallsResetAt.getTime()) / (1000 * 60 * 60 * 24)
        )

        let currentCalls = project.monthlyApiCalls
        if (daysSinceReset >= 30) {
          // Reset counter
          await prisma.project.update({
            where: { id: apiKey.projectId },
            data: {
              monthlyApiCalls: 1, // Already counting this call
              apiCallsResetAt: now
            }
          }).catch(() => {})
          currentCalls = 1
        }

        // Check quota limits
        const maxCalls = tier === "pro" ? 500_000 : 1_000
        if (currentCalls > maxCalls) {
          return reply.code(429).send({
            error: "Rate Limit Exceeded",
            message: `Monthly API call limit exceeded. Your ${tier} plan allows ${maxCalls.toLocaleString()} calls per month. Please upgrade or wait for next billing cycle.`,
            statusCode: 429,
            limit: maxCalls,
            current: currentCalls,
            resetDate: new Date(project.apiCallsResetAt.getTime() + 30 * 24 * 60 * 60 * 1000)
          })
        }
      }

      // Attach API key info to request
      request.apiKey = apiKey
      request.checkPermission = (permission: string) => checkPermission(apiKey, permission)

    } catch (error) {
      fastify.log.error(error, "Error validating API key")
      return reply.code(500).send({
        error: "Internal Server Error",
        message: "Failed to validate API key.",
        statusCode: 500
      })
    }
  })
})