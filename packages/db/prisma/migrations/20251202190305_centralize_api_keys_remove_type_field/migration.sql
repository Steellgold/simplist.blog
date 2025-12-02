/*
  Warnings:

  - You are about to drop the column `type` on the `api_key` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "api_key" DROP COLUMN "type",
ALTER COLUMN "permissions" SET DEFAULT ARRAY[]::TEXT[];
