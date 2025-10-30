"use client";

import { getPlanLimits } from "@/lib/subscription/plans";
import { SubscriptionTier } from "@prisma/client";
import { useEffect, useState } from "react";

interface ProjectSubscription {
  tier: SubscriptionTier;
  subscriptionExpiresAt: Date | null;
}

interface ApiKeyUsage {
  currentCount: number;
  maxCount: number;
  canCreateMore: boolean;
}

interface ArticleUsage {
  currentCount: number;
  maxCount: number;
  canCreateMore: boolean;
}

interface SubscriptionLimitsData {
  isLoading: boolean;
  subscription: ProjectSubscription | null;
  apiKeyUsage: ApiKeyUsage | null;
  articleUsage: ArticleUsage | null;
  limits: ReturnType<typeof getPlanLimits> | null;
  refetch: () => Promise<void>;
}

export const useSubscriptionLimits = (projectId?: string): SubscriptionLimitsData => {
  const [data, setData] = useState<Omit<SubscriptionLimitsData, 'refetch'>>({
    isLoading: true,
    subscription: null,
    apiKeyUsage: null,
    articleUsage: null,
    limits: null,
  });

  const fetchSubscriptionData = async () => {
    if (!projectId) {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setData(prev => ({ ...prev, isLoading: true }));
      const response = await fetch(`/api/subscription/limits?projectId=${projectId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch subscription data");
      }

      const result = await response.json();

      const limits = getPlanLimits(result.subscription.tier as SubscriptionTier);
      const apiKeyUsage: ApiKeyUsage = {
        currentCount: result.apiKeyCount,
        maxCount: limits.maxApiKeys,
        canCreateMore: limits.maxApiKeys === -1 || result.apiKeyCount < limits.maxApiKeys,
      };

      const articleUsage: ArticleUsage = {
        currentCount: result.articleCount,
        maxCount: limits.maxArticles,
        canCreateMore: limits.maxArticles === -1 || result.articleCount < limits.maxArticles,
      };

      setData({
        isLoading: false,
        subscription: {
          tier: result.subscription.tier,
          subscriptionExpiresAt: result.subscription.subscriptionExpiresAt 
            ? new Date(result.subscription.subscriptionExpiresAt) 
            : null,
        },
        apiKeyUsage,
        articleUsage,
        limits,
      });
    } catch (error) {
      console.error("Error fetching subscription limits:", error);
      setData(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, [projectId]);

  return {
    ...data,
    refetch: fetchSubscriptionData,
  };
};

// Hook for API key limits
export const useApiKeyLimits = (projectId?: string) => {
  const { isLoading, apiKeyUsage, subscription, refetch } = useSubscriptionLimits(projectId);

  return {
    isLoading,
    canCreateApiKey: apiKeyUsage?.canCreateMore ?? false,
    currentCount: apiKeyUsage?.currentCount ?? 0,
    maxCount: apiKeyUsage?.maxCount ?? 0,
    isAtLimit: apiKeyUsage ? (apiKeyUsage.maxCount !== -1 && apiKeyUsage.currentCount >= apiKeyUsage.maxCount) : false,
    tier: (subscription?.tier ?? "STARTER") as SubscriptionTier,
    refetch,
  };
};

export const useArticleLimits = (projectId?: string) => {
  const { isLoading, articleUsage, subscription, refetch } = useSubscriptionLimits(projectId);

  return {
    isLoading,
    canCreateArticle: articleUsage?.canCreateMore ?? false,
    currentCount: articleUsage?.currentCount ?? 0,
    maxCount: articleUsage?.maxCount ?? 0,
    isAtLimit: articleUsage ? (articleUsage.maxCount !== -1 && articleUsage.currentCount >= articleUsage.maxCount) : false,
    tier: (subscription?.tier ?? "STARTER") as SubscriptionTier,
    refetch,
  };
};

export const useVariantLimits = (projectId?: string, currentVariantCount = 0) => {
  const { isLoading, subscription, limits } = useSubscriptionLimits(projectId);

  const tier = subscription?.tier ?? "STARTER";
  const maxVariants = limits?.maxVariantsPerArticle ?? 0;
  const isFreeTier = tier === "STARTER";
  
  // For STARTER plan, no variants allowed (except default language)
  const canAddVariant = !isFreeTier && (maxVariants === -1 || currentVariantCount < maxVariants);
  const isAtLimit = isFreeTier || (maxVariants !== -1 && currentVariantCount >= maxVariants);

  let quotaError: string | undefined;
  if (isAtLimit && !isFreeTier) {
    quotaError = `Variant limit reached. Your ${tier} plan allows up to ${maxVariants} variant${maxVariants === 1 ? '' : 's'} per article.`;
  } else if (isFreeTier) {
    quotaError = "Language variants are available with the Pro plan. Upgrade to create article variants in different languages.";
  }

  return {
    isLoading,
    canAddVariant,
    currentCount: currentVariantCount,
    maxCount: maxVariants,
    isAtLimit,
    isFreeTier,
    quotaError,
    tier,
  };
};