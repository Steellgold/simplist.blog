import * as db from "@simplist/db";
import { CronJob } from "cron";
import type { FastifyInstance } from "fastify";
import { render } from "@react-email/render";
import { AccountDeletionReminderEmail, AccountDeletedEmail } from "@/emails";
import { sendEmail } from "@/utils/email";

const { prisma } = db;

/**
 * Scheduler service that runs periodic tasks
 * Uses cron to check for scheduled articles every 30 minutes
 */
export class Scheduler {
  private tasks: CronJob[] = [];
  private logger: FastifyInstance["log"];

  constructor(logger: FastifyInstance["log"]) {
    this.logger = logger;
  }

  /**
   * Start all scheduled tasks
   */
  start() {
    this.logger.info("Starting scheduler service...");

    // Check for scheduled articles every 30 minutes
    const publishScheduledArticlesTask = new CronJob(
      "*/30 * * * *",
      async () => {
        await this.publishScheduledArticles();
      },
    );

    publishScheduledArticlesTask.start();
    this.tasks.push(publishScheduledArticlesTask);

    // Sync view counts every hour
    const syncViewCountsTask = new CronJob("0 * * * *", async () => {
      await this.syncViewCounts();
    });

    syncViewCountsTask.start();
    this.tasks.push(syncViewCountsTask);

    // Expire invitations every hour
    const expireInvitationsTask = new CronJob("0 * * * *", async () => {
      await this.expireInvitations();
    });

    expireInvitationsTask.start();
    this.tasks.push(expireInvitationsTask);

    // Process account deletions every 30 minutes
    const processAccountDeletionsTask = new CronJob(
      "*/30 * * * *",
      async () => {
        await this.processAccountDeletions();
      },
    );

    processAccountDeletionsTask.start();
    this.tasks.push(processAccountDeletionsTask);

    this.logger.info(
      "Scheduler service started. Tasks: scheduled articles (30min), view counts (1h), invitations (1h), account deletions (30min).",
    );

    // Run view count sync immediately on startup to fix existing data
    this.logger.info("[Scheduler] Running initial view count sync on startup");
    this.syncViewCounts().catch((error) => {
      this.logger.error(error, "[Scheduler] Error in initial view count sync");
    });
  }

  /**
   * Stop all scheduled tasks
   */
  stop() {
    this.logger.info("Stopping scheduler service...");
    this.tasks.forEach((task) => task.stop());
    this.tasks = [];
    this.logger.info("Scheduler service stopped.");
  }

  /**
   * Publish articles that are scheduled and ready
   */
  private async publishScheduledArticles() {
    try {
      const now = new Date();
      this.logger.info(
        `[Scheduler] Checking for scheduled articles at ${now.toISOString()}`,
      );

      // Find all articles that are scheduled and ready to publish
      const scheduledArticles = await prisma.article.findMany({
        where: {
          status: "scheduled",
          scheduledPublishAt: {
            lte: now,
          },
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      if (scheduledArticles.length === 0) {
        this.logger.debug(
          "[Scheduler] No scheduled articles ready for publication",
        );
        return;
      }

      this.logger.info(
        `[Scheduler] Found ${scheduledArticles.length} articles ready for publication`,
      );

      const results = {
        processed: 0,
        published: 0,
        errors: [] as string[],
      };

      // Process each scheduled article
      for (const article of scheduledArticles) {
        try {
          results.processed++;

          // Update article to published status
          await prisma.article.update({
            where: { id: article.id },
            data: {
              status: "published",
              published: true,
              publishedAt: article.scheduledPublishAt || now,
              scheduledPublishAt: null, // Clear the scheduled date
            },
          });

          results.published++;
          this.logger.info(
            `[Scheduler] Published article: "${article.title}" (${article.id}) from project "${article.project.name}"`,
          );
        } catch (error) {
          const errorMsg = `Failed to publish article ${article.id}: ${error instanceof Error ? error.message : "Unknown error"}`;
          results.errors.push(errorMsg);
          this.logger.error(
            error,
            `[Scheduler] Error publishing article ${article.id}`,
          );
        }
      }

      this.logger.info(
        `[Scheduler] Completed: ${results.published}/${results.processed} articles published`,
      );

      if (results.errors.length > 0) {
        this.logger.warn(
          `[Scheduler] Errors occurred: ${results.errors.join(", ")}`,
        );
      }
    } catch (error) {
      this.logger.error(
        error,
        "[Scheduler] Error in scheduled article publication task",
      );
    }
  }

  /**
   * Manually trigger scheduled article publication (for testing/debugging)
   */
  async triggerPublishScheduledArticles() {
    this.logger.info(
      "[Scheduler] Manual trigger for scheduled article publication",
    );
    await this.publishScheduledArticles();
  }

  /**
   * Synchronize article view counts from PageView table
   * This ensures Article.viewCount stays in sync with actual PageView records
   */
  private async syncViewCounts() {
    try {
      const now = new Date();
      this.logger.info(
        `[Scheduler] Starting view count synchronization at ${now.toISOString()}`,
      );

      // Group PageViews by articleId and count them
      const viewCounts = await prisma.pageView.groupBy({
        by: ["articleId"],
        _count: {
          id: true,
        },
      });

      if (viewCounts.length === 0) {
        this.logger.debug("[Scheduler] No page views found to synchronize");
        return;
      }

      this.logger.info(
        `[Scheduler] Found ${viewCounts.length} articles with page views`,
      );

      const results = {
        processed: 0,
        updated: 0,
        errors: [] as string[],
      };

      // Update each article's view count
      for (const { articleId, _count } of viewCounts) {
        try {
          results.processed++;

          // Get current viewCount to check if update is needed
          const article = await prisma.article.findUnique({
            where: { id: articleId },
            select: { viewCount: true, title: true },
          });

          if (!article) {
            continue; // Article might have been deleted
          }

          const actualViewCount = _count.id;

          // Only update if different
          if (article.viewCount !== actualViewCount) {
            await prisma.article.update({
              where: { id: articleId },
              data: { viewCount: actualViewCount },
            });

            results.updated++;
            this.logger.debug(
              `[Scheduler] Updated "${article.title}": ${article.viewCount} → ${actualViewCount} views`,
            );
          }
        } catch (error) {
          const errorMsg = `Failed to sync view count for article ${articleId}: ${error instanceof Error ? error.message : "Unknown error"}`;
          results.errors.push(errorMsg);
          this.logger.error(
            error,
            `[Scheduler] Error syncing view count for article ${articleId}`,
          );
        }
      }

      this.logger.info(
        `[Scheduler] View count sync completed: ${results.updated}/${results.processed} articles updated`,
      );

      if (results.errors.length > 0) {
        this.logger.warn(
          `[Scheduler] Sync errors occurred: ${results.errors.join(", ")}`,
        );
      }
    } catch (error) {
      this.logger.error(
        error,
        "[Scheduler] Error in view count synchronization task",
      );
    }
  }

  /**
   * Manually trigger view count synchronization (for testing/debugging)
   */
  async triggerSyncViewCounts() {
    this.logger.info(
      "[Scheduler] Manual trigger for view count synchronization",
    );
    await this.syncViewCounts();
  }

  /**
   * Expire pending invitations that have passed their expiration date
   */
  private async expireInvitations() {
    try {
      const now = new Date();
      this.logger.info(
        `[Scheduler] Checking for expired invitations at ${now.toISOString()}`,
      );

      // Find all pending invitations that have expired
      const expiredInvitations = await prisma.projectInvitation.findMany({
        where: {
          status: "PENDING",
          expiresAt: {
            lt: now,
          },
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (expiredInvitations.length === 0) {
        this.logger.debug("[Scheduler] No expired invitations found");
        return;
      }

      this.logger.info(
        `[Scheduler] Found ${expiredInvitations.length} expired invitations`,
      );

      const results = {
        processed: 0,
        expired: 0,
        errors: [] as string[],
      };

      // Process each expired invitation
      for (const invitation of expiredInvitations) {
        try {
          results.processed++;

          // Update invitation status to EXPIRED
          await prisma.projectInvitation.update({
            where: { id: invitation.id },
            data: { status: "EXPIRED" },
          });

          results.expired++;
          this.logger.info(
            `[Scheduler] Expired invitation: ${invitation.email} for project ${invitation.project.name}`,
          );
        } catch (error) {
          const errorMsg = `Failed to expire invitation ${invitation.id}: ${error instanceof Error ? error.message : "Unknown error"}`;
          results.errors.push(errorMsg);
          this.logger.error(
            error,
            `[Scheduler] Error expiring invitation ${invitation.id}`,
          );
        }
      }

      this.logger.info(
        `[Scheduler] Completed: ${results.expired}/${results.processed} invitations expired`,
      );

      if (results.errors.length > 0) {
        this.logger.warn(
          `[Scheduler] Errors occurred: ${results.errors.join(", ")}`,
        );
      }
    } catch (error) {
      this.logger.error(
        error,
        "[Scheduler] Error in invitation expiration task",
      );
    }
  }

  /**
   * Process account deletions - send reminders and perform final deletion
   */
  private async processAccountDeletions() {
    try {
      const now = new Date();
      this.logger.info(
        `[Scheduler] Checking for account deletions at ${now.toISOString()}`,
      );

      const appBaseUrl =
        process.env.APP_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.BETTER_AUTH_URL ||
        "https://app.simplist.blog";

      const manageUrl = `${appBaseUrl}/account/settings/account`;

      const users = await prisma.user.findMany({
        where: {
          deletionScheduledAt: {
            not: null,
          },
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
        },
      });

      if (users.length === 0) {
        this.logger.debug("[Scheduler] No users scheduled for deletion");
        return;
      }

      this.logger.info(
        `[Scheduler] Found ${users.length} users with scheduled deletions`,
      );

      const results = {
        checked: users.length,
        remindersSent: 0,
        deleted: 0,
        errors: [] as string[],
      };

      const addDays = (date: Date, days: number) => {
        return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
      };

      const buildUserName = (user: {
        firstName?: string | null;
        lastName?: string | null;
        email: string;
      }) => {
        const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
        return name || user.email;
      };

      for (const user of users) {
        try {
          const scheduledAt = user.deletionScheduledAt;
          if (!scheduledAt) continue;

          const name = buildUserName(user);
          const requestedAt = user.deletionRequestedAt ?? scheduledAt;
          const updates: {
            deletionReminder7Sent?: boolean;
            deletionReminder10Sent?: boolean;
            deletionReminder1hSent?: boolean;
          } = {};

          // Final deletion when the deadline is reached
          if (scheduledAt <= now) {
            try {
              const html = await render(AccountDeletedEmail({ name }));
              await sendEmail({
                to: user.email,
                subject: "Your Simplist account has been deleted permanently",
                html,
              });
            } catch (err) {
              this.logger.error(
                err,
                `[Scheduler] Failed to send deletion confirmation for user ${user.id}`,
              );
            }

            await prisma.user.delete({ where: { id: user.id } });
            results.deleted++;
            this.logger.info(`[Scheduler] Deleted user account: ${user.email}`);
            continue;
          }

          // 7-day reminder
          if (
            !user.deletionReminder7Sent &&
            requestedAt &&
            now >= addDays(requestedAt, 7)
          ) {
            const html = await render(
              AccountDeletionReminderEmail({
                name,
                scheduledAt,
                manageUrl,
                stage: "day7",
              }),
            );

            await sendEmail({
              to: user.email,
              subject: "7 days left to cancel your Simplist deletion",
              html,
            });

            updates.deletionReminder7Sent = true;
            results.remindersSent++;
            this.logger.info(
              `[Scheduler] Sent 7-day reminder to ${user.email}`,
            );
          }

          // 10-day reminder
          if (
            !user.deletionReminder10Sent &&
            requestedAt &&
            now >= addDays(requestedAt, 10)
          ) {
            const html = await render(
              AccountDeletionReminderEmail({
                name,
                scheduledAt,
                manageUrl,
                stage: "day10",
              }),
            );

            await sendEmail({
              to: user.email,
              subject: "4 days left to cancel your Simplist deletion",
              html,
            });

            updates.deletionReminder10Sent = true;
            results.remindersSent++;
            this.logger.info(
              `[Scheduler] Sent 10-day reminder to ${user.email}`,
            );
          }

          // Final 1-hour reminder
          const msUntilDeletion = scheduledAt.getTime() - now.getTime();
          if (
            !user.deletionReminder1hSent &&
            msUntilDeletion <= 60 * 60 * 1000 &&
            msUntilDeletion > 0
          ) {
            const html = await render(
              AccountDeletionReminderEmail({
                name,
                scheduledAt,
                manageUrl,
                stage: "hour1",
              }),
            );

            await sendEmail({
              to: user.email,
              subject: "Your Simplist account deletes in 1 hour",
              html,
            });

            updates.deletionReminder1hSent = true;
            results.remindersSent++;
            this.logger.info(
              `[Scheduler] Sent 1-hour reminder to ${user.email}`,
            );
          }

          if (Object.keys(updates).length > 0) {
            await prisma.user.update({
              where: { id: user.id },
              data: updates,
            });
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          results.errors.push(`User ${user.id}: ${message}`);
          this.logger.error(
            error,
            `[Scheduler] Error processing deletion for user ${user.id}`,
          );
        }
      }

      this.logger.info(
        `[Scheduler] Completed: ${results.remindersSent} reminders sent, ${results.deleted} accounts deleted`,
      );

      if (results.errors.length > 0) {
        this.logger.warn(
          `[Scheduler] Errors occurred: ${results.errors.join(", ")}`,
        );
      }
    } catch (error) {
      this.logger.error(
        error,
        "[Scheduler] Error in account deletion processing task",
      );
    }
  }
}
