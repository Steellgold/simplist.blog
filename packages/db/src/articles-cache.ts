import { getRedis } from "./redis";

/**
 * Internal: key storing the current cache "version" for a project.
 */
const getProjectVersionKey = (projectId: string): string => {
  return `articles:version:${projectId}`;
};

export const articlesCacheUtils = {
  /**
   * Invalidate cache for a project (when articles are created/updated/deleted).
   * This bumps the cache version, making all old cache entries effectively invalid.
   */
  invalidate: async (projectId: string): Promise<void> => {
    try {
      const redis = getRedis();
      const versionKey = getProjectVersionKey(projectId);
      const current = await redis.get(versionKey);
      const currentNumber =
        typeof current === "string" ? parseInt(current, 10) : NaN;
      const nextVersion =
        !isNaN(currentNumber) && currentNumber > 0 ? currentNumber + 1 : 2;

      await redis.set(versionKey, String(nextVersion));
      console.warn(
        `Invalidated articles cache for project ${projectId} (version: ${nextVersion})`,
      );
    } catch (error) {
      console.error("Failed to invalidate articles cache:", error);
    }
  },

  /**
   * Invalidate cache for a specific article.
   * Since we use versioned cache keys, this also bumps the project version.
   */
  invalidateArticle: async (projectId: string, slug: string): Promise<void> => {
    try {
      await articlesCacheUtils.invalidate(projectId);
      console.warn(
        `Invalidated article cache for project ${projectId}, article: ${slug}`,
      );
    } catch (error) {
      console.error("Failed to invalidate article cache:", error);
    }
  },
};
