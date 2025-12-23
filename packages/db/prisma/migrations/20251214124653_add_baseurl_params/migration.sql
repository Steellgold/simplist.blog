-- AlterTable
ALTER TABLE "project" ADD COLUMN     "articleUrlPattern" TEXT NOT NULL DEFAULT '/blog/{slug}',
ADD COLUMN     "baseUrl" TEXT;
