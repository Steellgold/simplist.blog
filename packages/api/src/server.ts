import Fastify from 'fastify'

// Environment validation
const envToLogger = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
  production: true,
  test: false,
}

const environment = process.env.NODE_ENV || 'development'
const port = Number(process.env.PORT) || 3001
const host = process.env.HOST || 'localhost'

const createServer = async () => {
  const fastify = Fastify({
    logger: envToLogger[environment as keyof typeof envToLogger] ?? true,
  })

  // Register plugins
  await fastify.register(import('./plugins/env'))
  await fastify.register(import('./plugins/cors'))
  await fastify.register(import('./plugins/helmet'))
  await fastify.register(import('./plugins/rate-limit'))
  await fastify.register(import('./plugins/compression'))
  await fastify.register(import('./plugins/auth'))

  // Register routes
  await fastify.register(import('./routes/articles'), { prefix: '/v1' })
  await fastify.register(import('./routes/projects'), { prefix: '/v1' })

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  // Root route
  fastify.get('/', async () => {
    return {
      name: 'Simplist API',
      version: '1.0.0',
      health: '/health'
    }
  })

  return fastify
}

// Handle shutdown gracefully
const gracefulShutdown = async (signal: string, fastify: any) => {
  console.log(`Received ${signal}, shutting down gracefully`)
  await fastify.close()
  process.exit(0)
}

const main = async () => {
  const fastifyInstance = await createServer()
  
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM', fastifyInstance))
  process.on('SIGINT', () => gracefulShutdown('SIGINT', fastifyInstance))
  
  await fastifyInstance.listen({ port, host })
  fastifyInstance.log.info(`API server listening on http://${host}:${port}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})