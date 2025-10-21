-- AlterTable
ALTER TABLE "user" ADD COLUMN     "apiCallsResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "monthlyApiCalls" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "subscription" TEXT NOT NULL DEFAULT 'free',
ADD COLUMN     "subscriptionExpiresAt" TIMESTAMP(3),
ADD COLUMN     "totalStorageUsed" INTEGER NOT NULL DEFAULT 0;
