import { Plan, PlanId, PlanPrice, SubscriptionInterval } from "./types.js";

export const SUBSCRIPTION_PLANS: Record<PlanId, Plan> = {
  STARTER: {
    id: "STARTER",
    name: "Starter",
    description: "Perfect for exploring the platform.",
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
      { name: "Basic analytics", included: true },
      { name: "50MB storage", included: true },
      { name: "1,000 API calls/month", included: true },
      { name: "Language variants", included: false },
    ],
    limits: {
      maxArticles: 5,
      maxStorageBytes: 15 * 1024 * 1024, // 15MB
      maxApiCallsPerMonth: 1000,
      maxVariantsPerArticle: 0, // STARTER: No variants allowed
      maxMembers: 1, // STARTER: Solo mode only (owner)
      maxWebhooks: 1,
      features: {
        analytics: false, // Advanced analytics are PRO only
        postVariants: false, // Not available on STARTER
        scheduledPublishing: false,
        prioritySupport: true,
        bulkOperations: false,
        webhooks: true,
      },
    },
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    description: "Ideal for creators looking for advanced features.",
    highlight: "Most Popular",
    popular: true,
    prices: [
      {
        amount: 9.99,
        interval: "monthly",
        displayAmount: "$9.99",
        displayInterval: "/month",
      },
      {
        amount: 7.99,
        interval: "yearly",
        displayAmount: "$7.99",
        displayInterval: "/month billed yearly",
        yearlyEquivalent: "$95.00/year",
        savings: "Save $24.00",
      },
    ],
    features: [
      { name: "Unlimited articles", included: true },
      { name: "Advanced analytics", included: true },
      { name: "1GB storage", included: true },
      { name: "Unlimited API calls/month", included: true },
      { name: "Up to 10 team members", included: true },
      { name: "Priority support", included: true },
      { name: "Language variants", included: true },
      { name: "Scheduled publishing", included: true },
    ],
    limits: {
      maxArticles: -1,
      maxStorageBytes: 1024 * 1024 * 1024, // 1GB
      maxApiCallsPerMonth: -1, // PRO: unlimited API calls
      maxVariantsPerArticle: -1, // PRO: unlimited variants per article
      maxMembers: 10, // PRO: Up to 10 team members
      maxWebhooks: 20,
      features: {
        analytics: true, // PRO has full access to advanced analytics
        postVariants: true,
        scheduledPublishing: true,
        prioritySupport: true,
        bulkOperations: true,
        webhooks: true,
      },
    },
  },
};

/**
 * Get plan by ID
 */
export const getPlan = (planId: PlanId): Plan => {
  return SUBSCRIPTION_PLANS[planId];
};

/**
 * Get plan pricing for specific interval
 */
export const getPlanPrice = (
  planId: PlanId,
  interval: SubscriptionInterval,
): PlanPrice | undefined => {
  const plan = getPlan(planId);
  return plan.prices.find((price) => price.interval === interval);
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
export const planHasFeature = (
  planId: PlanId,
  featureName: keyof Plan["limits"]["features"],
): boolean => {
  const plan = getPlan(planId);
  return plan.limits.features[featureName];
};

/**
 * Get plan limits
 */
export const getPlanLimits = (planId: PlanId) => {
  return getPlan(planId).limits;
};

export function isPlanFree(planId: PlanId): boolean {
  return planId === "STARTER";
}

export function canUpgradeFrom(
  currentPlan: PlanId,
  targetPlan: PlanId,
): boolean {
  if (currentPlan === "STARTER" && targetPlan === "PRO") return true;
  return false;
}
