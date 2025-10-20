'use server'

import { analyticsCacheUtils, prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

export interface AnalyticsData {
  summary: {
    totalViews: number
    uniqueVisitors: number
    avgViewsPerVisitor: number
    avgTimeOnPage: number
    avgScrollDepth: number
    bounceRate: number
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
  viewsByDate.forEach(({ timestamp, _count }) => {
    const dateStr = timestamp.toISOString().split('T')[0]
    viewsMap.set(dateStr, (viewsMap.get(dateStr) || 0) + _count._all)
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
  metricsByDate.forEach(({ timestamp, _count, _avg }) => {
    const dateStr = timestamp.toISOString().split('T')[0]
    metricsMap.set(dateStr, {
      uniqueVisitors: _count.visitorId,
      avgTimeOnPage: Math.round(_avg.timeOnPage || 0)
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
    WHERE "articleId" = ANY(${articleIds})
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
        dataMap.set(row.date, {
          views: Number(row.views),
          uniqueVisitors: Number(row.uniquevisitors),
          avgTimeOnPage: Math.round(row.avgtimeonpage || 0)
        })
      })

    // Create full array with all dates (fill missing with 0)
    const viewsOverTime = dateArray.map(date => {
      const data = dataMap.get(date) || { views: 0, uniqueVisitors: 0, avgTimeOnPage: 0 }
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
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
  // Try to get from cache first
  const useCache = !articleIds || articleIds.length === 0
  const cached = useCache ? await analyticsCacheUtils.get(projectId) : null
  if (cached && useCache) {
    console.log('Analytics cache hit for project:', projectId)
    return cached
  }

  console.log('Analytics cache miss for project:', projectId, '- computing fresh data')
  
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
    uniqueVisitors,
    avgMetrics,
    bouncedViews,
    topArticlesData,
    topCountriesData,
    deviceStatsData,
    browserStatsData,
    topReferrersData,
    directTrafficCount,
    viewsOverTimeData,
    recentViewsData
  ] = await Promise.all([
    // Total views
    prisma.pageView.count({ where: baseWhere }),
    
    // Unique visitors
    prisma.pageView.findMany({
      where: baseWhere,
      select: { visitorId: true },
      distinct: ['visitorId']
    }),
    
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
    }),
    
    // Top countries
    prisma.pageView.groupBy({
      by: ['country'],
      where: { ...baseWhere, country: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    }),
    
    // Device stats
    prisma.pageView.groupBy({
      by: ['device'],
      where: { ...baseWhere, device: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    }),
    
    // Browser stats
    prisma.pageView.groupBy({
      by: ['browser'],
      where: { ...baseWhere, browser: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    }),

    // Top referrers
    prisma.pageView.groupBy({
      by: ['referrerDomain'],
      where: { ...baseWhere, referrerDomain: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    }),

    // Direct traffic (no referrer)
    prisma.pageView.count({
      where: { ...baseWhere, referrerDomain: null }
    }),

    // Views over time with SQL raw query for better performance
    // Note: PostgreSQL returns column names in lowercase in raw queries
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
        ${articleIds && articleIds.length ?
          Prisma.sql`AND p."articleId" = ANY(${articleIds})` :
          Prisma.empty
        }
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
      LIMIT ${days}
    `,
    
    // Recent views
    prisma.pageView.findMany({
      where: baseWhere,
      include: { article: { select: { title: true } } },
      orderBy: { timestamp: 'desc' },
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
      title: article?.title || 'Unknown',
      slug: article?.slug || '',
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

  const deviceStats = deviceStatsData.map(ds => ({
    device: ds.device || 'Unknown',
    views: ds._count.id,
    percentage: Math.round((ds._count.id / totalViews) * 100)
  }))

  const browserStats = browserStatsData.map(bs => ({
    browser: bs.browser || 'Unknown',
    views: bs._count.id,
    percentage: Math.round((bs._count.id / totalViews) * 100)
  }))

  // Combine referrers with direct traffic
  const topReferrers = [
    ...topReferrersData.map(tr => ({
      referrer: tr.referrerDomain || 'Direct',
      views: tr._count.id,
      percentage: Math.round((tr._count.id / totalViews) * 100)
    })),
    // Add direct traffic if it exists
    ...(directTrafficCount > 0 ? [{
      referrer: 'Direct',
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
      // PostgreSQL DATE returns a Date object that needs to be converted to ISO string
      const dateStr = row.date instanceof Date
        ? row.date.toISOString().split('T')[0]
        : (typeof row.date === 'string' ? row.date.split('T')[0] : row.date)

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
    const dateStr = date.toISOString().split('T')[0]
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
    country: rv.country || 'Unknown',
    device: rv.device || 'Unknown',
    browser: rv.browser || 'Unknown',
    timeOnPage: rv.timeOnPage || 0,
    scrollDepth: rv.scrollDepth || 0,
    timestamp: rv.timestamp.toISOString(),
    referrer: rv.referrer,
    referrerDomain: rv.referrerDomain,
    utmSource: rv.utmSource,
    utmMedium: rv.utmMedium,
    utmCampaign: rv.utmCampaign
  }))

  return {
    summary: {
      totalViews,
      uniqueVisitors: uniqueVisitors.length,
      avgViewsPerVisitor: uniqueVisitors.length > 0 ? Math.round((totalViews / uniqueVisitors.length) * 100) / 100 : 0,
      avgTimeOnPage: Math.round(avgMetrics._avg.timeOnPage || 0),
      avgScrollDepth: Math.round(avgMetrics._avg.scrollDepth || 0),
      bounceRate: totalViews > 0 ? Math.round((bouncedViews / totalViews) * 100) : 0
    },
    topArticles,
    topCountries,
    deviceStats,
    browserStats,
    topReferrers,
    viewsOverTime,
    recentViews
  }
}