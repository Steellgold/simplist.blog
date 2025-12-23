-- AlterTable
ALTER TABLE "webhook" ADD COLUMN     "customMessage" TEXT,
ADD COLUMN     "customPayload" JSONB,
ADD COLUMN     "embedColor" TEXT,
ADD COLUMN     "includeAuthor" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "includeExcerpt" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "includeTags" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "includeUrl" BOOLEAN NOT NULL DEFAULT true;
