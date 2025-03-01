type Feature = {
  icon?: React.ReactNode;

  name: string;
  included: boolean;

  info?: string;
  limit?: number;
};

type Polar = {
  priceId: string;
  productId: string;
}

// type Pricing = {
//   name: string;
//   description: string;

//   price?: {
//     monthly: {
//       price: number;
//       polar: Polar;
//     };

//     yearly: {
//       price: number;
//       polar: Polar;
//     };
//   }
  
//   features: Feature[];
// };

type Plan = {
  Pro: {
    price: {
      monthly: number;
      yearly: number;
    }

    monthly: Polar;
    yearly: Polar;
  }
  Business: {
    price: {
      monthly: number;
      yearly: number;
    }

    monthly: Polar;
    yearly: Polar;
  }
};

export const Plans: Plan = {
  Pro: {
    price: {
      monthly: 12,
      yearly: 120
    },

    monthly: {
      priceId: "7f87925c-3d23-4bae-bed4-86e331df9d40",
      productId: "4c07234b-737a-408e-b287-5505ad0a9b1d"
    },

    yearly: {
      priceId: "d9fb49ea-a0ce-4fb1-854b-e3b938653489",
      productId: "9a7a4608-c6d2-4baf-b8f6-5e2e6db249d5"
    }
  },
  Business: {
    price: {
      monthly: 24,
      yearly: 220
    },

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

type PlanNameToPricesResponse = {
  monthly: Polar;
  yearly: Polar;
}

export const PlanNameToPrices = (plan: "Pro" | "Business"): PlanNameToPricesResponse => {
  return {
    monthly: Plans[plan].monthly,
    yearly: Plans[plan].yearly
  }
}