import type { ApiKeyWithProject } from "@simplist/db";
import * as db from "@simplist/db";
import { getPlanLimits, type PlanId } from "@simplist/limits";
import fp from "fastify-plugin";

const { prisma, apiKeyCache } = db;

// Helper to check permissions
const checkPermission = (apiKey: any, permission: string): boolean => {
  return apiKey.permissions.includes(permission);
};

declare module "fastify" {
  interface FastifyRequest {
    apiKey?: {
      id: string;
      name: string;
      permissions: string[];
      projectId: string;
      project: {
        id: string;
        name: string;
        slug: string;
        userId: string;
      };
    };
    checkPermission?: (permission: string) => boolean;
  }
}

export default fp(async function (fastify) {
  fastify.addHook("onRequest", async (request, reply) => {
    const apiKeyHeader = request.headers["x-api-key"] as string;

    if (!apiKeyHeader) {
      return reply.code(401).send({
        error: "Unauthorized",
        message: "API key is required. Include it in the X-API-Key header.",
        statusCode: 401,
      });
    }

    try {
      let apiKey = null;

      // Try to get from cache first (if Redis is available)
      try {
        apiKey = await apiKeyCache.get(apiKeyHeader);
        // If cached key exists but doesn't have project info, refetch from DB
        if (apiKey && !apiKey.project) {
          apiKey = null;
        }
      } catch (cacheError) {
        // Cache not available, continue with database lookup
        fastify.log.warn(
          "Redis cache not available, falling back to database only",
        );
      }

      if (!apiKey) {
        // Cache miss or cache not available, fetch from database
        const dbApiKey = (await prisma.apiKey.findFirst({
          where: {
            key: apiKeyHeader,
            status: "active",
            OR: [
              { expiresAt: null },
              {
                expiresAt: {
                  gte: new Date(),
                },
              },
            ],
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

        // Try to cache the API key data (if Redis is available)
        try {
          await apiKeyCache.set(apiKeyHeader, apiKey);
        } catch (cacheError) {
          // Cache not available, that's okay
        }
      }

      // Update last used timestamp (fire and forget)
      prisma.apiKey
        .update({
          where: { id: apiKey.id },
          data: { lastUsedAt: new Date() },
        })
        .catch(() => {
          // Ignore errors for last used timestamp
        });

      // Check API quota BEFORE incrementing
      const now = new Date();
      const project = await prisma.project.findUnique({
        where: { id: apiKey.projectId },
        select: {
          subscriptionTier: true,
          subscriptionExpiresAt: true,
          monthlyApiCalls: true,
          apiCallsResetAt: true,
        },
      });

      if (project) {
        // Determine subscription tier
        const tier =
          project.subscriptionTier === "PRO" &&
          project.subscriptionExpiresAt &&
          project.subscriptionExpiresAt > now
            ? "PRO"
            : "STARTER";

        // Check if we need to reset the counter
        const daysSinceReset = Math.floor(
          (now.getTime() - project.apiCallsResetAt.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        let currentCalls = project.monthlyApiCalls;
        if (daysSinceReset >= 30) {
          // Reset counter (this call will be the first one)
          await prisma.project
            .update({
              where: { id: apiKey.projectId },
              data: {
                monthlyApiCalls: 1,
                apiCallsResetAt: now,
              },
            })
            .catch(() => {});
          currentCalls = 0; // Will become 1 after this request
        }

        // Check quota limits BEFORE allowing the request
        const planLimits = getPlanLimits(tier as PlanId);
        const maxCalls = planLimits.maxApiCallsPerMonth;

        // -1 means unlimited
        if (maxCalls !== -1 && currentCalls >= maxCalls) {
          return reply.code(429).send({
            error: "Rate Limit Exceeded",
            message: `Monthly API call limit exceeded. Your ${tier} plan allows ${maxCalls.toLocaleString()} calls per month. Please upgrade or wait for next billing cycle.`,
            statusCode: 429,
            limit: maxCalls,
            current: currentCalls,
            resetDate: new Date(
              project.apiCallsResetAt.getTime() + 30 * 24 * 60 * 60 * 1000,
            ),
          });
        }

        // Increment project's API call counter AFTER quota check passes
        prisma.project
          .update({
            where: { id: apiKey.projectId },
            data: {
              monthlyApiCalls: { increment: 1 },
            },
          })
          .catch(() => {
            // Ignore errors for API call counter
          });
      }

      // Attach API key info to request
      request.apiKey = apiKey;
      request.checkPermission = (permission: string) =>
        checkPermission(apiKey, permission);
    } catch (error) {
      fastify.log.error(error, "Error validating API key");
      return reply.code(500).send({
        error: "Internal Server Error",
        message: "Failed to validate API key.",
        statusCode: 500,
      });
    }
  });
});
