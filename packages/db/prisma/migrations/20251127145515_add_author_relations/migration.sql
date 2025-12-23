-- AddForeignKey
ALTER TABLE "article" ADD CONSTRAINT "article_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article" ADD CONSTRAINT "article_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
