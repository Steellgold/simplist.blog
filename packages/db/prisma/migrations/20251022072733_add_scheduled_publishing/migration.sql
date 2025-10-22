-- AlterTable
ALTER TABLE "article" ADD COLUMN     "scheduledPublishAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "project" ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC';
