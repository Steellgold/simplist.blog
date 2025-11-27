import * as db from "@simplist/db"
import { FastifyPluginAsync } from "fastify"

const { prisma } = db

const cronRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /cron/publish-scheduled - Publish scheduled articles
  fastify.post("/cron/publish-scheduled", {
    schema: {
      headers: {
        type: "object",
        properties: {
          "x-cron-secret": { type: "string" }
        },
        required: ["x-cron-secret"]
      }
    }
  }, async (request, reply) => {
    const cronSecret = request.headers["x-cron-secret"] as string
    const expectedSecret = process.env.CRON_SECRET

    // Verify cron secret
    if (!expectedSecret || cronSecret !== expectedSecret) {
      fastify.log.warn("Unauthorized cron request")
      return reply.status(401).send({
        error: "Unauthorized",
        message: "Invalid cron secret",
        statusCode: 401
      })
    }

    try {
      const now = new Date()
      fastify.log.info(`Starting scheduled article publication check at ${now.toISOString()}`)

      // Find all articles that are scheduled and ready to publish
      const scheduledArticles = await prisma.article.findMany({
        where: {
          status: "scheduled",
          scheduledPublishAt: {
            lte: now
          }
        },
        include: {
          project: true
        }
      })

      fastify.log.info(`Found ${scheduledArticles.length} articles ready for publication`)

      const results = {
        processed: 0,
        published: 0,
        errors: [] as string[]
      }

      // Process each scheduled article
      for (const article of scheduledArticles) {
        try {
          results.processed++

          // Update article to published status
          await prisma.article.update({
            where: { id: article.id },
            data: {
              status: "published",
              published: true,
              publishedAt: article.scheduledPublishAt || now,
              scheduledPublishAt: null // Clear the scheduled date
            }
          })

          results.published++
          fastify.log.info(`Published article: ${article.title} (${article.id})`)

        } catch (error) {
          const errorMsg = `Failed to publish article ${article.id}: ${error instanceof Error ? error.message : "Unknown error"}`
          results.errors.push(errorMsg)
          fastify.log.error(error, `Error publishing article ${article.id}`)
        }
      }

      fastify.log.info(`Cron job completed: ${results.published}/${results.processed} articles published`)

      return {
        success: true,
        timestamp: now.toISOString(),
        results
      }

    } catch (error) {
      fastify.log.error(error, "Error in scheduled article publication cron job")
      return reply.status(500).send({
        error: "Internal Server Error",
        message: "Failed to process scheduled articles",
        statusCode: 500
      })
    }
  })

  // POST /cron/expire-invitations - Mark expired invitations
  fastify.post("/cron/expire-invitations", {
    schema: {
      headers: {
        type: "object",
        properties: {
          "x-cron-secret": { type: "string" }
        },
        required: ["x-cron-secret"]
      }
    }
  }, async (request, reply) => {
    const cronSecret = request.headers["x-cron-secret"] as string
    const expectedSecret = process.env.CRON_SECRET

    // Verify cron secret
    if (!expectedSecret || cronSecret !== expectedSecret) {
      fastify.log.warn("Unauthorized cron request")
      return reply.status(401).send({
        error: "Unauthorized",
        message: "Invalid cron secret",
        statusCode: 401
      })
    }

    try {
      const now = new Date()
      fastify.log.info(`Starting invitation expiration check at ${now.toISOString()}`)

      // Find all pending invitations that have expired
      const expiredInvitations = await prisma.projectInvitation.findMany({
        where: {
          status: "PENDING",
          expiresAt: {
            lt: now
          }
        },
        include: {
          project: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      fastify.log.info(`Found ${expiredInvitations.length} expired invitations`)

      const results = {
        processed: 0,
        expired: 0,
        errors: [] as string[]
      }

      // Process each expired invitation
      for (const invitation of expiredInvitations) {
        try {
          results.processed++

          // Update invitation status to EXPIRED
          await prisma.projectInvitation.update({
            where: { id: invitation.id },
            data: { status: "EXPIRED" }
          })

          results.expired++
          fastify.log.info(`Expired invitation: ${invitation.email} for project ${invitation.project.name} (${invitation.id})`)

        } catch (error) {
          const errorMsg = `Failed to expire invitation ${invitation.id}: ${error instanceof Error ? error.message : "Unknown error"}`
          results.errors.push(errorMsg)
          fastify.log.error(error, `Error expiring invitation ${invitation.id}`)
        }
      }

      fastify.log.info(`Cron job completed: ${results.expired}/${results.processed} invitations expired`)

      return {
        success: true,
        timestamp: now.toISOString(),
        results
      }

    } catch (error) {
      fastify.log.error(error, "Error in invitation expiration cron job")
      return reply.status(500).send({
        error: "Internal Server Error",
        message: "Failed to process expired invitations",
        statusCode: 500
      })
    }
  })
}

export default cronRoutes
