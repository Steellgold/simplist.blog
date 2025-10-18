import * as db from '@simplist/db'
import { FastifyPluginAsync } from 'fastify'
import crypto from 'crypto'
import { isBot, getBotInfo } from '../utils/bot-detection'

const { prisma } = db

// Helper to generate visitor ID from IP and User Agent
const generateVisitorId = (ip: string, userAgent: string): string => {
  return crypto.createHash('sha256').update(`${ip}:${userAgent}`).digest('hex').substring(0, 16)
}

// Note: IP addresses are not stored for privacy reasons
// We only use them temporarily to generate unique visitor IDs

// Helper to parse user agent
const parseUserAgent = (userAgent: string) => {
  // Simple user agent parsing - in production, consider using a library like 'ua-parser-js'
  const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent)
  const isTablet = /iPad|Tablet/.test(userAgent)
  const device = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop'
  
  let browser = 'Unknown'
  let os = 'Unknown'
  
  if (userAgent.includes('Chrome')) browser = 'Chrome'
  else if (userAgent.includes('Firefox')) browser = 'Firefox'
  else if (userAgent.includes('Safari')) browser = 'Safari'
  else if (userAgent.includes('Edge')) browser = 'Edge'
  
  if (userAgent.includes('Windows')) os = 'Windows'
  else if (userAgent.includes('Mac')) os = 'macOS'
  else if (userAgent.includes('Linux')) os = 'Linux'
  else if (userAgent.includes('Android')) os = 'Android'
  else if (userAgent.includes('iOS')) os = 'iOS'
  
  return { device, browser, os }
}

const analyticsRoutes: FastifyPluginAsync = async (fastify) => {
  // Override auth for analytics routes
  await fastify.register(import('../plugins/analytics-auth'))
  
  // POST /analytics/track - Track page view and events
  fastify.post('/analytics/track', async (request, reply) => {
    const body = request.body as any
    const projectId = request.apiKey!.projectId
    const userAgent = request.headers['user-agent'] || ''
    const forwardedFor = request.headers['x-forwarded-for'] as string
    const realIp = request.headers['x-real-ip'] as string
    const clientIp = forwardedFor?.split(',')[0] || realIp || request.ip

    // Bot detection - reject bot traffic
    const botInfo = getBotInfo(userAgent)
    if (botInfo.isBot) {
      fastify.log.info(`Bot detected and blocked: ${botInfo.reason}`, { userAgent, ip: clientIp })
      return reply.code(400).send({
        error: 'Bot Detected',
        message: 'Analytics tracking is not available for automated requests',
        statusCode: 400
      })
    }

    try {
      // Validate required fields
      if (!body.articleSlug) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'articleSlug is required',
          statusCode: 400
        })
      }

      // Find the article
      const article = await prisma.article.findFirst({
        where: {
          slug: body.articleSlug,
          projectId,
          status: { not: 'deleted' },
          published: true
        }
      })

      if (!article) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Article not found or not published',
          statusCode: 404
        })
      }

      // Generate visitor ID (using IP for uniqueness but not storing it)
      const visitorId = generateVisitorId(clientIp, userAgent)
      const sessionId = body.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Parse user agent
      const userAgentInfo = parseUserAgent(userAgent)

      // Use geo data provided by client (if any)
      const geoData = {
        country: body.country || null,
        countryCode: body.countryCode || null,
        region: body.region || null,
        city: body.city || null,
        timezone: body.timezone || null
      }

      // Parse referrer domain
      let referrerDomain = null
      if (body.referrer) {
        try {
          referrerDomain = new URL(body.referrer).hostname
        } catch {
          // Invalid URL, ignore
        }
      }

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
          
          // Metadata
          pageUrl: body.pageUrl,
          pageTitle: body.pageTitle || article.title,
          timestamp: body.timestamp ? new Date(body.timestamp) : new Date()
        }
      })

      // Process events if provided
      if (body.events && Array.isArray(body.events)) {
        const events = body.events.map((event: any) => ({
          articleId: article.id,
          projectId,
          visitorId,
          sessionId,
          eventType: event.type,
          eventData: event.data || {},
          position: event.position,
          element: event.element,
          timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
          timeOffset: event.timeOffset
        }))

        await prisma.pageEvent.createMany({
          data: events
        })
      }

      return {
        success: true,
        pageViewId: pageView.id,
        visitorId,
        sessionId
      }

    } catch (error) {
      fastify.log.error(error, 'Error tracking analytics')
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to track analytics',
        statusCode: 500
      })
    }
  })

  // PUT /analytics/track/:pageViewId - Update existing page view (e.g., when user leaves)
  fastify.put('/analytics/track/:pageViewId', async (request, reply) => {
    const { pageViewId } = request.params as { pageViewId: string }
    const body = request.body as any
    const projectId = request.apiKey!.projectId
    const userAgent = request.headers['user-agent'] || ''

    // Bot detection - reject bot traffic
    const botInfo = getBotInfo(userAgent)
    if (botInfo.isBot) {
      fastify.log.info(`Bot detected and blocked on update: ${botInfo.reason}`, { userAgent, pageViewId })
      return reply.code(400).send({
        error: 'Bot Detected',
        message: 'Analytics tracking is not available for automated requests',
        statusCode: 400
      })
    }

    try {
      // Verify page view belongs to this project
      const existingPageView = await prisma.pageView.findFirst({
        where: {
          id: pageViewId,
          projectId
        }
      })

      if (!existingPageView) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Page view not found',
          statusCode: 404
        })
      }

      // Update the page view with final metrics
      await prisma.pageView.update({
        where: { id: pageViewId },
        data: {
          timeOnPage: body.timeOnPage,
          scrollDepth: body.scrollDepth,
          exitPosition: body.exitPosition,
          bounced: body.bounced || false
        }
      })

      return { success: true }

    } catch (error) {
      fastify.log.error(error, 'Error updating analytics')
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to update analytics',
        statusCode: 500
      })
    }
  })

  // GET /analytics/stats - Get analytics stats for project
  fastify.get('/analytics/stats', async (request, reply) => {
    const projectId = request.apiKey!.projectId
    const query = request.query as any
    
    // Check if key has read permissions for analytics data
    if (!request.checkPermission!('read')) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: 'API key does not have read permissions.',
        statusCode: 403
      })
    }

    try {
      const days = Number(query.days) || 30
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // Get total page views
      const totalViews = await prisma.pageView.count({
        where: {
          projectId,
          timestamp: { gte: startDate }
        }
      })

      // Get unique visitors
      const uniqueVisitors = await prisma.pageView.findMany({
        where: {
          projectId,
          timestamp: { gte: startDate }
        },
        select: { visitorId: true },
        distinct: ['visitorId']
      })

      // Get top articles
      const topArticles = await prisma.pageView.groupBy({
        by: ['articleId'],
        where: {
          projectId,
          timestamp: { gte: startDate }
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      })

      // Get article titles
      const articleIds = topArticles.map(a => a.articleId)
      const articles = await prisma.article.findMany({
        where: { id: { in: articleIds } },
        select: { id: true, title: true, slug: true }
      })

      const topArticlesWithTitles = topArticles.map(ta => {
        const article = articles.find(a => a.id === ta.articleId)
        return {
          articleId: ta.articleId,
          title: article?.title || 'Unknown',
          slug: article?.slug || '',
          views: ta._count.id
        }
      })

      // Get countries stats
      const topCountries = await prisma.pageView.groupBy({
        by: ['country'],
        where: {
          projectId,
          timestamp: { gte: startDate },
          country: { not: null }
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      })

      return {
        period: { days, startDate, endDate: new Date() },
        summary: {
          totalViews,
          uniqueVisitors: uniqueVisitors.length,
          avgViewsPerVisitor: uniqueVisitors.length > 0 ? Math.round(totalViews / uniqueVisitors.length * 100) / 100 : 0
        },
        topArticles: topArticlesWithTitles,
        topCountries: topCountries.map(tc => ({
          country: tc.country,
          views: tc._count.id
        }))
      }

    } catch (error) {
      fastify.log.error(error, 'Error fetching analytics stats')
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch analytics stats',
        statusCode: 500
      })
    }
  })
}

export default analyticsRoutes