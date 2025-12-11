import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17.clover",
  typescript: true,
});

// Product and Price IDs (set these in your .env.local after creating in Stripe)
export const STRIPE_PRODUCTS = {
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
  },
};

/**
 * Get subscription expiration date since current_period_end doesn't exist
 */
export const getSubscriptionExpiryDate = (subscription: Stripe.Subscription): Date => {
  // Calculate expiry based on subscription creation and billing cycle
  const createdAt = new Date(subscription.created * 1000);
  const interval = subscription.items.data[0]?.price?.recurring?.interval;
  
  if (interval === "month") {
    // Add 1 month
    const expiry = new Date(createdAt);
    expiry.setMonth(expiry.getMonth() + 1);
    return expiry;
  } else if (interval === "year") {
    // Add 1 year
    const expiry = new Date(createdAt);
    expiry.setFullYear(expiry.getFullYear() + 1);
    return expiry;
  }
  
  // Default to 1 month if interval is unknown
  const expiry = new Date(createdAt);
  expiry.setMonth(expiry.getMonth() + 1);
  return expiry;
};
