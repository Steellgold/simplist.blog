import cors from '@fastify/cors'
import fp from 'fastify-plugin'

export default fp(async function (fastify) {
  const allowAll = String((fastify as any).config.ALLOW_ALL_ORIGINS || 'false').toLowerCase() === 'true' || (fastify as any).config.ALLOWED_ORIGINS === '*'
  const allowedOrigins = (fastify as any).config.ALLOWED_ORIGINS.split(',').map((origin: string) => origin.trim())
  const suffixesRaw = ((fastify as any).config.ALLOWED_ORIGIN_SUFFIXES || '') as string
  const allowedSuffixes = suffixesRaw
    .split(',')
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0)
  
  // Custom origin function to allow all localhost in development
  const originFunction = (origin: string | undefined, callback: (err: Error | null, allow: boolean) => void) => {
    if (allowAll) return callback(null, true)

    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true)

    // Allow all localhost requests (useful for development and testing)
    if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
      return callback(null, true)
    }

    // Check against configured allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    // Allow if origin ends with any configured suffix (e.g., .vercel.app)
    if (allowedSuffixes.some((suffix: string) => origin.endsWith(suffix))) {
      return callback(null, true)
    }

    // Allow all origins by default - project-cors plugin will handle project-specific validation
    // This allows CORS preflight requests to pass, then project-cors validates the actual requests
    return callback(null, true)
  }
  
  await fastify.register(cors, {
    origin: originFunction,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
  })
})