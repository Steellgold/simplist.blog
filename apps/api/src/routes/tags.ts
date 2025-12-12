import * as db from "@simplist/db"
import { FastifyPluginAsync } from "fastify"
import { formatTag } from "../utils/format"

const { prisma } = db

const tagsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /tags - Liste des tags avec metadata
  fastify.get("/tags", async (request, reply) => {
    const projectId = request.apiKey!.projectId

    try {
      const tags = await prisma.tag.findMany({
        where: { projectId },
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { articles: true } }
        },
        orderBy: { name: 'asc' }
      })

      return {
        data: tags.map(formatTag),
        meta: { total: tags.length }
      }
    } catch (error) {
      fastify.log.error(error, "Error fetching tags")
      return reply.status(500 as any).send({
        error: "Internal Server Error",
        message: "Failed to fetch tags",
        statusCode: 500
      })
    }
  })

  // GET /tags/:name - Tag spécifique
  fastify.get("/tags/:name", async (request, reply) => {
    const { name } = request.params as { name: string }
    const projectId = request.apiKey!.projectId

    try {
      const tag = await prisma.tag.findUnique({
        where: {
          projectId_name: {
            projectId,
            name: decodeURIComponent(name)
          }
        },
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { articles: true } }
        }
      })

      if (!tag) {
        return reply.status(404 as any).send({
          error: "Not Found",
          message: "Tag not found",
          statusCode: 404
        })
      }

      return { data: formatTag(tag) }
    } catch (error) {
      fastify.log.error(error, "Error fetching tag")
      return reply.status(500 as any).send({
        error: "Internal Server Error",
        message: "Failed to fetch tag",
        statusCode: 500
      })
    }
  })
}

export default tagsRoutes
