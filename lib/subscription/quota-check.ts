import { prisma } from "@/lib/db";
import { getPlanLimits, type SubscriptionPlan } from "./plans";

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: string;
  current?: number;
  limit?: number;
}

/**
 * Get user's subscription tier and limits
 */
export const getUserSubscription = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscription: true,
      subscriptionExpiresAt: true,
      monthlyApiCalls: true,
      apiCallsResetAt: true,
      totalStorageUsed: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Check if subscription is expired
  const tier: SubscriptionPlan =
    user.subscription === "pro" &&
    user.subscriptionExpiresAt &&
    user.subscriptionExpiresAt > new Date()
      ? "pro"
      : "free";

  return {
    tier,
    limits: getPlanLimits(tier),
    usage: {
      apiCalls: user.monthlyApiCalls,
      storage: user.totalStorageUsed,
      apiCallsResetAt: user.apiCallsResetAt,
    },
  };
};

/**
 * Check if user can create a new article
 */
export const checkArticleQuota = async (
  userId: string,
  projectId: string
): Promise<QuotaCheckResult> => {
  const subscription = await getUserSubscription(userId);

  // Count existing articles
  const articleCount = await prisma.article.count({
    where: {
      projectId,
      status: { not: "deleted" },
    },
  });

  if (articleCount >= subscription.limits.maxArticles) {
    return {
      allowed: false,
      reason: `Article limit reached. Your ${subscription.tier} plan allows up to ${subscription.limits.maxArticles} articles.`,
      current: articleCount,
      limit: subscription.limits.maxArticles,
    };
  }

  return { allowed: true, current: articleCount, limit: subscription.limits.maxArticles };
};

/**
 * Check if user can upload an image (storage quota)
 */
export const checkStorageQuota = async (
  userId: string,
  fileSizeBytes: number
): Promise<QuotaCheckResult> => {
  const subscription = await getUserSubscription(userId);

  const newTotal = subscription.usage.storage + fileSizeBytes;

  if (newTotal > subscription.limits.maxStorageBytes) {
    const usedMB = Math.round(subscription.usage.storage / 1024 / 1024);
    const limitMB = Math.round(subscription.limits.maxStorageBytes / 1024 / 1024);
    const fileMB = Math.round(fileSizeBytes / 1024 / 1024);

    return {
      allowed: false,
      reason: `Storage limit exceeded. You're using ${usedMB}MB of ${limitMB}MB. This file (${fileMB}MB) would exceed your limit.`,
      current: subscription.usage.storage,
      limit: subscription.limits.maxStorageBytes,
    };
  }

  return {
    allowed: true,
    current: subscription.usage.storage,
    limit: subscription.limits.maxStorageBytes,
  };
};

/**
 * Check if user can create a new API key
 */
export const checkApiKeyQuota = async (
  userId: string,
  projectId: string
): Promise<QuotaCheckResult> => {
  const subscription = await getUserSubscription(userId);

  // Count existing active API keys
  const apiKeyCount = await prisma.apiKey.count({
    where: {
      projectId,
      status: "active",
    },
  });

  if (apiKeyCount >= subscription.limits.maxApiKeys) {
    return {
      allowed: false,
      reason: `API key limit reached. Your ${subscription.tier} plan allows up to ${subscription.limits.maxApiKeys} API keys.`,
      current: apiKeyCount,
      limit: subscription.limits.maxApiKeys,
    };
  }

  return { allowed: true, current: apiKeyCount, limit: subscription.limits.maxApiKeys };
};

/**
 * Check if user has exceeded monthly API call quota
 */
export const checkApiCallQuota = async (userId: string): Promise<QuotaCheckResult> => {
  const subscription = await getUserSubscription(userId);

  // Check if we need to reset the counter (new month)
  const now = new Date();
  const resetDate = subscription.usage.apiCallsResetAt;
  const daysSinceReset = Math.floor(
    (now.getTime() - resetDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  let currentApiCalls = subscription.usage.apiCalls;

  // Reset if more than 30 days have passed
  if (daysSinceReset >= 30) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlyApiCalls: 0,
        apiCallsResetAt: now,
      },
    });
    currentApiCalls = 0;
  }

  if (currentApiCalls >= subscription.limits.maxApiCallsPerMonth) {
    return {
      allowed: false,
      reason: `Monthly API call limit reached. Your ${subscription.tier} plan allows ${subscription.limits.maxApiCallsPerMonth} calls per month.`,
      current: currentApiCalls,
      limit: subscription.limits.maxApiCallsPerMonth,
    };
  }

  return {
    allowed: true,
    current: currentApiCalls,
    limit: subscription.limits.maxApiCallsPerMonth,
  };
};

/**
 * Increment user's API call counter
 */
export const incrementApiCallCounter = async (userId: string): Promise<void> => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      monthlyApiCalls: {
        increment: 1,
      },
    },
  });
};

/**
 * Update user's storage usage
 */
export const updateStorageUsage = async (
  userId: string,
  bytesChange: number
): Promise<void> => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      totalStorageUsed: {
        increment: bytesChange,
      },
    },
  });
};

/**
 * Check if user has access to a feature
 */
export const checkFeatureAccess = async (
  userId: string,
  feature: keyof ReturnType<typeof getPlanLimits>["features"]
): Promise<boolean> => {
  const subscription = await getUserSubscription(userId);
  return subscription.limits.features[feature];
};

/**
 * Check if user has analytics enabled
 */
export const checkAnalyticsAccess = async (userId: string): Promise<boolean> => {
  const subscription = await getUserSubscription(userId);
  return subscription.limits.analyticsEnabled;
};
