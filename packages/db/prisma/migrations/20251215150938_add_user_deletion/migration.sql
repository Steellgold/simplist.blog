-- AlterTable
ALTER TABLE "user" ADD COLUMN     "deletionCanceledAt" TIMESTAMP(3),
ADD COLUMN     "deletionReminder10Sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deletionReminder1hSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deletionReminder7Sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deletionRequestedAt" TIMESTAMP(3),
ADD COLUMN     "deletionScheduledAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "user_deletionScheduledAt_idx" ON "user"("deletionScheduledAt");
