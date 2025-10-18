import fp from 'fastify-plugin'
import * as db from '@simplist/db'

const { prisma, apiKeyCache } = db

declare module 'fastify' {
  interface FastifyRequest {
    apiKey?: {
      id: string
      name: string
      projectId: string
      project: {
        id: string
        name: string
        slug: string
        userId: string
      }
    }
  }
}

export default fp(async function (fastify) {
  fastify.addHook('onRequest', async (request, reply) => {
    const apiKeyHeader = request.headers['x-api-key'] as string
    
    if (!apiKeyHeader) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'API key is required. Include it in the X-API-Key header.',
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
        fastify.log.warn('Redis cache not available, falling back to database only')
      }
      
      if (!apiKey) {
        // Cache miss or cache not available, fetch from database
        const dbApiKey = await prisma.apiKey.findFirst({
          where: {
            key: apiKeyHeader,
            status: 'active',
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
            error: 'Unauthorized',
            message: 'Invalid or expired API key.',
            statusCode: 401
          })
        }

        // Prepare API key data
        apiKey = {
          id: dbApiKey.id,
          name: dbApiKey.name,
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

      // Update last used timestamp (fire and forget)
      prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() }
      }).catch(() => {
        // Ignore errors for last used timestamp
      })

      // Attach API key info to request
      request.apiKey = apiKey

    } catch (error) {
      fastify.log.error(error, 'Error validating API key')
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to validate API key.',
        statusCode: 500
      })
    }
  })
})