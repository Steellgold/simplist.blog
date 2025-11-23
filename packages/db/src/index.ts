export { prisma } from './client'
export { getRedis, apiKeyCache } from './redis'
export { analyticsCacheUtils } from './analytics-cache'
export * from '../generated/client'

// Re-export Prisma namespace explicitly
export { Prisma } from '../generated/client'

// Re-export useful types for the API and SDK
export type {
  User,
  Project,
  Article,
  ApiKey
} from '../generated/client'

export type { AnalyticsCacheData, AnalyticsCacheMultiPeriod } from './analytics-cache'