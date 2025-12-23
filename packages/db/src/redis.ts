import { Redis } from "@upstash/redis";

// Create singleton Redis client
let redis: Redis | null = null;

export const getRedis = (): Redis => {
  if (!redis) {
    if (
      !process.env.UPSTASH_REDIS_REST_URL ||
      !process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      throw new Error(
        "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables are required",
      );
    }

    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  return redis;
};

// Cache utilities
const CACHE_TTL = 5 * 60; // 5 minutes in seconds
const CACHE_PREFIX = "apikey:";
const SUBSCRIPTION_CACHE_PREFIX = "subscription:";
const SUBSCRIPTION_CACHE_TTL = 25 * 60; // 25 minutes in seconds

export const apiKeyCache = {
  async get(key: string) {
    try {
      const redis = getRedis();
      const cacheKey = `${CACHE_PREFIX}${key}`;
      const cached = await redis.get(cacheKey);
      if (!cached) return null;

      // Ensure cached is a string before parsing
      const cacheString =
        typeof cached === "string" ? cached : JSON.stringify(cached);
      return JSON.parse(cacheString);
    } catch (error) {
      console.error("Error getting from cache:", error);
      return null;
    }
  },

  async set(key: string, data: any, ttl = CACHE_TTL) {
    try {
      const redis = getRedis();
      const cacheKey = `${CACHE_PREFIX}${key}`;
      await redis.setex(cacheKey, ttl, JSON.stringify(data));
    } catch (error) {
      console.error("Error setting cache:", error);
    }
  },

  async invalidate(key: string) {
    try {
      const redis = getRedis();
      const cacheKey = `${CACHE_PREFIX}${key}`;
      await redis.del(cacheKey);
    } catch (error) {
      console.error("Error invalidating cache:", error);
    }
  },

  async invalidatePattern(pattern: string) {
    try {
      const redis = getRedis();
      const keys = await redis.keys(`${CACHE_PREFIX}${pattern}`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error("Error invalidating cache pattern:", error);
    }
  },
};

export const subscriptionCache = {
  async get(projectId: string) {
    try {
      const redis = getRedis();
      const cacheKey = `${SUBSCRIPTION_CACHE_PREFIX}${projectId}`;
      const cached = await redis.get(cacheKey);
      if (!cached) return null;

      // Ensure cached is a string before parsing
      const cacheString =
        typeof cached === "string" ? cached : JSON.stringify(cached);
      return JSON.parse(cacheString);
    } catch (error) {
      console.error("Error getting subscription from cache:", error);
      return null;
    }
  },

  async set(projectId: string, data: any, ttl = SUBSCRIPTION_CACHE_TTL) {
    try {
      const redis = getRedis();
      const cacheKey = `${SUBSCRIPTION_CACHE_PREFIX}${projectId}`;
      await redis.setex(cacheKey, ttl, JSON.stringify(data));
    } catch (error) {
      console.error("Error setting subscription cache:", error);
    }
  },

  async invalidate(projectId: string) {
    try {
      const redis = getRedis();
      const cacheKey = `${SUBSCRIPTION_CACHE_PREFIX}${projectId}`;
      await redis.del(cacheKey);
    } catch (error) {
      console.error("Error invalidating subscription cache:", error);
    }
  },
};
