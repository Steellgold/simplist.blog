'use server'

import { analyticsCacheUtils, prisma } from '@/lib/db'

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

  // Get total views and unique visitors
  const totalViews = await prisma.pageView.count({
    where: {
      projectId,
      timestamp: { gte: startDate },
      article: { deletedAt: null },
      ...(articleIds && articleIds.length ? { articleId: { in: articleIds } } : {})
    }
  })

  const uniqueVisitors = await prisma.pageView.findMany({
    where: {
      projectId,
      timestamp: { gte: startDate },
      article: { deletedAt: null },
      ...(articleIds && articleIds.length ? { articleId: { in: articleIds } } : {})
    },
    select: { visitorId: true },
    distinct: ['visitorId']
  })

  // Get average metrics
  const avgMetrics = await prisma.pageView.aggregate({
    where: {
      projectId,
      timestamp: { gte: startDate },
      timeOnPage: { not: null },
      article: { deletedAt: null },
      ...(articleIds && articleIds.length ? { articleId: { in: articleIds } } : {})
    },
    _avg: {
      timeOnPage: true,
      scrollDepth: true
    }
  })

  // Get bounce rate
  const bouncedViews = await prisma.pageView.count({
    where: {
      projectId,
      timestamp: { gte: startDate },
      bounced: true,
      article: { deletedAt: null },
      ...(articleIds && articleIds.length ? { articleId: { in: articleIds } } : {})
    }
  })

  // Get top articles
  const topArticlesData = await prisma.pageView.groupBy({
    by: ['articleId'],
    where: {
      projectId,
      timestamp: { gte: startDate },
      article: { deletedAt: null },
      ...(articleIds && articleIds.length ? { articleId: { in: articleIds } } : {})
    },
    _count: { id: true },
    _avg: {
      timeOnPage: true,
      scrollDepth: true
    },
    orderBy: { _count: { id: 'desc' } },
    take: 10
  })

  // Get article details
  const topArticleIds = topArticlesData.map(a => a.articleId)
  const articles = await prisma.article.findMany({
    where: { id: { in: topArticleIds }, deletedAt: null },
    select: { id: true, title: true, slug: true }
  })

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

  // Get top countries
  const topCountriesData = await prisma.pageView.groupBy({
    by: ['country'],
    where: {
      projectId,
      timestamp: { gte: startDate },
      country: { not: null },
      article: { deletedAt: null },
      ...(articleIds && articleIds.length ? { articleId: { in: articleIds } } : {})
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10
  })

  const topCountries = topCountriesData.map(tc => ({
    country: tc.country || 'Unknown',
    views: tc._count.id,
    percentage: Math.round((tc._count.id / totalViews) * 100)
  }))

  // Get device stats
  const deviceStatsData = await prisma.pageView.groupBy({
    by: ['device'],
    where: {
      projectId,
      timestamp: { gte: startDate },
      device: { not: null },
      article: { deletedAt: null },
      ...(articleIds && articleIds.length ? { articleId: { in: articleIds } } : {})
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  })

  const deviceStats = deviceStatsData.map(ds => ({
    device: ds.device || 'Unknown',
    views: ds._count.id,
    percentage: Math.round((ds._count.id / totalViews) * 100)
  }))

  // Get browser stats
  const browserStatsData = await prisma.pageView.groupBy({
    by: ['browser'],
    where: {
      projectId,
      timestamp: { gte: startDate },
      browser: { not: null },
      article: { deletedAt: null },
      ...(articleIds && articleIds.length ? { articleId: { in: articleIds } } : {})
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5
  })

  const browserStats = browserStatsData.map(bs => ({
    browser: bs.browser || 'Unknown',
    views: bs._count.id,
    percentage: Math.round((bs._count.id / totalViews) * 100)
  }))

  // Get views over time (daily breakdown)
  const viewsOverTime = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const dayViews = await prisma.pageView.count({
      where: {
        projectId,
        timestamp: { gte: dayStart, lt: dayEnd },
        article: { deletedAt: null },
        ...(articleIds && articleIds.length ? { articleId: { in: articleIds } } : {})
      }
    })

    const dayUniqueVisitors = await prisma.pageView.findMany({
      where: {
        projectId,
        timestamp: { gte: dayStart, lt: dayEnd },
        article: { deletedAt: null },
        ...(articleIds && articleIds.length ? { articleId: { in: articleIds } } : {})
      },
      select: { visitorId: true },
      distinct: ['visitorId']
    })

    viewsOverTime.push({
      date: dayStart.toISOString().split('T')[0],
      views: dayViews,
      uniqueVisitors: dayUniqueVisitors.length
    })
  }

  // Get recent views
  const recentViewsData = await prisma.pageView.findMany({
    where: {
      projectId,
      timestamp: { gte: startDate },
      article: { deletedAt: null },
      ...(articleIds && articleIds.length ? { articleId: { in: articleIds } } : {})
    },
    include: {
      article: {
        select: { title: true }
      }
    },
    orderBy: { timestamp: 'desc' },
    take: 20
  })

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