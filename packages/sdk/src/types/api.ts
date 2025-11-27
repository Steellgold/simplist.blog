import { LanguageCode } from './languages'

// API Response types
export interface ApiResponse<T> {
  data: T
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  error: string
  message: string
  statusCode: number
  details?: any
}

// Article variant type
export interface ArticleVariant {
  lang: LanguageCode
  title: string
  excerpt: string | null
  content: string
  coverImage: string | null
  wordCount: number
  characterCount: number
  lineCount: number
  readTimeMinutes: number
  createdAt: string
  updatedAt: string
}

// Author type
export interface Author {
  name: string
  firstName: string | null
  lastName: string | null
  image: string | null
}

// Article types
export interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  coverImage: string | null
  published: boolean
  status: string
  viewCount: number
  wordCount: number
  characterCount: number
  lineCount: number
  readTimeMinutes: number
  author: Author
  lastUpdatedBy: Author | null
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  variants?: Record<LanguageCode, ArticleVariant>
}

export interface ArticleListItem extends Omit<Article, 'content'> {}

// Project types
export interface Project {
  id: string
  name: string
  slug: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface ProjectStats {
  totalArticles: number
  publishedArticles: number
  totalViews: number
  storageUsed: string
  storageLimit: string
}

export interface ProjectInfo {
  project: Project
  stats: ProjectStats
}

// Query parameters
export interface ArticleListParams {
  page?: number
  limit?: number
  sort?: 'createdAt' | 'updatedAt' | 'title'
  order?: 'asc' | 'desc'
  published?: boolean
  search?: string
  status?: 'draft' | 'published'
}