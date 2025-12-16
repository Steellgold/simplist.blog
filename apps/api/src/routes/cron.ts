import * as db from "@simplist/db"
import { sendWebhookEvent } from "@simplist/db"
import { FastifyPluginAsync } from "fastify"
import { render } from "@react-email/render"
import { AccountDeletionReminderEmail, AccountDeletedEmail } from "../emails"
import { sendEmail } from "../utils/email"

const { prisma } = db

const addDays = (date: Date, days: number) => {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

const getAppBaseUrl = () => {
  return (
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "https://app.simplist.blog"
  )
}

const buildUserName = (user: { firstName?: string | null; lastName?: string | null; email: string }) => {
  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim()
  return name || user.email
}

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
          project: {
            select: {
              id: true,
              name: true,
              baseUrl: true,
              articleUrlPattern: true
            }
          },
          author: {
            select: {
              name: true,
            }
          },
          tags: {
            select: {
              name: true,
            }
          }
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

          // Notify webhooks
          await sendWebhookEvent(article.projectId, "article.published", {
            id: article.id,
            title: article.title,
            slug: article.slug,
            author: article.author.name,
            excerpt: article.excerpt ?? "",
            publishedAt: article.scheduledPublishAt?.toISOString() ?? now.toISOString(),
            tags: article.tags.map((tag) => tag.name),
            url: `${article.project.baseUrl}${article.project.articleUrlPattern.replace("{slug}", article.slug)}`
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

  // POST /cron/process-account-deletions - Handle reminders and final deletion
  fastify.post("/cron/process-account-deletions", {
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
      const manageUrl = `${getAppBaseUrl()}/account/settings/account`

      const users = await prisma.user.findMany({
        where: {
          deletionScheduledAt: {
            not: null
          }
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          deletionRequestedAt: true,
          deletionScheduledAt: true,
          deletionReminder7Sent: true,
          deletionReminder10Sent: true,
          deletionReminder1hSent: true,
        }
      })

      const results = {
        checked: users.length,
        remindersSent: 0,
        deleted: 0,
        errors: [] as string[]
      }

      const reminderSubjects: Record<"day7" | "day10" | "hour1", string> = {
        day7: "7 days left to cancel your Simplist deletion",
        day10: "4 days left to cancel your Simplist deletion",
        hour1: "Your Simplist account deletes in 1 hour",
      }

      for (const user of users) {
        try {
          const scheduledAt = user.deletionScheduledAt
          if (!scheduledAt) continue

          const name = buildUserName(user)
          const requestedAt = user.deletionRequestedAt ?? scheduledAt
          const updates: {
            deletionReminder7Sent?: boolean
            deletionReminder10Sent?: boolean
            deletionReminder1hSent?: boolean
          } = {}

          // Final deletion when the deadline is reached
          if (scheduledAt <= now) {
            try {
              const html = await render(AccountDeletedEmail({ name }))
              await sendEmail({
                to: user.email,
                subject: "Your Simplist account has been deleted permanently",
                html,
              })
            } catch (err) {
              fastify.log.error(err, `Failed to send deletion confirmation for user ${user.id}`)
            }

            await prisma.user.delete({ where: { id: user.id } })
            results.deleted++
            continue
          }

          // 7-day reminder
          if (!user.deletionReminder7Sent && requestedAt && now >= addDays(requestedAt, 7)) {
            const html = await render(
              AccountDeletionReminderEmail({
                name,
                scheduledAt,
                manageUrl,
                stage: "day7",
              })
            )

            await sendEmail({
              to: user.email,
              subject: reminderSubjects.day7,
              html,
            })

            updates.deletionReminder7Sent = true
            results.remindersSent++
          }

          // 10-day reminder
          if (!user.deletionReminder10Sent && requestedAt && now >= addDays(requestedAt, 10)) {
            const html = await render(
              AccountDeletionReminderEmail({
                name,
                scheduledAt,
                manageUrl,
                stage: "day10",
              })
            )

            await sendEmail({
              to: user.email,
              subject: reminderSubjects.day10,
              html,
            })

            updates.deletionReminder10Sent = true
            results.remindersSent++
          }

          // Final 1-hour reminder
          const msUntilDeletion = scheduledAt.getTime() - now.getTime()
          if (!user.deletionReminder1hSent && msUntilDeletion <= 60 * 60 * 1000 && msUntilDeletion > 0) {
            const html = await render(
              AccountDeletionReminderEmail({
                name,
                scheduledAt,
                manageUrl,
                stage: "hour1",
              })
            )

            await sendEmail({
              to: user.email,
              subject: reminderSubjects.hour1,
              html,
            })

            updates.deletionReminder1hSent = true
            results.remindersSent++
          }

          if (Object.keys(updates).length > 0) {
            await prisma.user.update({
              where: { id: user.id },
              data: updates,
            })
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error"
          results.errors.push(`User ${user.id}: ${message}`)
          fastify.log.error(error, `Error processing deletion for user ${user.id}`)
        }
      }

      return {
        success: true,
        timestamp: now.toISOString(),
        results,
      }
    } catch (error) {
      fastify.log.error(error, "Error processing account deletion cron job")
      return reply.status(500).send({
        error: "Internal Server Error",
        message: "Failed to process account deletions",
        statusCode: 500
      })
    }
  })
}

export default cronRoutes
