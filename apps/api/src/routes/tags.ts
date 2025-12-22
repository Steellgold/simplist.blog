import { parseQuery } from "@/types/fastify";
import type { TagsListQuery } from "@/types/requests";
import * as db from "@simplist/db";
import { FastifyPluginAsync } from "fastify";
import { formatTag } from "../utils/format";

const { prisma } = db;

const tagsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /tags - List tags with metadata
  fastify.get("/tags", async (request, reply) => {
    // Check if key has read permissions
    if (!request.checkPermission!("read")) {
      return reply.code(403).send({
        error: "Forbidden",
        message: "API key does not have read permissions.",
        statusCode: 403,
      });
    }

    const projectId = request.apiKey!.projectId;
    const query = parseQuery<TagsListQuery>(request);

    // Parse query parameters
    const sort = query.sort || "name";
    const order = query.order || "asc";
    const limit = query.limit ? Number(query.limit) : undefined;

    try {
      // Build orderBy based on sort parameter
      let orderBy: Record<string, unknown>;
      if (sort === "articleCount") {
        orderBy = { articles: { _count: order } };
      } else if (
        sort === "name" ||
        sort === "createdAt" ||
        sort === "updatedAt"
      ) {
        orderBy = { [sort]: order };
      } else {
        orderBy = { name: "asc" };
      }

      const tags = await prisma.tag.findMany({
        where: { projectId },
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { articles: true } },
        },
        orderBy,
        ...(limit ? { take: limit } : {}),
      });

      return {
        data: tags.map(formatTag),
        meta: { total: tags.length },
      };
    } catch (error) {
      fastify.log.error(error, "Error fetching tags");
      return reply.code(500).send({
        error: "Internal Server Error",
        message: "Failed to fetch tags",
        statusCode: 500,
      });
    }
  });

  // GET /tags/:name - Specific tag
  fastify.get("/tags/:name", async (request, reply) => {
    // Check if key has read permissions
    if (!request.checkPermission!("read")) {
      return reply.code(403).send({
        error: "Forbidden",
        message: "API key does not have read permissions.",
        statusCode: 403,
      });
    }

    const { name } = request.params as { name: string };
    const projectId = request.apiKey!.projectId;

    try {
      const tag = await prisma.tag.findUnique({
        where: {
          projectId_name: {
            projectId,
            name: decodeURIComponent(name),
          },
        },
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { articles: true } },
        },
      });

      if (!tag) {
        return reply.code(404).send({
          error: "Not Found",
          message: "Tag not found",
          statusCode: 404,
        });
      }

      return { data: formatTag(tag) };
    } catch (error) {
      fastify.log.error(error, "Error fetching tag");
      return reply.code(500).send({
        error: "Internal Server Error",
        message: "Failed to fetch tag",
        statusCode: 500,
      });
    }
  });
};

export default tagsRoutes;
