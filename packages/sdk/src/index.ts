// Main exports
export { SimplistClient } from './client'
export type { SimplistClientOptions } from './client'

// Error classes
export { SimplistApiError } from './utils/http'

// Type exports
export type {
  ApiResponse,
  ApiError,
  Article,
  ArticleListItem,
  Project,
  ProjectStats,
  ProjectInfo,
  ArticleListParams
} from './types/api'

// Analytics types
export type {
  PageViewData,
  PageEvent,
  PageViewResponse,
  AnalyticsStats
} from './resources/analytics'

// SEO types
export type {
  SeoMetadata,
  ArticleWithSeo,
  SitemapEntry,
  Sitemap,
  StructuredDataResponse
} from './resources/seo'

