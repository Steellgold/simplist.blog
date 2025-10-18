import fp from 'fastify-plugin'
import cors from '@fastify/cors'

export default fp(async function (fastify) {
  const allowedOrigins = (fastify as any).config.ALLOWED_ORIGINS.split(',').map((origin: string) => origin.trim())
  
  await fastify.register(cors, {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
  })
})