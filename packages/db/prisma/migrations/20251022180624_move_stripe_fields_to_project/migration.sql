/*
  Warnings:

  - You are about to drop the column `stripeCustomerId` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `subscription` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionExpiresAt` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "project" ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "subscriptionExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user" DROP COLUMN "stripeCustomerId",
DROP COLUMN "stripeSubscriptionId",
DROP COLUMN "subscription",
DROP COLUMN "subscriptionExpiresAt";
