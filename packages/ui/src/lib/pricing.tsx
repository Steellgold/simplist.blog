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

type Polar = {
  priceId: string;
  productId: string;
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

  polar?: {
    monthly: Polar;
    yearly: Polar;
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
    polar: {
      monthly: {
        priceId: "7f87925c-3d23-4bae-bed4-86e331df9d40",
        productId: "4c07234b-737a-408e-b287-5505ad0a9b1d"
      },
  
      yearly: {
        priceId: "d9fb49ea-a0ce-4fb1-854b-e3b938653489",
        productId: "9a7a4608-c6d2-4baf-b8f6-5e2e6db249d5"
      }
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
    polar: {
      monthly: {
        priceId: "3914fe73-08d0-4409-8bc3-04d35d6c24fe",
        productId: "c6b9f423-6ff9-42b0-8ed9-314ef94cfceb"
      },
      yearly: {
        priceId: "27ef5f89-1a9e-4b49-bacd-fd5e9fe70b63",
        productId: "a728459b-f242-4bd3-bb5b-f0f4a62c7e0c"
      }
    }
  }
];

export const getPlanByName = (name: PlanName): Plan | undefined => {
  return PLANS.find(plan => plan.type === name);
}