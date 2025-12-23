-- AlterTable
ALTER TABLE "api_key" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "article" ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft',
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;
