/**
 * Advanced Simplist SDK Features
 *
 * This file demonstrates advanced features of the Simplist SDK that are not
 * used in the basic demo but are available for production applications.
 */

import { simplist } from "./simplist";

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Track article analytics
 * Requires analytics permission in your API key
 */
export async function trackArticleView(
  slug: string,
  timeOnPage: number,
  scrollDepth: number,
  sessionId?: string,
) {
  try {
    await simplist.analytics.track({
      slug,
      timeOnPage, // in seconds
      scrollDepth, // percentage (0-100)
      sessionId,
    });
  } catch (error) {
    console.error("Failed to track article view:", error);
  }
}

/**
 * Get analytics statistics
 * Requires read permission in your API key
 */
export async function getAnalyticsStats(days: number = 7) {
  try {
    const stats = await simplist.analytics.getStats({ days });
    return stats;
  } catch (error) {
    console.error("Failed to get analytics stats:", error);
    return null;
  }
}

/**
 * Get engagement funnel for a specific article
 */
export async function getArticleFunnel(slug: string, days: number = 30) {
  try {
    const funnel = await simplist.analytics.getFunnel({ slug, days });
    return funnel;
  } catch (error) {
    console.error("Failed to get article funnel:", error);
    return null;
  }
}

// ============================================================================
// TAGS
// ============================================================================

/**
 * Get all tags with article counts
 */
export async function getAllTags() {
  try {
    const response = await simplist.tags.list();
    return response.data;
  } catch (error) {
    console.error("Failed to get tags:", error);
    return [];
  }
}

/**
 * Get articles by tag
 */
export async function getArticlesByTag(tagName: string, limit: number = 10) {
  try {
    const response = await simplist.articles.list({
      tags: [tagName],
      published: true,
      limit,
      sort: "publishedAt",
      order: "desc",
    });
    return response.data;
  } catch (error) {
    console.error("Failed to get articles by tag:", error);
    return [];
  }
}

/**
 * Get articles with multiple tags (OR logic)
 */
export async function getArticlesByTags(tagNames: string[]) {
  try {
    const response = await simplist.articles.list({
      tags: tagNames, // Articles with at least one of these tags
      published: true,
      sort: "publishedAt",
      order: "desc",
    });
    return response.data;
  } catch (error) {
    console.error("Failed to get articles by tags:", error);
    return [];
  }
}

/**
 * Get articles with all specified tags (AND logic)
 */
export async function getArticlesWithAllTags(tagNames: string[]) {
  try {
    const response = await simplist.articles.list({
      tagsAll: tagNames, // Articles must have all these tags
      published: true,
      sort: "publishedAt",
      order: "desc",
    });
    return response.data;
  } catch (error) {
    console.error("Failed to get articles with all tags:", error);
    return [];
  }
}

// ============================================================================
// SEARCH & FILTERING
// ============================================================================

/**
 * Search articles
 */
export async function searchArticles(query: string, limit: number = 10) {
  try {
    const response = await simplist.articles.search(query, {
      limit,
      published: true,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to search articles:", error);
    return [];
  }
}

/**
 * Get latest articles
 */
export async function getLatestArticles(limit: number = 10) {
  try {
    const response = await simplist.articles.latest(limit);
    return response.data;
  } catch (error) {
    console.error("Failed to get latest articles:", error);
    return [];
  }
}

/**
 * Get popular articles (by view count)
 */
export async function getPopularArticles(limit: number = 10) {
  try {
    const response = await simplist.articles.popular(limit);
    return response.data;
  } catch (error) {
    console.error("Failed to get popular articles:", error);
    return [];
  }
}

// ============================================================================
// SEO
// ============================================================================

/**
 * Generate RSS feed
 *
 * @param baseUrl - Your website's base URL (e.g., "https://yourblog.com")
 * @param limit - Maximum number of articles to include
 */
export async function generateRssFeed(
  baseUrl: string,
  limit: number = 20,
): Promise<string> {
  try {
    const rssXml = await simplist.seo.getRssFeed(baseUrl, limit);
    return rssXml;
  } catch (error) {
    console.error("Failed to generate RSS feed:", error);
    throw error;
  }
}

/**
 * Generate sitemap XML
 *
 * @param baseUrl - Your website's base URL (e.g., "https://yourblog.com")
 */
export async function generateSitemapXml(baseUrl: string): Promise<string> {
  try {
    const sitemap = await simplist.seo.getSitemap(baseUrl, "xml");
    return sitemap;
  } catch (error) {
    console.error("Failed to generate sitemap:", error);
    throw error;
  }
}

/**
 * Generate sitemap JSON
 *
 * @param baseUrl - Your website's base URL (e.g., "https://yourblog.com")
 */
export async function generateSitemapJson(baseUrl: string) {
  try {
    const sitemap = await simplist.seo.getSitemap(baseUrl, "json");
    return sitemap;
  } catch (error) {
    console.error("Failed to generate sitemap:", error);
    throw error;
  }
}

/**
 * Get SEO metadata for an article
 */
export async function getArticleSeo(slug: string, baseUrl: string) {
  try {
    const articleWithSeo = await simplist.seo.getArticle(slug, baseUrl);
    return articleWithSeo.seo;
  } catch (error) {
    console.error("Failed to get article SEO:", error);
    return null;
  }
}

// ============================================================================
// PROJECT INFO
// ============================================================================

/**
 * Get project information and statistics
 */
export async function getProjectInfo() {
  try {
    const response = await simplist.project.get();
    return response.data;
  } catch (error) {
    console.error("Failed to get project info:", error);
    return null;
  }
}

// ============================================================================
// PAGINATION
// ============================================================================

/**
 * Get paginated articles
 */
export async function getPaginatedArticles(
  page: number = 1,
  limit: number = 10,
) {
  try {
    const response = await simplist.articles.list({
      page,
      limit,
      published: true,
      sort: "publishedAt",
      order: "desc",
    });

    return {
      articles: response.data,
      pagination: response.meta,
    };
  } catch (error) {
    console.error("Failed to get paginated articles:", error);
    return {
      articles: [],
      pagination: undefined,
    };
  }
}

// ============================================================================
// MULTILINGUAL HELPERS
// ============================================================================

import {
  getVariantOrDefault,
  hasVariant,
  getAllLanguages,
  isMultilingual,
} from "@simplist.blog/sdk";

/**
 * Check if an article has a specific language variant
 */
export { hasVariant };

/**
 * Get all available languages for an article
 */
export { getAllLanguages };

/**
 * Check if an article is multilingual
 */
export { isMultilingual };

/**
 * Get article content in a specific language with fallback
 */
export { getVariantOrDefault };
