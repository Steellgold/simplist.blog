-- CreateIndex
CREATE INDEX "api_key_projectId_status_idx" ON "api_key"("projectId", "status");

-- CreateIndex
CREATE INDEX "api_key_key_status_idx" ON "api_key"("key", "status");

-- CreateIndex
CREATE INDEX "article_projectId_status_idx" ON "article"("projectId", "status");

-- CreateIndex
CREATE INDEX "article_projectId_createdAt_idx" ON "article"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "article_projectId_published_idx" ON "article"("projectId", "published");

-- CreateIndex
CREATE INDEX "page_view_projectId_timestamp_idx" ON "page_view"("projectId", "timestamp");

-- CreateIndex
CREATE INDEX "page_view_projectId_createdAt_idx" ON "page_view"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "page_view_articleId_timestamp_idx" ON "page_view"("articleId", "timestamp");

-- CreateIndex
CREATE INDEX "project_userId_createdAt_idx" ON "project"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "project_userId_subscriptionTier_idx" ON "project"("userId", "subscriptionTier");
