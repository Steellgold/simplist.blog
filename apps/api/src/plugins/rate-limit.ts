import rateLimit from "@fastify/rate-limit";
import fp from "fastify-plugin";

export default fp(async function (fastify) {
  // Use higher limits in development instead of disabling completely
  const isDev = process.env.NODE_ENV === "development";

  await fastify.register(rateLimit, {
    max: isDev ? 1000 : 100, // 1000 req/min in dev, 100 req/min in prod
    timeWindow: "1 minute",
    keyGenerator: (request) => {
      // Use API key for rate limiting if available, otherwise IP
      const apiKey = request.headers["x-api-key"] as string;
      return apiKey || request.ip;
    },
    errorResponseBuilder: () => {
      return {
        error: "Rate limit exceeded",
        message: "Too many requests. Please try again later.",
        statusCode: 429,
      };
    },
  });

  if (isDev) {
    fastify.log.info(
      "Rate limiting enabled with higher limits for development (1000 req/min)",
    );
  }
});
