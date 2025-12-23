/*
  Warnings:

  - You are about to drop the column `storageLimit` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `storageUsed` on the `project` table. All the data in the column will be lost.
  - You are about to drop the `asset` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."asset" DROP CONSTRAINT "asset_projectId_fkey";

-- AlterTable
ALTER TABLE "project" DROP COLUMN "storageLimit",
DROP COLUMN "storageUsed";

-- DropTable
DROP TABLE "public"."asset";
