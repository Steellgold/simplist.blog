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

interface SubscriptionLimitsData {
  isLoading: boolean;
  subscription: UserSubscription | null;
  apiKeyUsage: ApiKeyUsage | null;
  limits: ReturnType<typeof getPlanLimits> | null;
  refetch: () => Promise<void>;
}

export const useSubscriptionLimits = (): SubscriptionLimitsData => {
  const [data, setData] = useState<Omit<SubscriptionLimitsData, 'refetch'>>({
    isLoading: true,
    subscription: null,
    apiKeyUsage: null,
    limits: null,
  });

  const fetchSubscriptionData = async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true }));
      const response = await fetch("/api/subscription/limits");
      
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

      setData({
        isLoading: false,
        subscription: {
          tier: result.subscription.tier,
          subscriptionExpiresAt: result.subscription.subscriptionExpiresAt 
            ? new Date(result.subscription.subscriptionExpiresAt) 
            : null,
        },
        apiKeyUsage,
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
  }, []);

  return {
    ...data,
    refetch: fetchSubscriptionData,
  };
};

// Hook spécialisé pour les API keys
export const useApiKeyLimits = () => {
  const { isLoading, apiKeyUsage, subscription, refetch } = useSubscriptionLimits();
  
  return {
    isLoading,
    canCreateApiKey: apiKeyUsage?.canCreateMore ?? false,
    currentCount: apiKeyUsage?.currentCount ?? 0,
    maxCount: apiKeyUsage?.maxCount ?? 0,
    isAtLimit: apiKeyUsage ? apiKeyUsage.currentCount >= apiKeyUsage.maxCount : false,
    tier: (subscription?.tier ?? "free") as SubscriptionPlan,
    refetch,
  };
};