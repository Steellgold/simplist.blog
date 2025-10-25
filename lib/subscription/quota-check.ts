import { prisma } from "@/lib/db";
import { SubscriptionTier } from "@prisma/client";
import { getPlanLimits } from "./plans";

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: string;
  current?: number;
  limit?: number;
}

/**
 * Get project's subscription tier and limits
 */
export const getProjectSubscription = async (projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      subscriptionTier: true,
      subscriptionExpiresAt: true,
      monthlyApiCalls: true,
      apiCallsResetAt: true,
      totalStorageUsed: true,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Check if subscription is expired
  const tier: SubscriptionTier =
    project.subscriptionTier === "PRO" &&
    project.subscriptionExpiresAt &&
    project.subscriptionExpiresAt > new Date()
      ? "PRO"
      : "STARTER";

  return {
    tier,
    limits: getPlanLimits(tier),
    usage: {
      apiCalls: project.monthlyApiCalls,
      storage: project.totalStorageUsed,
      apiCallsResetAt: project.apiCallsResetAt,
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
  const subscription = await getProjectSubscription(projectId);

  // Count existing articles
  const articleCount = await prisma.article.count({
    where: {
      projectId,
      status: { not: "deleted" },
    },
  });

  // -1 means unlimited
  if (subscription.limits.maxArticles !== -1 && articleCount >= subscription.limits.maxArticles) {
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
  // For storage, we use the user's highest tier project or default to free
  const userProjects = await prisma.project.findMany({
    where: { userId },
    select: { 
      id: true,
      subscriptionTier: true,
      subscriptionExpiresAt: true,
      monthlyApiCalls: true,
      apiCallsResetAt: true,
      totalStorageUsed: true,
    },
  });

  if (userProjects.length === 0) {
    throw new Error("No projects found for user");
  }

  // Find the highest tier project
  const highestTierProject = userProjects.reduce((highest, current) => {
    const currentIsPro = current.subscriptionTier === "PRO" &&
      current.subscriptionExpiresAt &&
      current.subscriptionExpiresAt > new Date();
    const highestIsPro = highest.subscriptionTier === "PRO" &&
      highest.subscriptionExpiresAt &&
      highest.subscriptionExpiresAt > new Date();
    
    return currentIsPro && !highestIsPro ? current : highest;
  });

  const isPro = highestTierProject.subscriptionTier === "PRO" &&
    highestTierProject.subscriptionExpiresAt &&
    highestTierProject.subscriptionExpiresAt > new Date();

  const tier = isPro ? "PRO" : "STARTER";
  const limits = getPlanLimits(tier);

  const subscription = {
    tier,
    limits,
    usage: {
      apiCalls: highestTierProject.monthlyApiCalls,
      storage: highestTierProject.totalStorageUsed,
      apiCallsResetAt: highestTierProject.apiCallsResetAt,
    },
  };

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
  const subscription = await getProjectSubscription(projectId);

  // Count existing active API keys
  const apiKeyCount = await prisma.apiKey.count({
    where: {
      projectId,
      status: "active",
    },
  });

  // -1 means unlimited
  if (subscription.limits.maxApiKeys !== -1 && apiKeyCount >= subscription.limits.maxApiKeys) {
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
  // For API calls, we use the user's highest tier project or default to free
  const userProjects = await prisma.project.findMany({
    where: { userId },
    select: { 
      id: true,
      subscriptionTier: true,
      subscriptionExpiresAt: true,
      monthlyApiCalls: true,
      apiCallsResetAt: true,
      totalStorageUsed: true,
    },
  });

  if (userProjects.length === 0) {
    throw new Error("No projects found for user");
  }

  // Find the highest tier project
  const highestTierProject = userProjects.reduce((highest, current) => {
    const currentIsPro = current.subscriptionTier === "PRO" &&
      current.subscriptionExpiresAt &&
      current.subscriptionExpiresAt > new Date();
    const highestIsPro = highest.subscriptionTier === "PRO" &&
      highest.subscriptionExpiresAt &&
      highest.subscriptionExpiresAt > new Date();
    
    return currentIsPro && !highestIsPro ? current : highest;
  });

  const isPro = highestTierProject.subscriptionTier === "PRO" &&
    highestTierProject.subscriptionExpiresAt &&
    highestTierProject.subscriptionExpiresAt > new Date();

  const tier = isPro ? "PRO" : "STARTER";
  const limits = getPlanLimits(tier);

  // Use the highest tier project's usage data
  const subscription = {
    tier,
    limits,
    usage: {
      apiCalls: highestTierProject.monthlyApiCalls,
      storage: highestTierProject.totalStorageUsed,
      apiCallsResetAt: highestTierProject.apiCallsResetAt,
    },
  };

  // Check if we need to reset the counter (new month)
  const now = new Date();
  const resetDate = subscription.usage.apiCallsResetAt;
  const daysSinceReset = Math.floor(
    (now.getTime() - resetDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  let currentApiCalls = subscription.usage.apiCalls;

  // Reset if more than 30 days have passed
  if (daysSinceReset >= 30) {
    await prisma.project.update({
      where: { id: highestTierProject.id },
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
 * Increment user's API call counter (updates the highest tier project)
 */
export const incrementApiCallCounter = async (userId: string): Promise<void> => {
  // Find the highest tier project
  const userProjects = await prisma.project.findMany({
    where: { userId },
    select: { 
      id: true,
      subscriptionTier: true,
      subscriptionExpiresAt: true,
    },
  });

  if (userProjects.length === 0) {
    throw new Error("No projects found for user");
  }

  const highestTierProject = userProjects.reduce((highest, current) => {
    const currentIsPro = current.subscriptionTier === "PRO" &&
      current.subscriptionExpiresAt &&
      current.subscriptionExpiresAt > new Date();
    const highestIsPro = highest.subscriptionTier === "PRO" &&
      highest.subscriptionExpiresAt &&
      highest.subscriptionExpiresAt > new Date();
    
    return currentIsPro && !highestIsPro ? current : highest;
  });

  await prisma.project.update({
    where: { id: highestTierProject.id },
    data: {
      monthlyApiCalls: {
        increment: 1,
      },
    },
  });
};

/**
 * Update user's storage usage (updates the highest tier project)
 */
export const updateStorageUsage = async (
  userId: string,
  bytesChange: number
): Promise<void> => {
  // Find the highest tier project
  const userProjects = await prisma.project.findMany({
    where: { userId },
    select: { 
      id: true,
      subscriptionTier: true,
      subscriptionExpiresAt: true,
    },
  });

  if (userProjects.length === 0) {
    throw new Error("No projects found for user");
  }

  const highestTierProject = userProjects.reduce((highest, current) => {
    const currentIsPro = current.subscriptionTier === "PRO" &&
      current.subscriptionExpiresAt &&
      current.subscriptionExpiresAt > new Date();
    const highestIsPro = highest.subscriptionTier === "PRO" &&
      highest.subscriptionExpiresAt &&
      highest.subscriptionExpiresAt > new Date();
    
    return currentIsPro && !highestIsPro ? current : highest;
  });

  await prisma.project.update({
    where: { id: highestTierProject.id },
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
  projectId: string,
  feature: keyof ReturnType<typeof getPlanLimits>["features"]
): Promise<boolean> => {
  const subscription = await getProjectSubscription(projectId);
  return subscription.limits.features[feature];
};

/**
 * Check if user has analytics enabled
 */
export const checkAnalyticsAccess = async (userId: string, projectId: string): Promise<boolean> => {
  const subscription = await getProjectSubscription(projectId);
  return subscription.limits.analyticsEnabled;
};
