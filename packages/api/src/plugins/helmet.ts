import helmet from '@fastify/helmet'
import fp from 'fastify-plugin'

export default fp(async function (fastify) {
  await fastify.register(helmet, {
    contentSecurityPolicy: false, // Disable CSP for API
    crossOriginEmbedderPolicy: false // Allow embedding in external sites
  })
})