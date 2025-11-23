import rateLimit from "@fastify/rate-limit"
import fp from "fastify-plugin"

export default fp(async function (fastify) {
  await fastify.register(rateLimit, {
    max: 100, // 100 requests
    timeWindow: "1 minute", // per minute
    keyGenerator: (request) => {
      // Use API key for rate limiting if available, otherwise IP
      const apiKey = request.headers["x-api-key"] as string
      return apiKey || request.ip
    },
    errorResponseBuilder: () => {
      return {
        error: "Rate limit exceeded",
        message: "Too many requests. Please try again later.",
        statusCode: 429
      }
    }
  })
})