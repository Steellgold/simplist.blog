import { getRedis } from './redis'

export interface AnalyticsCacheData {
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

export interface AnalyticsCacheMultiPeriod {
  [key: string]: AnalyticsCacheData // '7', '30', '90'
}

const CACHE_PREFIX = 'analytics:'
const CACHE_TTL = 300 // 5 minutes

export const analyticsCacheUtils = {
  // Get cache key for project analytics
  getCacheKey: (projectId: string): string => {
    return `${CACHE_PREFIX}${projectId}`
  },

  // Get cached analytics data for all periods
  get: async (projectId: string): Promise<AnalyticsCacheMultiPeriod | null> => {
    try {
      const redis = getRedis()
      const key = analyticsCacheUtils.getCacheKey(projectId)
      const cached = await redis.get(key)
      
      if (!cached) {
        return null
      }

      const cacheString = typeof cached === 'string' ? cached : JSON.stringify(cached)
      return JSON.parse(cacheString)
    } catch (error) {
      console.error('Failed to get analytics from cache:', error)
      return null
    }
  },

  // Set analytics data in cache
  set: async (projectId: string, data: AnalyticsCacheMultiPeriod): Promise<void> => {
    try {
      const redis = getRedis()
      const key = analyticsCacheUtils.getCacheKey(projectId)
      
      // Data is already serialized properly
      await redis.setex(key, CACHE_TTL, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to set analytics in cache:', error)
    }
  },

  // Invalidate cache for project
  invalidate: async (projectId: string): Promise<void> => {
    try {
      const redis = getRedis()
      const key = analyticsCacheUtils.getCacheKey(projectId)
      await redis.del(key)
    } catch (error) {
      console.error('Failed to invalidate analytics cache:', error)
    }
  },

  // Invalidate all analytics caches (useful for bulk operations)
  invalidateAll: async (): Promise<void> => {
    try {
      const redis = getRedis()
      const keys = await redis.keys(`${CACHE_PREFIX}*`)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error('Failed to invalidate all analytics caches:', error)
    }
  }
}