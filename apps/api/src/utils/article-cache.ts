import { getRedis } from "@simplist/db";
import type { CachedArticleType, CachedArticleListItemType } from "@/types";

const redis = getRedis();

/**
 * Cache TTL in seconds (2.5 minutes)
 */
const CACHE_TTL = 2.5 * 60;

/**
 * Internal: key storing the current cache "version" for a project.
 */
const getProjectVersionKey = (projectId: string): string => {
  return `articles:version:${projectId}`;
};

/**
 * Internal: read current cache version for a project (defaults to 1).
 */
const getProjectCacheVersion = async (projectId: string): Promise<number> => {
  try {
    const versionKey = getProjectVersionKey(projectId);
    const value = await redis.get(versionKey);

    const parsed = typeof value === "string" ? parseInt(value, 10) : NaN;
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  } catch {
    // In case of Redis problem, we fall back to version 1 without breaking requests
  }

  return 1;
};

/**
 * Generate cache key for articles list (versioned).
 */
const getListCacheKey = (
  projectId: string,
  params: any,
  version: number,
): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}:${params[key]}`)
    .join("|");
  return `articles:list:${projectId}:v${version}:${sortedParams}`;
};

/**
 * Generate cache key for individual article (versioned).
 */
const getArticleCacheKey = (
  projectId: string,
  slug: string,
  version: number,
): string => {
  return `articles:single:${projectId}:v${version}:${slug}`;
};

/**
 * Cache articles list and individual articles
 */
export const cacheArticlesList = async (
  projectId: string,
  params: Record<string, unknown>,
  articles: CachedArticleListItemType[],
): Promise<void> => {
  try {
    const version = await getProjectCacheVersion(projectId);
    const listCacheKey = getListCacheKey(projectId, params, version);

    // Cache the list
    await redis.setex(listCacheKey, CACHE_TTL, JSON.stringify(articles));

    // Cache each individual article for future get() calls
    const cachePromises = articles.map(async (article) => {
      const articleCacheKey = getArticleCacheKey(
        projectId,
        article.slug,
        version,
      );

      // Convert list item to full article format (without content for now)
      const fullArticle: CachedArticleType = {
        ...article,
        content: "", // Will be populated when actually requested
      };

      // Cache for 5 minutes
      await redis.setex(
        articleCacheKey,
        CACHE_TTL,
        JSON.stringify(fullArticle),
      );
    });

    await Promise.all(cachePromises);

    console.warn(`Cached ${articles.length} articles for project ${projectId}`);
  } catch (error) {
    console.error("Failed to cache articles list:", error);
  }
};

/**
 * Get cached articles list
 */
export const getCachedArticlesList = async (
  projectId: string,
  params: Record<string, unknown>,
): Promise<CachedArticleListItemType[] | null> => {
  try {
    const version = await getProjectCacheVersion(projectId);
    const cacheKey = getListCacheKey(projectId, params, version);
    const cached = await redis.get(cacheKey);

    if (cached) {
      const cacheString =
        typeof cached === "string" ? cached : JSON.stringify(cached);
      return JSON.parse(cacheString);
    }

    return null;
  } catch (error) {
    console.error("Failed to get cached articles list:", error);
    return null;
  }
};

/**
 * Cache individual article with full content
 */
export const cacheArticle = async (
  projectId: string,
  article: CachedArticleType,
): Promise<void> => {
  try {
    const version = await getProjectCacheVersion(projectId);
    const cacheKey = getArticleCacheKey(projectId, article.slug, version);
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(article));

    console.warn(`Cached article ${article.slug} for project ${projectId}`);
  } catch (error) {
    console.error("Failed to cache article:", error);
  }
};

/**
 * Get cached individual article
 */
export const getCachedArticle = async (
  projectId: string,
  slug: string,
): Promise<CachedArticleType | null> => {
  try {
    const version = await getProjectCacheVersion(projectId);
    const cacheKey = getArticleCacheKey(projectId, slug, version);
    const cached = await redis.get(cacheKey);

    if (cached) {
      const cacheString =
        typeof cached === "string" ? cached : JSON.stringify(cached);
      const article = JSON.parse(cacheString);

      // If article has no content, it was cached from list - return null to fetch from DB
      if (!article.content) {
        return null;
      }

      return article;
    }

    return null;
  } catch (error) {
    console.error("Failed to get cached article:", error);
    return null;
  }
};

/**
 * Invalidate cache for a project (when articles are created/updated/deleted)
 */
export const invalidateProjectCache = async (
  projectId: string,
): Promise<void> => {
  try {
    // Increment simply the cache version for this project.
    // The old entries will naturally expire via their TTL.
    const versionKey = getProjectVersionKey(projectId);
    const current = await redis.get(versionKey);
    const currentNumber =
      typeof current === "string" ? parseInt(current, 10) : NaN;
    const nextVersion =
      !isNaN(currentNumber) && currentNumber > 0 ? currentNumber + 1 : 2;

    await redis.set(versionKey, String(nextVersion));
    console.warn(
      `Invalidated project cache via version bump for project ${projectId}`,
    );
  } catch (error) {
    console.error("Failed to invalidate project cache:", error);
  }
};

/**
 * Invalidate cache for a specific article
 */
export const invalidateArticleCache = async (
  projectId: string,
  slug: string,
): Promise<void> => {
  try {
    // Fine-grained invalidation: we simply bump the project version.
    // This avoids using KEYS and remains sufficient given the short TTL.
    await invalidateProjectCache(projectId);
    console.warn(
      `Invalidated article cache via version bump for project ${projectId} (article ${slug})`,
    );
  } catch (error) {
    console.error("Failed to invalidate article cache:", error);
  }
};
