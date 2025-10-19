-- AlterTable
ALTER TABLE "project" ADD COLUMN     "allowedOrigins" TEXT[] DEFAULT ARRAY[]::TEXT[];
