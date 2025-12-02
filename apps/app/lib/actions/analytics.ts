"use server"

import { getCurrentUser } from '@/lib/auth-helper'
import { hasProjectAccess } from '@/lib/auth/permissions'
import { analyticsCacheUtils, apiKeyCache, prisma, Prisma } from '@simplist/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export interface AnalyticsData {
  summary: {
    totalViews: number
    uniqueVisitors: number
    avgViewsPerVisitor: number
    avgTimeOnPage: number
    avgScrollDepth: number
    bounceRate: number
  }
  requestSource: {
    sdk: {
      count: number
      percentage: number
    }
    direct: {
      count: number
      percentage: number
    }
  }
  topArticles: Array<{
    id: string
    title: string
    slug: string
    views: number
    avgTimeOnPage: number
    avgScrollDepth: number
  }>
  topCountries: Array<{
    country: string
    views: number
    percentage: number
  }>
  topCities: Array<{
    city: string
    country: string
    countryCode: string
    views: number
    percentage: number
  }>
  topRegions: Array<{
    region: string
    country: string
    countryCode: string
    views: number
    percentage: number
  }>
  deviceStats: Array<{
    device: string
    views: number
    percentage: number
  }>
  browserStats: Array<{
    browser: string
    views: number
    percentage: number
  }>
  topReferrers: Array<{
    referrer: string
    views: number
    percentage: number
  }>
  viewsOverTime: Array<{
    date: string
    views: number
    uniqueVisitors: number
    avgTimeOnPage: number
  }>
  recentViews: Array<{
    id: string
    articleTitle: string
    country: string
    device: string
    browser: string
    timeOnPage: number
    scrollDepth: number
    timestamp: string
    referrer: string | null
    referrerDomain: string | null
    utmSource: string | null
    utmMedium: string | null
    utmCampaign: string | null
  }>
}

export interface AnalyticsDataMultiPeriod {
  [key: string]: AnalyticsData // '7', '30', '90'
}

export interface ArticleViewsOverTime {
  date: string
  views: number
  uniqueVisitors: number
  avgTimeOnPage: number
}

export const getArticleViewsOverTime = async (
  articleId: string,
  days: number = 7
): Promise<ArticleViewsOverTime[]> => {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Generate array of last N days
  const dateArray = Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    return date.toISOString().split('T')[0]
  })

  // Get views by date for this article
  const viewsByDate = await prisma.pageView.groupBy({
    by: ['timestamp'],
    where: {
      articleId,
      timestamp: { gte: startDate }
    },
    _count: { _all: true }
  })

  // Map to date strings with counts
  const viewsMap = new Map<string, number>()
  viewsByDate.forEach((item) => {
    const dateStr = item.timestamp.toISOString().split('T')[0]
    viewsMap.set(dateStr, (viewsMap.get(dateStr) || 0) + item._count._all)
  })

  // Get additional metrics for each date
  const metricsByDate = await prisma.pageView.groupBy({
    by: ['timestamp'],
    where: {
      articleId,
      timestamp: { gte: startDate }
    },
    _count: { visitorId: true },
    _avg: { timeOnPage: true }
  })

  // Map to date strings with metrics
  const metricsMap = new Map<string, { uniqueVisitors: number; avgTimeOnPage: number }>()
  metricsByDate.forEach((item) => {
    const dateStr = item.timestamp.toISOString().split('T')[0]
    metricsMap.set(dateStr, {
      uniqueVisitors: item._count.visitorId,
      avgTimeOnPage: Math.round(item._avg.timeOnPage || 0)
    })
  })

  // Return data for all days (fill missing days with 0)
  return dateArray.map(date => {
    const metrics = metricsMap.get(date) || { uniqueVisitors: 0, avgTimeOnPage: 0 }
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: viewsMap.get(date) || 0,
      uniqueVisitors: metrics.uniqueVisitors,
      avgTimeOnPage: metrics.avgTimeOnPage
    }
  })
}

// Optimized batch query to get views over time for multiple articles at once
export const getBatchArticleViewsOverTime = async (
  articleIds: string[],
  days: number = 7
): Promise<Map<string, ArticleViewsOverTime[]>> => {
  if (articleIds.length === 0) {
    return new Map()
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Generate array of last N days
  const dateArray = Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    return date.toISOString().split('T')[0]
  })

  // Single optimized query with raw SQL for better performance
  // Note: PostgreSQL returns column names in lowercase in raw queries
  const viewsByArticleAndDate = await prisma.$queryRaw<Array<{
    articleId: string
    date: string
    views: bigint
    uniquevisitors: bigint
    avgtimeonpage: number | null
  }>>`
    SELECT
      "articleId",
      DATE(timestamp) as date,
      COUNT(*) as views,
      COUNT(DISTINCT "visitorId") as uniquevisitors,
      AVG("timeOnPage") as avgtimeonpage
    FROM "page_view"
    WHERE "articleId" = ANY(ARRAY[${Prisma.join(articleIds)}]::text[])
      AND timestamp >= ${startDate}
    GROUP BY "articleId", DATE(timestamp)
    ORDER BY "articleId", date
  `


  // Organize data by article ID
  const resultMap = new Map<string, ArticleViewsOverTime[]>()

  // Initialize all articles with empty data
  articleIds.forEach(articleId => {
    const dataMap = new Map<string, { views: number; uniqueVisitors: number; avgTimeOnPage: number }>()

    // Fill with data from query
    viewsByArticleAndDate
      .filter(row => row.articleId === articleId)
      .forEach(row => {
        // PostgreSQL DATE returns a string in ISO format
        const dateStr = typeof row.date === "string"
          ? row.date.split("T")[0]
          : String(row.date).split("T")[0]

        dataMap.set(dateStr, {
          views: Number(row.views),
          uniqueVisitors: Number(row.uniquevisitors),
          avgTimeOnPage: Math.round(row.avgtimeonpage || 0)
        })
      })

    // Create full array with all dates (fill missing with 0)
    const viewsOverTime = dateArray.map(date => {
      const data = dataMap.get(date) || { views: 0, uniqueVisitors: 0, avgTimeOnPage: 0 }
      return {
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        views: data.views,
        uniqueVisitors: data.uniqueVisitors,
        avgTimeOnPage: data.avgTimeOnPage
      }
    })

    resultMap.set(articleId, viewsOverTime)
  })

  return resultMap
}

// Load all analytics periods at once to avoid page reloads
export const getAllProjectAnalytics = async (projectId: string, articleIds?: string[]): Promise<AnalyticsDataMultiPeriod> => {
  // Try to get from cache first (disabled temporarily for new city/region data)
  const useCache = false // !articleIds || articleIds.length === 0
  const cached = useCache ? await analyticsCacheUtils.get(projectId) : null

  if (cached && useCache) {
    return cached
  }
  
  const periods = [7, 30, 90]
  const result: AnalyticsDataMultiPeriod = {}
  
  // Load all periods in parallel for better performance
  const analyticsPromises = periods.map(async (days) => {
    const data = await getProjectAnalytics(projectId, days, articleIds)
    return { days: days.toString(), data }
  })
  
  const analyticsResults = await Promise.all(analyticsPromises)
  
  analyticsResults.forEach(({ days, data }) => {
    result[days] = data
  })
  
  // Cache the computed result (only when not filtered)
  if (useCache) {
    await analyticsCacheUtils.set(projectId, result)
  }
  
  return result
}

export const getProjectAnalytics = async (projectId: string, days: number = 30, articleIds?: string[]): Promise<AnalyticsData> => {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const baseWhere = {
    projectId,
    timestamp: { gte: startDate },
    article: { deletedAt: null },
    ...(articleIds && articleIds.length ? { articleId: { in: articleIds } } : {})
  }

  // Execute all queries in parallel for better performance
  const [
    totalViews,
    uniqueVisitorsCount,
    avgMetrics,
    bouncedViews,
    topArticlesData,
    topCountriesData,
    topCitiesData,
    topRegionsData,
    deviceStatsData,
    browserStatsData,
    topReferrersData,
    directTrafficCount,
    requestSourceStatsData,
    viewsOverTimeData,
    recentViewsData
  ] = await Promise.all([
    // Total views
    prisma.pageView.count({ where: baseWhere }),

    // Unique visitors - optimized with raw query to avoid loading all records
    prisma.$queryRaw<[{ count: bigint }]>(
      articleIds && articleIds.length ?
        Prisma.sql`
          SELECT COUNT(DISTINCT "visitorId") as count
          FROM "page_view"
          WHERE "projectId" = ${projectId}
          AND timestamp >= ${startDate}
          AND "articleId" = ANY(ARRAY[${Prisma.join(articleIds)}]::text[])
        ` :
        Prisma.sql`
          SELECT COUNT(DISTINCT "visitorId") as count
          FROM "page_view"
          WHERE "projectId" = ${projectId}
          AND timestamp >= ${startDate}
        `
    ).then((result) => Number(result[0]?.count ?? 0)),
    
    // Average metrics
    prisma.pageView.aggregate({
      where: { ...baseWhere, timeOnPage: { not: null } },
      _avg: { timeOnPage: true, scrollDepth: true }
    }),
    
    // Bounced views
    prisma.pageView.count({
      where: { ...baseWhere, bounced: true }
    }),
    
    // Top articles
    prisma.pageView.groupBy({
      by: ['articleId'],
      where: baseWhere,
      _count: { id: true },
      _avg: { timeOnPage: true, scrollDepth: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    }) as unknown as Promise<Array<{
      articleId: string
      _count: { id: number }
      _avg: { timeOnPage: number | null; scrollDepth: number | null }
    }>>,

    // Top countries
    prisma.pageView.groupBy({
      by: ['country'],
      where: { ...baseWhere, country: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    }) as unknown as Promise<Array<{
      country: string | null
      _count: { id: number }
    }>>,

    // Top cities with country info
    prisma.pageView.groupBy({
      by: ['city', 'country', 'countryCode'],
      where: { ...baseWhere, city: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    }) as unknown as Promise<Array<{
      city: string | null
      country: string | null
      countryCode: string | null
      _count: { id: number }
    }>>,

    // Top regions with country info
    prisma.pageView.groupBy({
      by: ['region', 'country', 'countryCode'],
      where: { ...baseWhere, region: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    }) as unknown as Promise<Array<{
      region: string | null
      country: string | null
      countryCode: string | null
      _count: { id: number }
    }>>,

    // Device stats
    prisma.pageView.groupBy({
      by: ['device'],
      where: { ...baseWhere, device: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    }) as unknown as Promise<Array<{
      device: string | null
      _count: { id: number }
    }>>,

    // Browser stats
    prisma.pageView.groupBy({
      by: ['browser'],
      where: { ...baseWhere, browser: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    }) as unknown as Promise<Array<{
      browser: string | null
      _count: { id: number }
    }>>,

    // Top referrers
    prisma.pageView.groupBy({
      by: ['referrerDomain'],
      where: { ...baseWhere, referrerDomain: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    }) as unknown as Promise<Array<{
      referrerDomain: string | null
      _count: { id: number }
    }>>,

    // Direct traffic (no referrer)
    prisma.pageView.count({
      where: { ...baseWhere, referrerDomain: null }
    }),

    // Request source stats (SDK vs Direct)
    prisma.pageView.groupBy({
      by: ['requestSource'],
      where: baseWhere,
      _count: { id: true }
    }) as unknown as Promise<Array<{
      requestSource: string
      _count: { id: number }
    }>>,

    // Views over time with SQL raw query for better performance
    // Note: PostgreSQL returns column names in lowercase in raw queries
    (articleIds && articleIds.length ?
      prisma.$queryRaw<Array<{ date: string; views: bigint; uniquevisitors: bigint; avgtimeonpage: number | null }>>`
        SELECT
          DATE(timestamp) as date,
          COUNT(*) as views,
          COUNT(DISTINCT "visitorId") as uniquevisitors,
          AVG("timeOnPage") as avgtimeonpage
        FROM "page_view" p
        INNER JOIN "article" a ON p."articleId" = a.id
        WHERE p."projectId" = ${projectId}
          AND p.timestamp >= ${startDate}
          AND a."deletedAt" IS NULL
          AND p."articleId" = ANY(ARRAY[${Prisma.join(articleIds)}]::text[])
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
        LIMIT ${days}
      ` :
      prisma.$queryRaw<Array<{ date: string; views: bigint; uniquevisitors: bigint; avgtimeonpage: number | null }>>`
        SELECT
          DATE(timestamp) as date,
          COUNT(*) as views,
          COUNT(DISTINCT "visitorId") as uniquevisitors,
          AVG("timeOnPage") as avgtimeonpage
        FROM "page_view" p
        INNER JOIN "article" a ON p."articleId" = a.id
        WHERE p."projectId" = ${projectId}
          AND p.timestamp >= ${startDate}
          AND a."deletedAt" IS NULL
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
        LIMIT ${days}
      `
    ),
    
    // Recent views
    prisma.pageView.findMany({
      where: baseWhere,
      include: { article: { select: { title: true } } },
      orderBy: { timestamp: "desc" },
      take: 20
    })
  ])

  // Get article details for top articles
  const topArticleIds = topArticlesData.map(a => a.articleId)
  const articles = topArticleIds.length > 0 ? await prisma.article.findMany({
    where: { id: { in: topArticleIds }, deletedAt: null },
    select: { id: true, title: true, slug: true }
  }) : []

  // Process results
  const topArticles = topArticlesData.map(ta => {
    const article = articles.find(a => a.id === ta.articleId)
    return {
      id: ta.articleId,
      title: article?.title || "Unknown",
      slug: article?.slug || "",
      views: ta._count.id,
      avgTimeOnPage: Math.round(ta._avg.timeOnPage || 0),
      avgScrollDepth: Math.round(ta._avg.scrollDepth || 0)
    }
  })

  const topCountries = topCountriesData.map(tc => ({
    country: tc.country || 'Unknown',
    views: tc._count.id,
    percentage: Math.round((tc._count.id / totalViews) * 100)
  }))

  const topCities = topCitiesData.map(tc => ({
    city: tc.city || "Unknown",
    country: tc.country || "Unknown",
    countryCode: tc.countryCode || '',
    views: tc._count.id,
    percentage: Math.round((tc._count.id / totalViews) * 100)
  }))

  const topRegions = topRegionsData.map(tr => ({
    region: tr.region || "Unknown",
    country: tr.country || "Unknown",
    countryCode: tr.countryCode || '',
    views: tr._count.id,
    percentage: Math.round((tr._count.id / totalViews) * 100)
  }))

  const deviceStats = deviceStatsData.map(ds => ({
    device: ds.device || "Unknown",
    views: ds._count.id,
    percentage: Math.round((ds._count.id / totalViews) * 100)
  }))

  const browserStats = browserStatsData.map(bs => ({
    browser: bs.browser || "Unknown",
    views: bs._count.id,
    percentage: Math.round((bs._count.id / totalViews) * 100)
  }))

  // Combine referrers with direct traffic
  const topReferrers = [
    ...topReferrersData.map(tr => ({
      referrer: tr.referrerDomain || "Direct",
      views: tr._count.id,
      percentage: Math.round((tr._count.id / totalViews) * 100)
    })),
    // Add direct traffic if it exists
    ...(directTrafficCount > 0 ? [{
      referrer: "Direct",
      views: directTrafficCount,
      percentage: Math.round((directTrafficCount / totalViews) * 100)
    }] : [])
  ]
  // Sort by views descending and take top 10
  .sort((a, b) => b.views - a.views)
  .slice(0, 10)

  // Process views over time data and fill missing dates
  const viewsOverTimeMap = new Map(
    viewsOverTimeData.map(row => {
      // PostgreSQL DATE returns a string in ISO format
      const dateStr = typeof row.date === "string"
        ? row.date.split("T")[0]
        : (row.date as Date).toISOString().split("T")[0]

      return [
        dateStr,
        {
          views: Number(row.views),
          uniqueVisitors: Number(row.uniquevisitors),
          avgTimeOnPage: Math.round(row.avgtimeonpage || 0)
        }
      ]
    })
  )

  const viewsOverTime = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    // Force to midnight UTC to ensure consistent date strings
    date.setUTCHours(0, 0, 0, 0)
    const dateStr = date.toISOString().split("T")[0]
    const data = viewsOverTimeMap.get(dateStr) || { views: 0, uniqueVisitors: 0, avgTimeOnPage: 0 }
    
    viewsOverTime.push({
      date: dateStr,
      views: data.views,
      uniqueVisitors: data.uniqueVisitors,
      avgTimeOnPage: data.avgTimeOnPage
    })
  }

  // Process recent views data (already fetched in parallel above)
  const recentViews = recentViewsData.map(rv => ({
    id: rv.id,
    articleTitle: rv.article.title,
    country: rv.country || "Unknown",
    device: rv.device || "Unknown",
    browser: rv.browser || "Unknown",
    timeOnPage: rv.timeOnPage || 0,
    scrollDepth: rv.scrollDepth || 0,
    timestamp: rv.timestamp.toISOString(),
    referrer: rv.referrer,
    referrerDomain: rv.referrerDomain,
    utmSource: rv.utmSource,
    utmMedium: rv.utmMedium,
    utmCampaign: rv.utmCampaign
  }))

  // Process request source stats
  const sdkViews = requestSourceStatsData.find(s => s.requestSource === "sdk")?._count.id || 0
  const directViews = requestSourceStatsData.find(s => s.requestSource === "direct")?._count.id || 0
  const sdkPercentage = totalViews > 0 ? Math.round((sdkViews / totalViews) * 100) : 0
  const directPercentage = totalViews > 0 ? Math.round((directViews / totalViews) * 100) : 0

  return {
    summary: {
      totalViews,
      uniqueVisitors: uniqueVisitorsCount,
      avgViewsPerVisitor: uniqueVisitorsCount > 0 ? Math.round((totalViews / uniqueVisitorsCount) * 100) / 100 : 0,
      avgTimeOnPage: Math.round(avgMetrics._avg.timeOnPage || 0),
      avgScrollDepth: Math.round(avgMetrics._avg.scrollDepth || 0),
      bounceRate: totalViews > 0 ? Math.round((bouncedViews / totalViews) * 100) : 0
    },
    requestSource: {
      sdk: {
        count: sdkViews,
        percentage: sdkPercentage
      },
      direct: {
        count: directViews,
        percentage: directPercentage
      }
    },
    topArticles,
    topCountries,
    topCities,
    topRegions,
    deviceStats,
    browserStats,
    topReferrers,
    viewsOverTime,
    recentViews
  }
}

// Generate a random API key
const generateApiKey = (): string => {
  const prefix = "prj"
  const randomBytes = crypto.getRandomValues(new Uint8Array(32))
  const key = Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
  return `${prefix}_${key}`
}

export const enableAnalytics = async (projectId: string) => {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verify user has access to this project (either as owner or member)
  const hasAccess = await hasProjectAccess(projectId, user.id);
  if (!hasAccess) {
    throw new Error("Project not found or you don't have permission")
  }


  // Check if analytics API key already exists
  const existingApiKey = await prisma.apiKey.findFirst({
    where: {
      projectId: projectId,
      permissions: {
        has: "analytics",
      },
      status: "active",
    },
  })

  if (existingApiKey) {
    return {
      success: true,
      apiKey: existingApiKey.key,
    }
  }

  // Generate a new API key for analytics
  const apiKey = generateApiKey()

  const newApiKey = await prisma.apiKey.create({
    data: {
      name: "Analytics API Key",
      key: apiKey,
      permissions: ["analytics"],
      projectId: projectId,
      status: "active",
    },
  })

  // Invalidate cache for the new API key (fire and forget)
  apiKeyCache.invalidate(apiKey).catch(() => {
    // Ignore cache invalidation errors
  })

  revalidatePath("/analytics")

  return {
    success: true,
    apiKey: newApiKey.key,
  }
}

export const getAnalyticsApiKey = async (projectId: string) => {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verify user has access to this project (either as owner or member)
  const hasAccess = await hasProjectAccess(projectId, user.id);
  if (!hasAccess) {
    throw new Error("Project not found or you don't have permission")
  }

  // Get the analytics API key for this project
  const apiKey = await prisma.apiKey.findFirst({
    where: {
      projectId: projectId,
      type: "public",
      permissions: {
        has: "analytics",
      },
      status: "active",
    },
  })

  if (!apiKey) {
    throw new Error("No analytics API key found for this project")
  }

  return {
    apiKey: apiKey.key,
  }
}