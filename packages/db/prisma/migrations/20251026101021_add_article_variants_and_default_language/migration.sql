-- AlterTable
ALTER TABLE "project" ADD COLUMN     "defaultLanguage" TEXT NOT NULL DEFAULT 'en';

-- CreateTable
CREATE TABLE "article_variant" (
    "id" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "characterCount" INTEGER NOT NULL DEFAULT 0,
    "lineCount" INTEGER NOT NULL DEFAULT 0,
    "readTimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "articleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_variant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "article_variant_articleId_idx" ON "article_variant"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "article_variant_articleId_lang_key" ON "article_variant"("articleId", "lang");

-- AddForeignKey
ALTER TABLE "article_variant" ADD CONSTRAINT "article_variant_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
