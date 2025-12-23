/*
  Warnings:

  - The `status` column on the `article` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('draft', 'published', 'deleted', 'scheduled');

-- AlterTable
ALTER TABLE "article" DROP COLUMN "status",
ADD COLUMN     "status" "ArticleStatus" NOT NULL DEFAULT 'draft';

-- CreateIndex
CREATE INDEX "article_projectId_status_idx" ON "article"("projectId", "status");
