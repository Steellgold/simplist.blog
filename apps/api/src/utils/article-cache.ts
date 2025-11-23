import { getRedis } from "@simplist/db"

const redis = getRedis()

interface CachedArticle {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  published: boolean
  status: string
  viewCount: number
  wordCount: number
  characterCount: number
  lineCount: number
  readTimeMinutes: number
  createdAt: Date | string
  updatedAt: Date | string
  publishedAt: Date | string | null
}

interface CachedArticleListItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  published: boolean
  status: string
  viewCount: number
  wordCount: number
  characterCount: number
  lineCount: number
  readTimeMinutes: number
  createdAt: Date | string
  updatedAt: Date | string
  publishedAt: Date | string | null
}

/**
 * Cache TTL in seconds (5 minutes)
 */
const CACHE_TTL = 5 * 60

/**
 * Generate cache key for articles list
 */
const getListCacheKey = (projectId: string, params: any): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join("|")
  return `articles:list:${projectId}:${sortedParams}`
}

/**
 * Generate cache key for individual article
 */
const getArticleCacheKey = (projectId: string, slug: string): string => {
  return `articles:single:${projectId}:${slug}`
}

/**
 * Cache articles list and individual articles
 */
export const cacheArticlesList = async (
  projectId: string, 
  params: any, 
  articles: CachedArticleListItem[]
): Promise<void> => {
  try {
    const listCacheKey = getListCacheKey(projectId, params)
    
    // Cache the list
    await redis.setex(listCacheKey, CACHE_TTL, JSON.stringify(articles))
    
    // Cache each individual article for future get() calls
    const cachePromises = articles.map(async (article) => {
      const articleCacheKey = getArticleCacheKey(projectId, article.slug)
      
      // Convert list item to full article format (without content for now)
      const fullArticle: CachedArticle = {
        ...article,
        content: "" // Will be populated when actually requested
      }
      
      // Cache for 5 minutes
      await redis.setex(articleCacheKey, CACHE_TTL, JSON.stringify(fullArticle))
    })
    
    await Promise.all(cachePromises)
    
    console.log(`Cached ${articles.length} articles for project ${projectId}`)
  } catch (error) {
    console.error("Failed to cache articles list:", error)
  }
}

/**
 * Get cached articles list
 */
export const getCachedArticlesList = async (
  projectId: string, 
  params: any
): Promise<CachedArticleListItem[] | null> => {
  try {
    const cacheKey = getListCacheKey(projectId, params)
    const cached = await redis.get(cacheKey)
    
    if (cached) {
      return JSON.parse(cached as string)
    }
    
    return null
  } catch (error) {
    console.error("Failed to get cached articles list:", error)
    return null
  }
}

/**
 * Cache individual article with full content
 */
export const cacheArticle = async (
  projectId: string, 
  article: CachedArticle
): Promise<void> => {
  try {
    const cacheKey = getArticleCacheKey(projectId, article.slug)
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(article))
    
    console.log(`Cached article ${article.slug} for project ${projectId}`)
  } catch (error) {
    console.error("Failed to cache article:", error)
  }
}

/**
 * Get cached individual article
 */
export const getCachedArticle = async (
  projectId: string, 
  slug: string
): Promise<CachedArticle | null> => {
  try {
    const cacheKey = getArticleCacheKey(projectId, slug)
    const cached = await redis.get(cacheKey)
    
    if (cached) {
      const article = JSON.parse(cached as string)
      
      // If article has no content, it was cached from list - return null to fetch from DB
      if (!article.content) {
        return null
      }
      
      return article
    }
    
    return null
  } catch (error) {
    console.error("Failed to get cached article:", error)
    return null
  }
}

/**
 * Invalidate cache for a project (when articles are created/updated/deleted)
 */
export const invalidateProjectCache = async (projectId: string): Promise<void> => {
  try {
    // Get all cache keys for this project
    const listKeys = await redis.keys(`articles:list:${projectId}:*`)
    const articleKeys = await redis.keys(`articles:single:${projectId}:*`)
    
    const allKeys = [...listKeys, ...articleKeys]
    
    if (allKeys.length > 0) {
      await redis.del(...allKeys)
      console.log(`Invalidated ${allKeys.length} cache entries for project ${projectId}`)
    }
  } catch (error) {
    console.error("Failed to invalidate project cache:", error)
  }
}

/**
 * Invalidate cache for a specific article
 */
export const invalidateArticleCache = async (projectId: string, slug: string): Promise<void> => {
  try {
    const cacheKey = getArticleCacheKey(projectId, slug)
    await redis.del(cacheKey)
    
    // Also invalidate all list caches for this project since the article might appear in lists
    const listKeys = await redis.keys(`articles:list:${projectId}:*`)
    if (listKeys.length > 0) {
      await redis.del(...listKeys)
    }
    
    console.log(`Invalidated cache for article ${slug} and related lists`)
  } catch (error) {
    console.error("Failed to invalidate article cache:", error)
  }
}