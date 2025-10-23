export type SubscriptionInterval = "monthly" | "yearly";
export type SubscriptionPlan = "STARTER" | "PRO";

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
      postVariants: boolean;
      scheduledPublishing: boolean;
      prioritySupport: boolean;
      bulkOperations: boolean;
    };
  };
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, Plan> = {
  STARTER: {
    id: "STARTER",
    name: "STARTER",
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
      { name: "50MB storage", included: true },
      { name: "1,000 API calls/month", included: true },
    ],
    limits: {
      maxArticles: 5,
      maxApiKeys: 1,
      maxStorageBytes: 50 * 1024 * 1024, // 50MB
      maxApiCallsPerMonth: 1000,
      analyticsEnabled: true,
      features: {
        analytics: true,
        postVariants: false,
        scheduledPublishing: false,
        prioritySupport: true,
        bulkOperations: false,
      },
    },
  },
  PRO: {
    id: "PRO",
    name: "Pro", 
    description: "For serious content creators",
    highlight: "Most Popular",
    popular: true,
    prices: [
      {
        amount: 19,
        interval: "monthly",
        displayAmount: "$19",
        displayInterval: "/month",
      },
      {
        amount: 14,
        interval: "yearly",
        displayAmount: "$14",
        displayInterval: "/month billed yearly",
        yearlyEquivalent: "$168/year",
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
      { name: "Articles language variants", included: true },
      { name: "Scheduled publishing", included: true },
    ],
    limits: {
      maxArticles: -1,
      maxApiKeys: -1,
      maxStorageBytes: 1024 * 1024 * 1024, // 1GB
      maxApiCallsPerMonth: 500000,
      analyticsEnabled: true,
      features: {
        analytics: true,
        postVariants: true,
        scheduledPublishing: true,
        prioritySupport: true,
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