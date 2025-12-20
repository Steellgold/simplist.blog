import * as db from "@simplist/db";
import fp from "fastify-plugin";

const { prisma } = db;

export default fp(async function (fastify) {
  // Hook to check project-specific CORS after auth
  fastify.addHook("onRequest", async (request, reply) => {
    // Skip preflight OPTIONS requests - they're handled by the main CORS plugin
    if (request.method === "OPTIONS") return;

    // Skip CORS check for non-browser requests (no origin header)
    const origin = request.headers.origin;
    if (!origin) return;

    // Skip if already allowed by global CORS
    const allowAll =
      String(
        (fastify as any).config.ALLOW_ALL_ORIGINS || "false",
      ).toLowerCase() === "true";
    if (allowAll) return;

    // Skip localhost
    if (
      origin.startsWith("http://localhost:") ||
      origin.startsWith("https://localhost:")
    ) {
      return;
    }

    try {
      const apiKeyHeader = request.headers["x-api-key"] as string;
      if (!apiKeyHeader) return;

      const apiKey = await prisma.apiKey.findFirst({
        where: { key: apiKeyHeader, status: "active" },
        include: { project: true },
      });

      if (
        apiKey?.project?.allowedOrigins?.length &&
        apiKey.project.allowedOrigins.length > 0
      ) {
        fastify.log.info(
          { allowedOrigins: apiKey.project.allowedOrigins, origin },
          "Checking project-specific CORS",
        );

        const isAllowed = apiKey.project.allowedOrigins.some(
          (allowedOrigin: string) => {
            const originWithoutProtocol = origin.replace(/^https?:\/\//, "");
            const normalizedAllowed = allowedOrigin.replace(/^https?:\/\//, "");

            // Exact match on full origin (including protocol) if stored that way
            if (allowedOrigin === origin) {
              fastify.log.info({ allowedOrigin, origin }, "Exact match found");
              return true;
            }

            // Exact match on hostname when stored without protocol
            if (!normalizedAllowed.includes("*.")) {
              const hostnameMatch = originWithoutProtocol === normalizedAllowed;
              if (hostnameMatch) {
                fastify.log.info(
                  {
                    allowedOrigin,
                    origin,
                    normalizedAllowed,
                    originWithoutProtocol,
                  },
                  "Hostname match found",
                );
              }
              return hostnameMatch;
            }

            // Wildcard match for subdomains (e.g., https://*.example.com or *.example.com)
            if (normalizedAllowed.includes("*.")) {
              let wildcardDomain = normalizedAllowed;

              if (wildcardDomain.startsWith("*.")) {
                wildcardDomain = wildcardDomain.replace("*.", "");
              }

              const matches =
                originWithoutProtocol.endsWith(`.${wildcardDomain}`) ||
                originWithoutProtocol === wildcardDomain;

              fastify.log.info(
                {
                  allowedOrigin,
                  wildcardDomain,
                  origin,
                  originWithoutProtocol,
                  matches,
                },
                "Wildcard match check",
              );

              return matches;
            }

            return false;
          },
        );

        if (!isAllowed) {
          return reply.code(403).send({
            error: "Forbidden",
            message: `Origin ${origin} is not allowed for this project`,
            statusCode: 403,
          });
        }
      }
    } catch (error) {
      fastify.log.warn("Failed to check project-specific CORS");
    }
  });
});
