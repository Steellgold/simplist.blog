import * as db from '@simplist/db'
import fp from 'fastify-plugin'

const { prisma } = db

export default fp(async function (fastify) {
  // Hook to check project-specific CORS after auth
  fastify.addHook('onRequest', async (request, reply) => {
    // Skip CORS check for non-browser requests (no origin header)
    const origin = request.headers.origin
    if (!origin) return

    // Skip if already allowed by global CORS
    const allowAll = String((fastify as any).config.ALLOW_ALL_ORIGINS || 'false').toLowerCase() === 'true'
    if (allowAll) return

    // Skip localhost
    if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
      return
    }

    try {
      const apiKeyHeader = request.headers['x-api-key'] as string
      if (!apiKeyHeader) return

      const apiKey = await prisma.apiKey.findFirst({
        where: { key: apiKeyHeader, status: 'active' },
        include: { project: true }
      })

      if (apiKey?.project?.allowedOrigins?.length && apiKey.project.allowedOrigins.length > 0) {
        const isAllowed = apiKey.project.allowedOrigins.some((allowedOrigin: string) => {
          // Exact match
          if (allowedOrigin === origin) return true
          
          // Wildcard match for subdomains (e.g., https://*.example.com)
          if (allowedOrigin.includes('https://*.')) {
            const wildcardDomain = allowedOrigin.replace('https://*.', '')
            const originWithoutProtocol = origin.replace(/^https?:\/\//, '')
            // Check if origin is a subdomain of the wildcard domain
            return originWithoutProtocol.endsWith(`.${wildcardDomain}`) || originWithoutProtocol === wildcardDomain
          }
          
          return false
        })
        
        if (!isAllowed) {
          return reply.code(403).send({
            error: 'Forbidden',
            message: `Origin ${origin} is not allowed for this project`,
            statusCode: 403
          })
        }
      }
    } catch (error) {
      fastify.log.warn('Failed to check project-specific CORS')
    }
  })
})
