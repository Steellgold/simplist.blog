/*
  Warnings:

  - You are about to drop the column `apiCallsResetAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyApiCalls` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `totalStorageUsed` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "project" ADD COLUMN     "apiCallsResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "monthlyApiCalls" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalStorageUsed" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "apiCallsResetAt",
DROP COLUMN "monthlyApiCalls",
DROP COLUMN "totalStorageUsed";
