// Subscription types and constants

export type SubscriptionTier = "free" | "pro";

export interface SubscriptionLimits {
  maxArticles: number;
  maxStorageBytes: number;
  maxApiKeys: number;
  maxApiCallsPerMonth: number;
  analyticsEnabled: boolean;
  features: {
    bulkOperations: boolean;
    advancedSearch: boolean;
    customExpiration: boolean;
    exportData: boolean;
    webhooks: boolean;
    prioritySupport: boolean;
  };
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    maxArticles: 50,
    maxStorageBytes: 500 * 1024 * 1024, // 500 MB
    maxApiKeys: 1,
    maxApiCallsPerMonth: 10_000,
    analyticsEnabled: false,
    features: {
      bulkOperations: false,
      advancedSearch: false,
      customExpiration: false,
      exportData: false,
      webhooks: false,
      prioritySupport: false,
    },
  },
  pro: {
    maxArticles: Infinity, // Unlimited
    maxStorageBytes: 10 * 1024 * 1024 * 1024, // 10 GB
    maxApiKeys: 10,
    maxApiCallsPerMonth: 500_000,
    analyticsEnabled: true,
    features: {
      bulkOperations: true,
      advancedSearch: true,
      customExpiration: true,
      exportData: true,
      webhooks: true,
      prioritySupport: true,
    },
  },
};

export const SUBSCRIPTION_PRICING = {
  pro: {
    monthly: {
      amount: 19,
      currency: "USD",
      interval: "month" as const,
    },
    yearly: {
      amount: 180, // $15/month * 12 = $180/year
      currency: "USD",
      interval: "year" as const,
    },
  },
};

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB per image
export const API_RATE_LIMIT_PER_MINUTE = 100; // requests per minute
