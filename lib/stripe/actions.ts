"use server";

import { getCurrentUser } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";
import { stripe, STRIPE_PRODUCTS } from "@/lib/stripe/client";
import { redirect } from "next/navigation";

/**
 * Create a Stripe checkout session for Pro subscription
 */
export const createCheckoutSession = async (
  interval: "monthly" | "yearly",
  projectId?: string
): Promise<{ url: string }> => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/login");
  }

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  // Get or determine project
  let targetProject;
  if (projectId) {
    targetProject = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id },
      select: { id: true, name: true, stripeCustomerId: true },
    });
  } else {
    // Get user's projects to auto-select
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, stripeCustomerId: true },
    });
    
    if (projects.length === 0) {
      redirect("/create-project");
    } else if (projects.length === 1) {
      targetProject = projects[0];
    } else {
      // Multiple projects - should not happen without projectId
      throw new Error("Multiple projects found. Please specify a projectId.");
    }
  }

  if (!targetProject) {
    throw new Error("Project not found or access denied");
  }

  // Get or create Stripe customer (check project first, then user)
  let stripeCustomerId = targetProject.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user.id,
        projectId: targetProject.id,
      },
    });

    stripeCustomerId = customer.id;

    // Update project with Stripe customer ID
    await prisma.project.update({
      where: { id: targetProject.id },
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
      projectId: targetProject.id,
    },
    subscription_data: {
      metadata: {
        userId: user.id,
        projectId: targetProject.id,
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
export const createBillingPortalSession = async (projectId: string): Promise<{ url: string }> => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/login");
  }

  // Get project with Stripe info
  const project = await prisma.project.findFirst({
    where: { 
      id: projectId, 
      userId: currentUser.id 
    },
    select: {
      stripeCustomerId: true,
    },
  });

  if (!project?.stripeCustomerId) {
    throw new Error("No Stripe customer found for this project");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: project.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  });

  return { url: session.url };
};
