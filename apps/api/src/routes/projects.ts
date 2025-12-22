import * as db from "@simplist/db";
import { FastifyPluginAsync } from "fastify";
import { formatProject } from "../utils/format";

const { prisma } = db;

const projectsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /project - Get project info and stats
  fastify.get("/project", async (request, reply) => {
    // Check if key has read permissions
    if (!request.checkPermission!("read")) {
      return reply.code(403).send({
        error: "Forbidden",
        message: "API key does not have read permissions.",
        statusCode: 403,
      });
    }

    const projectId = request.apiKey!.projectId;

    try {
      // Get project details
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!project) {
        return reply.code(404).send({
          error: "Not Found",
          message: "Project not found",
          statusCode: 404,
        });
      }

      // Get article statistics
      const [totalArticles, publishedArticles, totalViews] = await Promise.all([
        // Total articles (excluding deleted)
        prisma.article.count({
          where: {
            projectId,
            status: { not: "deleted" },
          },
        }),
        // Published articles
        prisma.article.count({
          where: {
            projectId,
            published: true,
            status: "published",
          },
        }),
        // Total views across all articles
        prisma.article.aggregate({
          where: {
            projectId,
            status: { not: "deleted" },
          },
          _sum: {
            viewCount: true,
          },
        }),
      ]);

      const projectInfo = {
        project: {
          ...project,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
        },
        stats: {
          totalArticles,
          publishedArticles,
          totalViews: totalViews._sum.viewCount || 0,
        },
      };

      return {
        data: projectInfo,
      };
    } catch (error) {
      fastify.log.error(error, "Error fetching project info");
      return reply.code(500).send({
        error: "Internal Server Error",
        message: "Failed to fetch project information",
        statusCode: 500,
      });
    }
  });
};

export default projectsRoutes;
