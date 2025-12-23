import { parseBody, parseQuery } from "@/types/fastify";
import type {
  AnalyticsQuery,
  TrackAnalyticsBody,
  UpdatePageViewBody,
} from "@/types/requests";
import type { Prisma } from "@simplist/db";
import * as db from "@simplist/db";
import crypto from "crypto";
import { FastifyPluginAsync } from "fastify";
import { getBotInfo } from "../utils/bot-detection";

const { prisma, analyticsCacheUtils } = db;

// Helper to generate visitor ID from IP and User Agent (fallback)
const generateVisitorId = (ip: string, userAgent: string): string => {
  return crypto
    .createHash("sha256")
    .update(`${ip}:${userAgent}`)
    .digest("hex")
    .substring(0, 16);
};

// Helper to find or create unique visitor ID with deduplication
const getUniqueVisitorId = async (
  projectId: string,
  clientVisitorId: string | null,
  ip: string,
  userAgent: string,
): Promise<string> => {
  // 1. If client provided a visitorId, use it (most reliable)
  if (clientVisitorId && clientVisitorId.startsWith("visitor_")) {
    return clientVisitorId;
  }

  // 2. Check if there's already a visitor with the same IP in the last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Use full hash with salt for better security
  const salt =
    process.env.ANALYTICS_IP_SALT || "default-salt-please-change-in-production";
  const hashedIp = crypto
    .createHash("sha256")
    .update(ip + salt)
    .digest("hex"); // Use full hash instead of truncating

  const recentVisitor = await prisma.pageView.findFirst({
    where: {
      projectId,
      timestamp: { gte: oneDayAgo },
      ipAddress: hashedIp,
    },
    select: {
      visitorId: true,
    },
    orderBy: {
      timestamp: "desc",
    },
  });

  // 3. If found recent visitor with same IP, reuse that visitorId
  if (recentVisitor) {
    return recentVisitor.visitorId;
  }

  // 4. Generate new visitor ID using old method
  return generateVisitorId(ip, userAgent);
};

// Note: IP addresses are not stored for privacy reasons
// We only use them temporarily to generate unique visitor IDs

// Helper to parse user agent
const parseUserAgent = (userAgent: string) => {
  // Simple user agent parsing - in production, consider using a library like "ua-parser-js"
  const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
  const isTablet = /iPad|Tablet/.test(userAgent);
  const device = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";

  let browser = "Unknown";
  let os = "Unknown";

  if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Edge")) browser = "Edge";

  if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "macOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iOS")) os = "iOS";

  return { device, browser, os };
};

const analyticsRoutes: FastifyPluginAsync = async (fastify) => {
  // Override auth for analytics routes
  await fastify.register(import("../plugins/analytics-auth"));

  // POST /analytics/track - Track page view and events
  fastify.post("/analytics/track", async (request, reply) => {
    const body = parseBody<TrackAnalyticsBody>(request);
    const projectId = request.apiKey!.projectId;
    const userAgent = request.headers["user-agent"] || "";
    const forwardedFor = request.headers["x-forwarded-for"] as string;
    const realIp = request.headers["x-real-ip"] as string;
    const clientIp = forwardedFor?.split(",")[0] || realIp || request.ip;

    // Bot detection - reject bot traffic
    const botInfo = getBotInfo(userAgent);
    if (botInfo.isBot) {
      fastify.log.info(
        { userAgent, ip: clientIp },
        `Bot detected and blocked: ${botInfo.reason}`,
      );
      return reply.code(400).send({
        error: "Bot Detected",
        message: "Analytics tracking is not available for automated requests",
        statusCode: 400,
      });
    }

    try {
      // Validate required fields
      if (!body.articleSlug) {
        return reply.code(400).send({
          error: "Bad Request",
          message: "articleSlug is required",
          statusCode: 400,
        });
      }

      // Find the article
      const article = await prisma.article.findFirst({
        where: {
          slug: body.articleSlug,
          projectId,
          status: { not: "deleted" },
          published: true,
        },
      });

      if (!article) {
        return reply.code(404).send({
          error: "Not Found",
          message: "Article not found or not published",
          statusCode: 404,
        });
      }

      // Get unique visitor ID with deduplication logic
      const visitorId = await getUniqueVisitorId(
        projectId,
        body.visitorId ?? null,
        clientIp,
        userAgent,
      );
      const sessionId =
        body.sessionId ||
        `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Parse user agent
      const userAgentInfo = parseUserAgent(userAgent);

      // Use geo data provided by client (if any)
      const geoData = {
        country: body.country || null,
        countryCode: body.countryCode || null,
        region: body.region || null,
        city: body.city || null,
        timezone: body.timezone || null,
      };

      // Parse referrer domain
      let referrerDomain = null;
      if (body.referrer) {
        try {
          referrerDomain = new URL(body.referrer).hostname;
        } catch {
          // Invalid URL, ignore
        }
      }

      // Determine request source from User-Agent or explicit header
      const isSdkRequest =
        userAgent.includes("SimplistSDK") ||
        request.headers["x-simplist-source"] === "sdk";
      const requestSource = isSdkRequest ? "sdk" : "direct";

      // Create page view record
      const pageView = await prisma.pageView.create({
        data: {
          articleId: article.id,
          projectId,
          visitorId,
          sessionId,

          // Geo data only (no IP stored)
          ipAddress: null,
          country: geoData.country,
          countryCode: geoData.countryCode,
          region: geoData.region,
          city: geoData.city,
          timezone: geoData.timezone,

          // Device/browser info
          userAgent,
          device: userAgentInfo.device,
          browser: userAgentInfo.browser,
          os: userAgentInfo.os,
          screenWidth: body.screenWidth,
          screenHeight: body.screenHeight,

          // Traffic source
          referrer: body.referrer,
          referrerDomain,
          utmSource: body.utmSource,
          utmMedium: body.utmMedium,
          utmCampaign: body.utmCampaign,
          utmTerm: body.utmTerm,
          utmContent: body.utmContent,

          // Engagement metrics (will be updated later)
          timeOnPage: body.timeOnPage,
          scrollDepth: body.scrollDepth,
          exitPosition: body.exitPosition,
          bounced: body.bounced || false,

          // Request source tracking
          requestSource,

          // Metadata
          pageUrl: body.pageUrl,
          pageTitle: body.pageTitle || article.title,
          timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
        },
      });

      // Process events if provided
      if (body.events && Array.isArray(body.events)) {
        const events = body.events.map((event) => ({
          articleId: article.id,
          projectId,
          visitorId,
          sessionId,
          eventType: event.type,
          eventData: (event.data || {}) as Prisma.InputJsonValue,
          position: event.position,
          element: event.element,
          timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
          timeOffset: event.timeOffset,
        }));

        await prisma.pageEvent.createMany({
          data: events,
        });
      }

      // Invalidate analytics cache since we added a new page view
      await analyticsCacheUtils.invalidate(projectId);

      return {
        success: true,
        pageViewId: pageView.id,
        visitorId,
        sessionId,
      };
    } catch (error) {
      fastify.log.error(error, "Error tracking analytics");
      return reply.code(500).send({
        error: "Internal Server Error",
        message: "Failed to track analytics",
        statusCode: 500,
      });
    }
  });

  // PUT /analytics/track/:pageViewId - Update existing page view (e.g., when user leaves)
  fastify.put("/analytics/track/:pageViewId", async (request, reply) => {
    const { pageViewId } = request.params as { pageViewId: string };
    const body = parseBody<UpdatePageViewBody>(request);
    const projectId = request.apiKey!.projectId;
    const userAgent = request.headers["user-agent"] || "";

    // Bot detection - reject bot traffic
    const botInfo = getBotInfo(userAgent);
    if (botInfo.isBot) {
      fastify.log.info(
        { userAgent, pageViewId },
        `Bot detected and blocked on update: ${botInfo.reason}`,
      );
      return reply.code(400).send({
        error: "Bot Detected",
        message: "Analytics tracking is not available for automated requests",
        statusCode: 400,
      });
    }

    try {
      // Verify page view belongs to this project
      const existingPageView = await prisma.pageView.findFirst({
        where: {
          id: pageViewId,
          projectId,
        },
      });

      if (!existingPageView) {
        return reply.code(404).send({
          error: "Not Found",
          message: "Page view not found",
          statusCode: 404,
        });
      }

      // Update the page view with final metrics
      await prisma.pageView.update({
        where: { id: pageViewId },
        data: {
          timeOnPage: body.timeOnPage,
          scrollDepth: body.scrollDepth,
          exitPosition: body.exitPosition,
          bounced: body.bounced || false,
        },
      });

      // Invalidate analytics cache since metrics were updated
      await analyticsCacheUtils.invalidate(projectId);

      return { success: true };
    } catch (error) {
      fastify.log.error(error, "Error updating analytics");
      return reply.code(500).send({
        error: "Internal Server Error",
        message: "Failed to update analytics",
        statusCode: 500,
      });
    }
  });

  // GET /analytics/stats - Get analytics stats for project
  fastify.get("/analytics/stats", async (request, reply) => {
    const projectId = request.apiKey!.projectId;
    const query = parseQuery<AnalyticsQuery>(request);

    // Check if key has read permissions for analytics data
    if (!request.checkPermission!("read")) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "API key does not have read permissions.",
        statusCode: 403,
      });
    }

    try {
      const days = Number(query.days) || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get total page views
      const totalViews = await prisma.pageView.count({
        where: {
          projectId,
          timestamp: { gte: startDate },
        },
      });

      // Get unique visitors
      const uniqueVisitors = await prisma.pageView.findMany({
        where: {
          projectId,
          timestamp: { gte: startDate },
        },
        select: { visitorId: true },
        distinct: ["visitorId"],
      });

      // Get top articles
      const topArticlesRaw = await prisma.pageView.groupBy({
        by: ["articleId"],
        where: {
          projectId,
          timestamp: { gte: startDate },
        },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      });

      type TopArticleResult = { articleId: string; _count: { id: number } };
      const topArticles = topArticlesRaw as TopArticleResult[];

      // Get article titles
      const articleIds = topArticles.map((a) => a.articleId);
      const articles = await prisma.article.findMany({
        where: { id: { in: articleIds } },
        select: { id: true, title: true, slug: true },
      });

      const topArticlesWithTitles = topArticles.map((ta) => {
        const article = articles.find((a) => a.id === ta.articleId);
        return {
          articleId: ta.articleId,
          title: article?.title || "Unknown",
          slug: article?.slug || "",
          views: ta._count.id,
        };
      });

      // Get countries stats
      const topCountriesRaw = await prisma.pageView.groupBy({
        by: ["country"],
        where: {
          projectId,
          timestamp: { gte: startDate },
          country: { not: null },
        },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      });

      type TopCountryResult = { country: string; _count: { id: number } };
      const topCountries = topCountriesRaw as TopCountryResult[];

      // Get request source stats (SDK vs Direct)
      const requestSourceStats = await prisma.pageView.groupBy({
        by: ["requestSource"],
        where: {
          projectId,
          timestamp: { gte: startDate },
        },
        _count: { id: true },
      });

      const sdkViews =
        requestSourceStats.find((s) => s.requestSource === "sdk")?._count.id ||
        0;
      const directViews =
        requestSourceStats.find((s) => s.requestSource === "direct")?._count
          .id || 0;
      const sdkPercentage =
        totalViews > 0 ? Math.round((sdkViews / totalViews) * 100) : 0;
      const directPercentage =
        totalViews > 0 ? Math.round((directViews / totalViews) * 100) : 0;

      return {
        period: { days, startDate, endDate: new Date() },
        summary: {
          totalViews,
          uniqueVisitors: uniqueVisitors.length,
          avgViewsPerVisitor:
            uniqueVisitors.length > 0
              ? Math.round((totalViews / uniqueVisitors.length) * 100) / 100
              : 0,
        },
        requestSource: {
          sdk: {
            count: sdkViews,
            percentage: sdkPercentage,
          },
          direct: {
            count: directViews,
            percentage: directPercentage,
          },
        },
        topArticles: topArticlesWithTitles,
        topCountries: topCountries.map((tc) => ({
          country: tc.country,
          views: tc._count.id,
        })),
      };
    } catch (error) {
      fastify.log.error(error, "Error fetching analytics stats");
      return reply.code(500).send({
        error: "Internal Server Error",
        message: "Failed to fetch analytics stats",
        statusCode: 500,
      });
    }
  });

  // GET /analytics/funnel - Get engagement funnel data
  fastify.get("/analytics/funnel", async (request, reply) => {
    const projectId = request.apiKey!.projectId;
    const query = parseQuery<AnalyticsQuery>(request);

    // Check if key has read permissions for analytics data
    if (!request.checkPermission!("read")) {
      return reply.code(403).send({
        error: "Forbidden",
        message: "API key does not have read permissions.",
        statusCode: 403,
      });
    }

    try {
      const days = Number(query.days) || 30;
      const articleSlug = query.slug;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Build base where clause
      const baseWhere: {
        projectId: string;
        timestamp: { gte: Date };
        articleId?: string;
      } = {
        projectId,
        timestamp: { gte: startDate },
      };

      // If article slug is provided, filter by article
      if (articleSlug) {
        const article = await prisma.article.findFirst({
          where: { projectId, slug: articleSlug },
          select: { id: true },
        });
        if (article) {
          baseWhere.articleId = article.id;
        }
      }

      // Get total page views for the period
      const totalPageViews = await prisma.pageView.count({
        where: baseWhere,
      });

      // Get scroll milestone events and count based on eventData for milestone values
      const milestoneData = await prisma.pageEvent.findMany({
        where: {
          projectId,
          timestamp: { gte: startDate },
          eventType: "scroll_milestone",
          ...(baseWhere.articleId ? { articleId: baseWhere.articleId } : {}),
        },
        select: { eventData: true },
      });

      // Count milestones by value
      const milestoneCounts: Record<number, number> = {
        25: 0,
        50: 0,
        75: 0,
        90: 0,
      };
      for (const event of milestoneData) {
        const data = event.eventData as { milestone?: number } | null;
        if (data?.milestone && milestoneCounts[data.milestone] !== undefined) {
          milestoneCounts[data.milestone]++;
        }
      }

      // Get average engagement metrics
      const engagementMetrics = await prisma.pageView.aggregate({
        where: { ...baseWhere, timeOnPage: { not: null } },
        _avg: {
          timeOnPage: true,
          scrollDepth: true,
        },
        _count: { id: true },
      });

      // Get bounce rate
      const bouncedViews = await prisma.pageView.count({
        where: { ...baseWhere, bounced: true },
      });

      // Calculate funnel percentages
      const funnel = {
        pageViews: totalPageViews,
        reached25: milestoneCounts[25],
        reached50: milestoneCounts[50],
        reached75: milestoneCounts[75],
        reached90: milestoneCounts[90],
        percentages: {
          reached25:
            totalPageViews > 0
              ? Math.round((milestoneCounts[25] / totalPageViews) * 100)
              : 0,
          reached50:
            totalPageViews > 0
              ? Math.round((milestoneCounts[50] / totalPageViews) * 100)
              : 0,
          reached75:
            totalPageViews > 0
              ? Math.round((milestoneCounts[75] / totalPageViews) * 100)
              : 0,
          reached90:
            totalPageViews > 0
              ? Math.round((milestoneCounts[90] / totalPageViews) * 100)
              : 0,
        },
      };

      return {
        period: { days, startDate, endDate: new Date() },
        funnel,
        engagement: {
          avgTimeOnPage: Math.round(engagementMetrics._avg.timeOnPage || 0),
          avgScrollDepth: Math.round(engagementMetrics._avg.scrollDepth || 0),
          bounceRate:
            totalPageViews > 0
              ? Math.round((bouncedViews / totalPageViews) * 100)
              : 0,
          engagementRate:
            totalPageViews > 0
              ? Math.round(
                  ((totalPageViews - bouncedViews) / totalPageViews) * 100,
                )
              : 0,
        },
      };
    } catch (error) {
      fastify.log.error(error, "Error fetching analytics funnel");
      return reply.code(500).send({
        error: "Internal Server Error",
        message: "Failed to fetch analytics funnel",
        statusCode: 500,
      });
    }
  });
};

export default analyticsRoutes;
