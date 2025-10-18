// Main exports
export { SimplistClient } from './client.js'
export type { SimplistClientOptions } from './client.js'

// Error classes
export { SimplistApiError } from './utils/http.js'

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
} from './types/api.js'

// Default export
export default SimplistClient