"use client";

import { getPlanLimits, type SubscriptionPlan } from "@/lib/subscription/plans";
import { useEffect, useState } from "react";

interface UserSubscription {
  tier: SubscriptionPlan;
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
  subscription: UserSubscription | null;
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

      const limits = getPlanLimits(result.subscription.tier as SubscriptionPlan);
      const apiKeyUsage: ApiKeyUsage = {
        currentCount: result.apiKeyCount,
        maxCount: limits.maxApiKeys,
        canCreateMore: result.apiKeyCount < limits.maxApiKeys,
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

// Hook spécialisé pour les API keys
export const useApiKeyLimits = (projectId?: string) => {
  const { isLoading, apiKeyUsage, subscription, refetch } = useSubscriptionLimits(projectId);
  
  return {
    isLoading,
    canCreateApiKey: apiKeyUsage?.canCreateMore ?? false,
    currentCount: apiKeyUsage?.currentCount ?? 0,
    maxCount: apiKeyUsage?.maxCount ?? 0,
    isAtLimit: apiKeyUsage ? apiKeyUsage.currentCount >= apiKeyUsage.maxCount : false,
    tier: (subscription?.tier ?? "STARTER") as SubscriptionPlan,
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
    isAtLimit: articleUsage ? articleUsage.currentCount >= articleUsage.maxCount : false,
    tier: (subscription?.tier ?? "STARTER") as SubscriptionPlan,
    refetch,
  };
};