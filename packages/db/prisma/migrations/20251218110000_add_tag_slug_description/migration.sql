-- AlterTable
ALTER TABLE "tag" ADD COLUMN "description" TEXT;
ALTER TABLE "tag" ADD COLUMN "slug" TEXT;

-- Update existing tags with slug generated from name
UPDATE "tag" SET "slug" = LOWER(REGEXP_REPLACE(REGEXP_REPLACE("name", '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));

-- CreateIndex
CREATE UNIQUE INDEX "tag_projectId_slug_key" ON "tag"("projectId", "slug");
