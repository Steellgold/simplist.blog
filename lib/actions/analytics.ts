'use server'

import { prisma } from '@/lib/db'

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
    timestamp: Date
  }>
}

export const getProjectAnalytics = async (projectId: string, days: number = 30): Promise<AnalyticsData> => {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Get total views and unique visitors
  const totalViews = await prisma.pageView.count({
    where: {
      projectId,
      timestamp: { gte: startDate }
    }
  })

  const uniqueVisitors = await prisma.pageView.findMany({
    where: {
      projectId,
      timestamp: { gte: startDate }
    },
    select: { visitorId: true },
    distinct: ['visitorId']
  })

  // Get average metrics
  const avgMetrics = await prisma.pageView.aggregate({
    where: {
      projectId,
      timestamp: { gte: startDate },
      timeOnPage: { not: null }
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
      bounced: true
    }
  })

  // Get top articles
  const topArticlesData = await prisma.pageView.groupBy({
    by: ['articleId'],
    where: {
      projectId,
      timestamp: { gte: startDate }
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
  const articleIds = topArticlesData.map(a => a.articleId)
  const articles = await prisma.article.findMany({
    where: { id: { in: articleIds } },
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
      country: { not: null }
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
      device: { not: null }
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
      browser: { not: null }
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
        timestamp: { gte: dayStart, lt: dayEnd }
      }
    })

    const dayUniqueVisitors = await prisma.pageView.findMany({
      where: {
        projectId,
        timestamp: { gte: dayStart, lt: dayEnd }
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
      timestamp: { gte: startDate }
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
    timestamp: rv.timestamp
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