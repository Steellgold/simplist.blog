// Re-export everything from @simplist/limits for backward compatibility
export * from "@simplist/limits";

// Legacy exports for compatibility with existing code
import { SubscriptionTier } from "@simplist/db";
import {
  SUBSCRIPTION_PLANS as LIMITS_PLANS,
  type Plan as LimitsPlan,
  type PlanId,
  planHasFeature as basePlanHasFeature,
  getAllPlans as getAllBasePlans,
  getPlan as getBasePlan,
  getPlanLimits as getBasePlanLimits,
  getPlanPrice as getBasePlanPrice,
} from "@simplist/limits";

// Type mapping for compatibility
export interface Plan extends Omit<LimitsPlan, "id"> {
  id: SubscriptionTier;
}

// Convert plans to use SubscriptionTier type
export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, Plan> =
  LIMITS_PLANS as any;

// Legacy function wrappers that work with SubscriptionTier
export const getPlan = (planId: SubscriptionTier): Plan => {
  return getBasePlan(planId as PlanId) as Plan;
};

export const getAllPlans = (): Plan[] => {
  return getAllBasePlans() as Plan[];
};

export const getPlanPrice = (planId: SubscriptionTier, interval: any) => {
  return getBasePlanPrice(planId as PlanId, interval);
};

export const planHasFeature = (
  planId: SubscriptionTier,
  featureName: any,
): boolean => {
  return basePlanHasFeature(planId as PlanId, featureName);
};

export const getPlanLimits = (planId: SubscriptionTier) => {
  return getBasePlanLimits(planId as PlanId);
};
