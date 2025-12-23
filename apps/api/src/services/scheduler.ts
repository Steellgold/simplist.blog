import * as db from "@simplist/db";
import { CronJob } from "cron";
import type { FastifyInstance } from "fastify";

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
    this.logger.info(
      "Scheduler service started. Checking for scheduled articles every 30 minutes.",
    );
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
}
