import { prisma, SubscriptionTier } from "@simplist/db";
import { getPlanLimits } from "./plans";

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: string;
  current?: number;
  limit?: number;
}

export type ProjectSubscription = {
  tier: SubscriptionTier;
  limits: ReturnType<typeof getPlanLimits>;
  usage: {
    apiCalls: number;
    storage: number;
    apiCallsResetAt: Date | null;
  };
};

/** Get project's subscription tier and limits */
export const getProjectSubscription = async (
  projectId: string,
): Promise<ProjectSubscription> => {
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

/** Check if user can create a new article */
export const checkArticleQuota = async (
  userId: string,
  projectId: string,
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
  if (
    subscription.limits.maxArticles !== -1 &&
    articleCount >= subscription.limits.maxArticles
  ) {
    return {
      allowed: false,
      reason: `Article limit reached. Your ${subscription.tier} plan allows up to ${subscription.limits.maxArticles} articles.`,
      current: articleCount,
      limit: subscription.limits.maxArticles,
    };
  }

  return {
    allowed: true,
    current: articleCount,
    limit: subscription.limits.maxArticles,
  };
};

/** Check if user can create another webhook for the project */
export const checkWebhookQuota = async (
  projectId: string,
): Promise<QuotaCheckResult> => {
  const subscription = await getProjectSubscription(projectId);

  const webhookCount = await prisma.webhook.count({
    where: {
      projectId,
      status: { not: "disabled" },
    },
  });

  if (
    subscription.limits.maxWebhooks !== -1 &&
    webhookCount >= subscription.limits.maxWebhooks
  ) {
    return {
      allowed: false,
      reason: `Webhook limit reached. Your ${subscription.tier} plan allows up to ${subscription.limits.maxWebhooks} webhook${subscription.limits.maxWebhooks === 1 ? "" : "s"}.`,
      current: webhookCount,
      limit: subscription.limits.maxWebhooks,
    };
  }

  return {
    allowed: true,
    current: webhookCount,
    limit: subscription.limits.maxWebhooks,
  };
};

/**
 * Check if user can upload an image (storage quota)
 */
export const checkStorageQuota = async (
  projectId: string,
  fileSizeBytes: number,
): Promise<QuotaCheckResult> => {
  const subscription = await getProjectSubscription(projectId);

  const currentUsage = subscription.usage.storage;
  const maxStorage = subscription.limits.maxStorageBytes;

  // -1 means unlimited storage for the plan
  if (maxStorage !== -1 && currentUsage + fileSizeBytes > maxStorage) {
    const usedMB = Math.round(currentUsage / 1024 / 1024);
    const limitMB = Math.round(maxStorage / 1024 / 1024);
    const fileMB = Math.round(fileSizeBytes / 1024 / 1024);

    return {
      allowed: false,
      reason: `Storage limit exceeded. You're using ${usedMB}MB of ${limitMB}MB. This file (${fileMB}MB) would exceed your limit.`,
      current: currentUsage,
      limit: maxStorage,
    };
  }

  return {
    allowed: true,
    current: currentUsage,
    limit: maxStorage,
  };
};

/** Check if user has exceeded monthly API call quota */
export const checkApiCallQuota = async (
  userId: string,
): Promise<QuotaCheckResult> => {
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
    const currentIsPro =
      current.subscriptionTier === "PRO" &&
      current.subscriptionExpiresAt &&
      current.subscriptionExpiresAt > new Date();
    const highestIsPro =
      highest.subscriptionTier === "PRO" &&
      highest.subscriptionExpiresAt &&
      highest.subscriptionExpiresAt > new Date();

    return currentIsPro && !highestIsPro ? current : highest;
  });

  const isPro =
    highestTierProject.subscriptionTier === "PRO" &&
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
    (now.getTime() - resetDate.getTime()) / (1000 * 60 * 60 * 24),
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

  if (
    subscription.limits.maxApiCallsPerMonth !== -1 &&
    currentApiCalls >= subscription.limits.maxApiCallsPerMonth
  ) {
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

/** Increment user's API call counter (updates the highest tier project) */
export const incrementApiCallCounter = async (
  userId: string,
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
    const currentIsPro =
      current.subscriptionTier === "PRO" &&
      current.subscriptionExpiresAt &&
      current.subscriptionExpiresAt > new Date();
    const highestIsPro =
      highest.subscriptionTier === "PRO" &&
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

/** Update user's storage usage (updates the highest tier project) */
export const updateStorageUsage = async (
  projectId: string,
  bytesChange: number,
): Promise<void> => {
  await prisma.project.update({
    where: { id: projectId },
    data: {
      totalStorageUsed: {
        increment: bytesChange,
      },
    },
  });
};

/** Decrement storage usage when deleting media */
export const decrementStorageUsage = async (
  projectId: string,
  bytesToRemove: number,
): Promise<void> => {
  // Ensure we don't go below 0
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { totalStorageUsed: true },
  });

  if (!project) return;

  const newTotal = Math.max(0, project.totalStorageUsed - bytesToRemove);

  await prisma.project.update({
    where: { id: projectId },
    data: {
      totalStorageUsed: newTotal,
    },
  });
};

/** Check if user has access to a feature */
export const checkFeatureAccess = async (
  projectId: string,
  feature: keyof ReturnType<typeof getPlanLimits>["features"],
): Promise<boolean> => {
  const subscription = await getProjectSubscription(projectId);
  return subscription.limits.features[feature];
};

/**
 * Check if user can add more variants to an article
 */
export const checkVariantQuota = async (
  userId: string,
  projectId: string,
  articleId?: string,
): Promise<QuotaCheckResult> => {
  const subscription = await getProjectSubscription(projectId);

  // If article ID is provided, count existing variants for that article
  // Otherwise, check the theoretical limit for new articles
  let currentVariants = 0;
  if (articleId) {
    currentVariants = await prisma.articleVariant.count({
      where: { articleId },
    });
  }

  // -1 means unlimited
  if (
    subscription.limits.maxVariantsPerArticle !== -1 &&
    currentVariants >= subscription.limits.maxVariantsPerArticle
  ) {
    const planName = subscription.tier;
    const maxVariants = subscription.limits.maxVariantsPerArticle;

    return {
      allowed: false,
      reason: `Variant limit reached. Your ${planName} plan allows up to ${maxVariants} variant${maxVariants === 1 ? "" : "s"} per article.${planName === "STARTER" ? " Upgrade to Pro for unlimited variants." : ""}`,
      current: currentVariants,
      limit: subscription.limits.maxVariantsPerArticle,
    };
  }

  return {
    allowed: true,
    current: currentVariants,
    limit: subscription.limits.maxVariantsPerArticle,
  };
};
