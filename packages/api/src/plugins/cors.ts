import cors from '@fastify/cors'
import fp from 'fastify-plugin'

export default fp(async function (fastify) {
  const allowedOrigins = (fastify as any).config.ALLOWED_ORIGINS.split(',').map((origin: string) => origin.trim())
  
  // Custom origin function to allow all localhost in development
  const originFunction = (origin: string | undefined, callback: (err: Error | null, allow: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true)
    
    // Allow all localhost requests (useful for development and testing)
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true)
    }
    
    // Check against configured allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    
    // Reject all others
    return callback(new Error('Not allowed by CORS'), false)
  }
  
  await fastify.register(cors, {
    origin: originFunction,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
  })
})