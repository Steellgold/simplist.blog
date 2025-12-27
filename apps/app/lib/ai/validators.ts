import type { ProjectSubscription } from "@/lib/subscription/quota-check";

/**
 * Minimum content length required for AI actions
 */
export const AI_MIN_CONTENT_LENGTH = 10;

/**
 * Check if AI features are available for the subscription
 * Returns true if the plan supports AI (both STARTER with BYOK and PRO)
 */
export const canUseAiFeatures = (
  subscription: ProjectSubscription | undefined,
): boolean => {
  if (!subscription) return false;
  return subscription.limits.features.aiFeatures === true;
};

/**
 * Check if the subscription has remaining AI quota
 * - STARTER with BYOK: Always true (unlimited)
 * - PRO with included credits: Check against limit
 */
export const hasRemainingQuota = (
  subscription: ProjectSubscription | undefined,
): boolean => {
  if (!subscription) return false;

  // If no included credits (BYOK), quota is unlimited
  if (!subscription.limits.features.aiIncludedCredits) {
    return true;
  }

  // PRO with included credits: check limit
  const limit = subscription.limits.maxAiRequestsPerMonth;
  const current = subscription.usage.aiRequests;

  // -1 means unlimited
  if (limit === -1) return true;

  return current < limit;
};

/**
 * Check if content meets minimum length for AI processing
 */
export const hasMinimumContentLength = (
  content: string | undefined,
  minLength: number = AI_MIN_CONTENT_LENGTH,
): boolean => {
  if (!content) return false;
  return content.trim().length >= minLength;
};

/**
 * Combined check: Can the user use AI features right now?
 * This validates subscription, quota, and API key for BYOK
 */
export const canExecuteAiAction = (
  subscription: ProjectSubscription | undefined,
): { allowed: boolean; reason?: string } => {
  // Check if AI features are enabled for the plan
  if (!canUseAiFeatures(subscription)) {
    return {
      allowed: false,
      reason: "AI features are not available on your plan.",
    };
  }

  // For STARTER (BYOK), check if API key is configured
  if (
    subscription &&
    !subscription.limits.features.aiIncludedCredits &&
    !subscription.hasApiKey
  ) {
    return {
      allowed: false,
      reason: "Please configure your OpenAI API key in project settings.",
    };
  }

  // Check quota for PRO plans
  if (!hasRemainingQuota(subscription)) {
    return {
      allowed: false,
      reason: "Monthly AI request limit reached. Upgrade or wait for reset.",
    };
  }

  return { allowed: true };
};

/**
 * Get a display message for AI availability
 */
export const getAiAvailabilityMessage = (
  subscription: ProjectSubscription | undefined,
): string | null => {
  const result = canExecuteAiAction(subscription);
  return result.allowed ? null : result.reason || "AI features unavailable";
};
