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
  viewsOverTime: Array<{
    date: string
    views: number
    uniqueVisitors: number
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
  }>
}

export interface AnalyticsDataMultiPeriod {
  [key: string]: AnalyticsData // '7', '30', '90'
}

export interface ArticleViewsOverTime {
  date: string
  views: number
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

  // Return data for all days (fill missing days with 0)
  return dateArray.map(date => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    views: viewsMap.get(date) || 0
  }))
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
    
    // Views over time with SQL raw query for better performance
    prisma.$queryRaw<Array<{ date: string; views: bigint; uniqueVisitors: bigint }>>`
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as views,
        COUNT(DISTINCT "visitorId") as uniqueVisitors
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

  // Process views over time data and fill missing dates
  const viewsOverTimeMap = new Map(
    viewsOverTimeData.map(row => [
      row.date,
      { views: Number(row.views), uniqueVisitors: Number(row.uniqueVisitors) }
    ])
  )

  const viewsOverTime = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const data = viewsOverTimeMap.get(dateStr) || { views: 0, uniqueVisitors: 0 }
    viewsOverTime.push({
      date: dateStr,
      views: data.views,
      uniqueVisitors: data.uniqueVisitors
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
    timestamp: rv.timestamp.toISOString()
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
    viewsOverTime,
    recentViews
  }
}