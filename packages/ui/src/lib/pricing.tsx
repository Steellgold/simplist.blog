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

export const getPlanByName = (name: PlanName): Plan | undefined => {
  return PLANS.find(plan => plan.type === name);
}

interface PlanCriteria {
  priceId?: string;
  name?: PlanName;
}

export const getPlanByCriteria = (criteria: PlanCriteria): Plan | undefined => {
  return PLANS.find(plan => {
    if (criteria.priceId) {
      return (plan.priceIds?.monthly === criteria.priceId) || (plan.priceIds?.yearly === criteria.priceId);
    }
    if (criteria.name) {
      return plan.type === criteria.name;
    }
    return false;
  });
}

export const getPeriodTypeByPID = (priceId: string): "monthly" | "yearly" | undefined => {
  const plan = PLANS.find(plan => {
    return plan.priceIds?.monthly === priceId || plan.priceIds?.yearly === priceId;
  });

  if (plan) {
    if (plan.priceIds?.monthly === priceId) {
      return "monthly";
    } else if (plan.priceIds?.yearly === priceId) {
      return "yearly";
    }
  }

  return undefined;
}