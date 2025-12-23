-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('BANNER', 'CONTENT', 'AVATAR', 'OTHER');

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "type" "MediaType" NOT NULL DEFAULT 'CONTENT',
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_key_key" ON "media"("key");

-- CreateIndex
CREATE INDEX "media_projectId_idx" ON "media"("projectId");

-- CreateIndex
CREATE INDEX "media_projectId_type_idx" ON "media"("projectId", "type");

-- CreateIndex
CREATE INDEX "media_projectId_createdAt_idx" ON "media"("projectId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "media_uploadedById_idx" ON "media"("uploadedById");

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
