import { Subscription } from "@better-auth/stripe";
import { dayJS } from "./dayjs";
import { ReactElement } from "react";
import { CheckCircle2, X } from "lucide-react";

export const PRO_PRICE_IDS = {
	monthly: process.env.NODE_ENV === "production" ? "" : "price_1QyFLhI0lz8qZXd60sHlArXd",
  yearly: process.env.NODE_ENV === "production" ? "" : "price_1QyFLhI0lz8qZXd6ZD2rCECq"
};

export const BUSINESS_PRICE_IDS = {
  monthly: process.env.NODE_ENV === "production" ? "" : "price_1QyFJaI0lz8qZXd6f1fxiafj",
  yearly: process.env.NODE_ENV === "production" ? "" : "price_1QyFJaI0lz8qZXd6W0dwyUSK"
};

enum PlanType {
  HOBBY = "Hobby",
  PRO = "Pro",
  BUSINESS = "Business",
}

type PlanName = "Hobby" | "Pro" | "Business";

enum Feature {
  // Content Limits
  POSTS = "posts",
  MEDIA_STORAGE = "media_storage", // GB
  MEDIA_FILE_SIZE = "media_file_size", // MB
  CATEGORIES = "categories",
  TAGS = "tags",

  // API
  API_REQUESTS = "api_requests", // per day
  CUSTOM_FIELDS = "custom_fields",
  WEBHOOKS = "webhooks",

  // Team
  SIZE = "size",
  VERSIONS = "versions",
  SCHEDULED_PUBLISHING = "scheduled_posts",

  // Advanced
  ANALYTICS = "analytics",

  // Support
  PRIORITIZED_SUPPORT = "prioritized_support"
}

export interface FeatureLimits {
  [Feature.POSTS]: number;
}

interface Plan {
  type: PlanType;
  name: string;
  description: string;
  price?: {
    monthly: number;
    yearly: number;
  }
  limits: FeatureLimits;
  recommended?: boolean;

  priceIds?: {
    monthly: string;
    yearly: string;
  }
}

export const PLANS: Plan[] = [
  {
    type: PlanType.HOBBY,
    name: "Hobby",
    description: "For individuals or small teams just getting started",
    limits: {
      [Feature.POSTS]: 10
    },
    recommended: false,
  },
  {
    type: PlanType.PRO,
    name: "Pro",
    description: "For growing teams that need more features",
    price: {
      monthly: 12,
      yearly: 120,
    },
    limits: {
      [Feature.POSTS]: 500
    },
    recommended: true,
    priceIds: {
      monthly: PRO_PRICE_IDS.monthly,
      yearly: PRO_PRICE_IDS.yearly
    }
  },
  {
    type: PlanType.BUSINESS,
    name: "Business",
    description: "For large teams that require advanced features",
    price: {
      monthly: 24,
      yearly: 240,
    },
    limits: {
      [Feature.POSTS]: 1000
    },
    recommended: false,
    priceIds: {
      monthly: BUSINESS_PRICE_IDS.monthly,
      yearly: BUSINESS_PRICE_IDS.yearly
    }
  }
];

export const parsePlanName = (name: string): PlanName => {
  return name.charAt(0).toUpperCase() + name.slice(1) as PlanName;
}

export const isYearlyPlan = (sub: Subscription): boolean => {
  if (!sub.priceId) {
    if (sub.periodStart && sub.periodEnd) {
      const start = dayJS(sub.periodStart);
      const end = dayJS(sub.periodEnd);
      return end.diff(start, "month") >= 12;
    }

    return false;
  }

  return sub.priceId === PRO_PRICE_IDS.yearly || sub.priceId === BUSINESS_PRICE_IDS.yearly;
}

type GetBetterStatusReturn = {
  icon: ReactElement;
  text: string;
  badgeVariant: "subscriptionActive" |
                "subscriptionCanceled" |
                "subscriptionIncomplete" |
                "subscriptionIncompleteExpired" |
                "subscriptionPastDue" |
                "subscriptionTrialing" |
                "subscriptionUnpaid" |
                "subscriptionUnknown";
}

export const getBtterStatus = (status: Subscription["status"]): GetBetterStatusReturn => {
  switch (status) {
    case "active":
      return { icon: <CheckCircle2 />, text: "Active", badgeVariant: "subscriptionActive" };
    case "canceled":
      return { icon: <X />, text: "Canceled", badgeVariant: "subscriptionCanceled" };
    case "incomplete":
      return { icon: <X />, text: "Incomplete", badgeVariant: "subscriptionIncomplete" };
    case "incomplete_expired":
      return { icon: <X />, text: "Incomplete Expired", badgeVariant: "subscriptionIncompleteExpired" };
    case "past_due":
      return { icon: <X />, text: "Past Due", badgeVariant: "subscriptionPastDue" };
    case "trialing":
      return { icon: <X />, text: "Trialing", badgeVariant: "subscriptionTrialing" };
    case "unpaid":
      return { icon: <X />, text: "Unpaid", badgeVariant: "subscriptionUnpaid" };
    case "paused":
      return { icon: <X />, text: "Paused", badgeVariant: "subscriptionUnknown" };
    default:
      return { icon: <X />, text: "Unknown", badgeVariant: "subscriptionUnknown" };
  }
}


export const getPlanByName = (name: PlanName | undefined): Plan | undefined => {
  if (!name) return;
  return PLANS.find(plan => plan.type === name || plan.name === name.toLowerCase());
}

export default { PlanType };
export type { PlanName, Plan };