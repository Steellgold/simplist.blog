/*
  Warnings:

  - You are about to drop the column `customMessage` on the `webhook` table. All the data in the column will be lost.
  - You are about to drop the column `customPayload` on the `webhook` table. All the data in the column will be lost.
  - You are about to drop the column `embedColor` on the `webhook` table. All the data in the column will be lost.
  - You are about to drop the column `eventColors` on the `webhook` table. All the data in the column will be lost.
  - You are about to drop the column `eventMessages` on the `webhook` table. All the data in the column will be lost.
  - You are about to drop the column `includeAuthor` on the `webhook` table. All the data in the column will be lost.
  - You are about to drop the column `includeExcerpt` on the `webhook` table. All the data in the column will be lost.
  - You are about to drop the column `includeTags` on the `webhook` table. All the data in the column will be lost.
  - You are about to drop the column `includeUrl` on the `webhook` table. All the data in the column will be lost.
  - You are about to drop the column `template` on the `webhook` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "webhook" DROP COLUMN "customMessage",
DROP COLUMN "customPayload",
DROP COLUMN "embedColor",
DROP COLUMN "eventColors",
DROP COLUMN "eventMessages",
DROP COLUMN "includeAuthor",
DROP COLUMN "includeExcerpt",
DROP COLUMN "includeTags",
DROP COLUMN "includeUrl",
DROP COLUMN "template";
