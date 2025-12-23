/*
  Warnings:

  - The values [FREE] on the enum `SubscriptionTier` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionTier_new" AS ENUM ('STARTER', 'PRO');
ALTER TABLE "public"."project" ALTER COLUMN "subscriptionTier" DROP DEFAULT;
ALTER TABLE "project" ALTER COLUMN "subscriptionTier" TYPE "SubscriptionTier_new" USING ("subscriptionTier"::text::"SubscriptionTier_new");
ALTER TYPE "SubscriptionTier" RENAME TO "SubscriptionTier_old";
ALTER TYPE "SubscriptionTier_new" RENAME TO "SubscriptionTier";
DROP TYPE "public"."SubscriptionTier_old";
ALTER TABLE "project" ALTER COLUMN "subscriptionTier" SET DEFAULT 'STARTER';
COMMIT;

-- AlterTable
ALTER TABLE "project" ALTER COLUMN "subscriptionTier" SET DEFAULT 'STARTER';
