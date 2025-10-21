export type SubscriptionInterval = "monthly" | "yearly";
export type SubscriptionPlan = "free" | "pro";

export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: string | number;
}

export interface PlanPrice {
  amount: number;
  interval: SubscriptionInterval;
  displayAmount: string;
  displayInterval: string;
  yearlyEquivalent?: string;
  savings?: string;
}

export interface Plan {
  id: SubscriptionPlan;
  name: string;
  description: string;
  highlight?: string;
  popular?: boolean;
  prices: PlanPrice[];
  features: PlanFeature[];
  limits: {
    maxArticles: number;
    maxApiKeys: number;
    maxStorageBytes: number;
    maxApiCallsPerMonth: number;
    analyticsEnabled: boolean;
    features: {
      analytics: boolean;
      customDomains: boolean;
      prioritySupport: boolean;
      dataExport: boolean;
      bulkOperations: boolean;
    };
  };
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, Plan> = {
  free: {
    id: "free",
    name: "Free",
    description: "Perfect for getting started",
    prices: [
      {
        amount: 0,
        interval: "monthly",
        displayAmount: "$0",
        displayInterval: "/month",
      },
    ],
    features: [
      { name: "5 articles", included: true },
      { name: "1 API key", included: true },
      { name: "Basic analytics", included: true },
      { name: "10MB storage", included: true },
      { name: "1,000 API calls/month", included: true },
      { name: "Priority support", included: false },
      { name: "Custom domains", included: false },
      { name: "Export data", included: false },
    ],
    limits: {
      maxArticles: 5,
      maxApiKeys: 1,
      maxStorageBytes: 10 * 1024 * 1024, // 10MB
      maxApiCallsPerMonth: 1000,
      analyticsEnabled: true,
      features: {
        analytics: true,
        customDomains: false,
        prioritySupport: false,
        dataExport: false,
        bulkOperations: false,
      },
    },
  },
  pro: {
    id: "pro",
    name: "Pro", 
    description: "For serious content creators",
    highlight: "Most Popular",
    popular: true,
    prices: [
      {
        amount: 25,
        interval: "monthly",
        displayAmount: "$25",
        displayInterval: "/month",
      },
      {
        amount: 20,
        interval: "yearly",
        displayAmount: "$20",
        displayInterval: "/month billed yearly",
        yearlyEquivalent: "$240/year",
        savings: "Save $60",
      },
    ],
    features: [
      { name: "Unlimited articles", included: true },
      { name: "Unlimited API keys", included: true },
      { name: "Advanced analytics", included: true },
      { name: "1GB storage", included: true },
      { name: "100,000 API calls/month", included: true },
      { name: "Priority support", included: true },
      { name: "Custom domains", included: true },
      { name: "Export data", included: true },
    ],
    limits: {
      maxArticles: 999999,
      maxApiKeys: 999999,
      maxStorageBytes: 1024 * 1024 * 1024, // 1GB
      maxApiCallsPerMonth: 100000,
      analyticsEnabled: true,
      features: {
        analytics: true,
        customDomains: true,
        prioritySupport: true,
        dataExport: true,
        bulkOperations: true,
      },
    },
  },
};

/**
 * Get plan by ID
 */
export const getPlan = (planId: SubscriptionPlan): Plan => {
  return SUBSCRIPTION_PLANS[planId];
};

/**
 * Get plan pricing for specific interval
 */
export const getPlanPrice = (planId: SubscriptionPlan, interval: SubscriptionInterval): PlanPrice | undefined => {
  const plan = getPlan(planId);
  return plan.prices.find(price => price.interval === interval);
};

/**
 * Get all plans
 */
export const getAllPlans = (): Plan[] => {
  return Object.values(SUBSCRIPTION_PLANS);
};

/**
 * Check if a plan has a specific feature
 */
export const planHasFeature = (planId: SubscriptionPlan, featureName: keyof Plan['limits']['features']): boolean => {
  const plan = getPlan(planId);
  return plan.limits.features[featureName];
};

/**
 * Get plan limits
 */
export const getPlanLimits = (planId: SubscriptionPlan) => {
  return getPlan(planId).limits;
};