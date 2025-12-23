export type SubscriptionInterval = "monthly" | "yearly";

export type PlanId = "STARTER" | "PRO";

export type StarterPlanId = "STARTER";
export type ProPlanId = "PRO";

export type PlanIds = StarterPlanId | ProPlanId;

export interface PlanPrice {
  amount: number;
  interval: SubscriptionInterval;
  displayAmount: string;
  displayInterval: string;
  yearlyEquivalent?: string;
  savings?: string;
}

export interface PlanFeature {
  name: string;
  included: boolean | number;
  limit?: string | number;
}

export interface PlanLimits {
  maxArticles: number;
  maxStorageBytes: number;
  maxApiCallsPerMonth: number;
  maxVariantsPerArticle: number;
  maxMembers: number;
  maxWebhooks: number;
  features: {
    analytics: boolean;
    postVariants: boolean;
    scheduledPublishing: boolean;
    prioritySupport: boolean;
    bulkOperations: boolean;
    webhooks: boolean;
  };
}

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  popular?: boolean;
  highlight?: string;
  prices: PlanPrice[];
  features: PlanFeature[];
  limits: PlanLimits;
}
