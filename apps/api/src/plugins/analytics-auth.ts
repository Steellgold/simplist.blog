import type { ApiKeyWithProject } from "@simplist/db";
import * as db from "@simplist/db";
import fp from "fastify-plugin";

const { prisma, apiKeyCache } = db;

// Analytics auth plugin - accepts both public and secret keys
export default fp(async function (fastify) {
  fastify.addHook("onRequest", async (request, reply) => {
    const apiKeyHeader = request.headers["x-api-key"] as string;

    if (!apiKeyHeader) {
      return reply.code(401).send({
        error: "Unauthorized",
        message:
          "API key is required for analytics tracking. Include it in the X-API-Key header.",
        statusCode: 401,
      });
    }

    try {
      let apiKey = null;

      // Try to get from cache first
      try {
        apiKey = await apiKeyCache.get(apiKeyHeader);
        // If cached key exists but doesn't have project info, refetch from DB
        if (apiKey && !apiKey.project) {
          apiKey = null;
        }
      } catch {
        fastify.log.warn(
          "Redis cache not available, falling back to database only",
        );
      }

      if (!apiKey) {
        // Cache miss, fetch from database
        const dbApiKey = (await prisma.apiKey.findFirst({
          where: {
            key: apiKeyHeader,
            status: "active",
            OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
          },
          include: {
            project: {
              select: {
                id: true,
                name: true,
                slug: true,
                userId: true,
              },
            },
          },
        })) as ApiKeyWithProject | null;

        if (!dbApiKey || !dbApiKey.project) {
          return reply.code(401).send({
            error: "Unauthorized",
            message: "Invalid or expired API key.",
            statusCode: 401,
          });
        }

        // Check if key has analytics permission
        if (
          !dbApiKey.permissions.includes("analytics") &&
          !dbApiKey.permissions.includes("read")
        ) {
          return reply.code(403).send({
            error: "Forbidden",
            message: "API key does not have analytics permissions.",
            statusCode: 403,
          });
        }

        // Prepare API key data
        apiKey = {
          id: dbApiKey.id,
          name: dbApiKey.name,
          permissions: dbApiKey.permissions,
          projectId: dbApiKey.projectId,
          project: {
            id: dbApiKey.project.id,
            name: dbApiKey.project.name,
            slug: dbApiKey.project.slug,
            userId: dbApiKey.project.userId,
          },
        };

        // Cache it
        try {
          await apiKeyCache.set(apiKeyHeader, apiKey);
        } catch {
          // Cache not available, that's okay
        }
      }

      // Update last used timestamp for analytics tracking (fire and forget)
      prisma.apiKey
        .update({
          where: { id: apiKey.id },
          data: { lastUsedAt: new Date() },
        })
        .catch(() => {
          // Ignore errors
        });

      // Attach API key info to request
      request.apiKey = apiKey;
      request.checkPermission = (permission: string) =>
        apiKey.permissions.includes(permission);
    } catch (error) {
      fastify.log.error(error, "Error validating API key for analytics");
      return reply.code(500).send({
        error: "Internal Server Error",
        message: "Failed to validate API key.",
        statusCode: 500,
      });
    }
  });
});
