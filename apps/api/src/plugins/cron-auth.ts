import fp from "fastify-plugin";

/**
 * Cron authentication plugin
 * Validates x-cron-secret header against CRON_SECRET environment variable
 */
export default fp(async function (fastify) {
  fastify.addHook("onRequest", async (request, reply) => {
    const cronSecret = request.headers["x-cron-secret"] as string;
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || cronSecret !== expectedSecret) {
      fastify.log.warn("Unauthorized cron request");
      return reply.code(401).send({
        error: "Unauthorized",
        message: "Invalid cron secret",
        statusCode: 401,
      });
    }
  });
});
