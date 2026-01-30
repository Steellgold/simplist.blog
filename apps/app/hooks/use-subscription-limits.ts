"use client";

import { getPlanLimits } from "@/lib/subscription/plans";
import { SubscriptionTier } from "@simplist/db";
import { useEffect, useState } from "react";

export const useSubscriptionLimits = (projectId?: string) => {
  const [state, setState] = useState({
    isLoading: true,
    subscription: null as null | {
      tier: SubscriptionTier;
      subscriptionExpiresAt: Date | null;
    },
    articleUsage: null as null | {
      current: number;
      max: number;
      canCreate: boolean;
    },
    limits: null as null | ReturnType<typeof getPlanLimits>,
  });

  const computeUsage = (current: number, max: number) => ({
    current,
    max,
    canCreate: max === -1 || current < max,
  });

  const fetchData = async () => {
    if (!projectId) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }

    try {
      setState((s) => ({ ...s, isLoading: true }));

      const res = await fetch(
        `/api/subscription/limits?projectId=${projectId}`,
      );
      if (!res.ok) throw new Error();

      const data = await res.json();
      const limits = getPlanLimits(data.subscription.tier);

      setState({
        isLoading: false,
        subscription: {
          tier: data.subscription.tier,
          subscriptionExpiresAt: data.subscription.subscriptionExpiresAt
            ? new Date(data.subscription.subscriptionExpiresAt)
            : null,
        },
        articleUsage: computeUsage(data.articleCount, limits.maxArticles),
        limits,
      });
    } catch {
      setState((s) => ({ ...s, isLoading: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  return { ...state, refetch: fetchData };
};

export const useArticleLimits = (projectId?: string) => {
  const { isLoading, articleUsage, subscription, refetch } =
    useSubscriptionLimits(projectId);

  const tier = subscription?.tier ?? "STARTER";
  const max = articleUsage?.max ?? 0;
  const current = articleUsage?.current ?? 0;

  return {
    isLoading,
    tier,
    current,
    max,
    canCreate: articleUsage?.canCreate ?? false,
    isAtLimit: max !== -1 && current >= max,
    refetch,
  };
};

export const useVariantLimits = (projectId?: string, currentCount = 0) => {
  const { isLoading, subscription, limits } = useSubscriptionLimits(projectId);

  const tier = subscription?.tier ?? "STARTER";
  const max = limits?.maxVariantsPerArticle ?? 0;
  const isFree = tier === "STARTER";

  // STARTER can add 1 variant (max = 1), PRO has unlimited (max = -1)
  const canAdd = max === -1 || currentCount < max;
  const isAtLimit = max !== -1 && currentCount >= max;

  const quotaError = isAtLimit
    ? `You have reached the limit. Your ${tier} plan allows ${max} variant${max === 1 ? "" : "s"} per article.${isFree ? " Upgrade to Pro for unlimited variants." : ""}`
    : undefined;

  return {
    isLoading,
    tier,
    currentCount,
    max,
    canAdd,
    isFreeTier: isFree,
    isAtLimit,
    quotaError,
  };
};
