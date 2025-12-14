-- AlterTable
ALTER TABLE "webhook" ADD COLUMN     "customPayload" JSONB,
ADD COLUMN     "templateId" TEXT;
