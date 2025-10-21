"use server";

import { getCurrentUser } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";
import { stripe, STRIPE_PRODUCTS } from "@/lib/stripe/client";
import { redirect } from "next/navigation";

/**
 * Create a Stripe checkout session for Pro subscription
 */
export const createCheckoutSession = async (
  interval: "monthly" | "yearly"
): Promise<{ url: string }> => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/login");
  }

  // Get full user data with Stripe info
  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      id: true,
      email: true,
      name: true,
      stripeCustomerId: true,
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  // Get or create Stripe customer
  let stripeCustomerId = user.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user.id,
      },
    });

    stripeCustomerId = customer.id;

    // Update user with Stripe customer ID
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId },
    });
  }

  const priceId =
    interval === "monthly"
      ? STRIPE_PRODUCTS.pro.monthly
      : STRIPE_PRODUCTS.pro.yearly;

  if (!priceId) {
    throw new Error(
      `Stripe price ID not configured for ${interval} subscription`
    );
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "subscription",
    payment_method_types: ["card"],
    allow_promotion_codes: true,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
    metadata: {
      userId: user.id,
    },
    subscription_data: {
      metadata: {
        userId: user.id,
      },
    },
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  return { url: session.url };
};

/**
 * Create a Stripe billing portal session
 */
export const createBillingPortalSession = async (): Promise<{ url: string }> => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/login");
  }

  // Get full user data with Stripe info
  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      stripeCustomerId: true,
    },
  });

  if (!user?.stripeCustomerId) {
    throw new Error("No Stripe customer found");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  });

  return { url: session.url };
};
