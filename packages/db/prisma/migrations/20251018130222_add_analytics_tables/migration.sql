-- AlterTable
ALTER TABLE "api_key" ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY['read']::TEXT[],
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'secret';

-- CreateTable
CREATE TABLE "page_view" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "country" TEXT,
    "countryCode" TEXT,
    "city" TEXT,
    "region" TEXT,
    "timezone" TEXT,
    "userAgent" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "browserVersion" TEXT,
    "os" TEXT,
    "osVersion" TEXT,
    "screenWidth" INTEGER,
    "screenHeight" INTEGER,
    "referrer" TEXT,
    "referrerDomain" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "timeOnPage" INTEGER,
    "scrollDepth" DOUBLE PRECISION,
    "exitPosition" DOUBLE PRECISION,
    "bounced" BOOLEAN NOT NULL DEFAULT false,
    "pageUrl" TEXT,
    "pageTitle" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_view_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_event" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB,
    "position" DOUBLE PRECISION,
    "element" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeOffset" INTEGER,

    CONSTRAINT "page_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "page_view_articleId_idx" ON "page_view"("articleId");

-- CreateIndex
CREATE INDEX "page_view_projectId_idx" ON "page_view"("projectId");

-- CreateIndex
CREATE INDEX "page_view_visitorId_idx" ON "page_view"("visitorId");

-- CreateIndex
CREATE INDEX "page_view_sessionId_idx" ON "page_view"("sessionId");

-- CreateIndex
CREATE INDEX "page_view_timestamp_idx" ON "page_view"("timestamp");

-- CreateIndex
CREATE INDEX "page_view_country_idx" ON "page_view"("country");

-- CreateIndex
CREATE INDEX "page_event_articleId_idx" ON "page_event"("articleId");

-- CreateIndex
CREATE INDEX "page_event_projectId_idx" ON "page_event"("projectId");

-- CreateIndex
CREATE INDEX "page_event_visitorId_idx" ON "page_event"("visitorId");

-- CreateIndex
CREATE INDEX "page_event_sessionId_idx" ON "page_event"("sessionId");

-- CreateIndex
CREATE INDEX "page_event_eventType_idx" ON "page_event"("eventType");

-- CreateIndex
CREATE INDEX "page_event_timestamp_idx" ON "page_event"("timestamp");

-- AddForeignKey
ALTER TABLE "page_view" ADD CONSTRAINT "page_view_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_event" ADD CONSTRAINT "page_event_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
