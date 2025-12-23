"use server";

import { getCurrentUser } from "@/lib/auth-helper";
import { stripe, STRIPE_PRODUCTS } from "@/lib/stripe/client";
import type { PaymentMethodInfo, SubscriptionInfo } from "@/lib/stripe/types";
import { prisma } from "@simplist/db";
import { redirect } from "next/navigation";
import type Stripe from "stripe";

/**
 * Extract payment method information from Stripe payment method object
 */
const extractPaymentMethodInfo = (
  paymentMethod: Stripe.PaymentMethod | string | null,
): PaymentMethodInfo | null => {
  if (!paymentMethod || typeof paymentMethod === "string") return null;

  const type = paymentMethod.type;

  // For card payments
  if (type === "card" && paymentMethod.card) {
    return {
      type: "card",
      brand: paymentMethod.card.brand,
      last4: paymentMethod.card.last4,
    };
  }

  // For other payment methods (sepa_debit, paypal, etc.)
  return {
    type: type,
  };
};

/**
 * Create a Stripe checkout session for Pro subscription
 */
export const createCheckoutSession = async (
  interval: "monthly" | "yearly",
  projectId?: string,
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
      select: { id: true, name: true, slug: true, stripeCustomerId: true },
    });
  } else {
    // Get user's projects to auto-select
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, slug: true, stripeCustomerId: true },
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
      `Stripe price ID not configured for ${interval} subscription`,
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
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${targetProject.slug}/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${targetProject.slug}/settings/billing?canceled=true`,
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
export const createBillingPortalSession = async (
  projectId: string,
): Promise<{ url: string }> => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/login");
  }

  // Get project with Stripe info
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: currentUser.id,
    },
    select: {
      slug: true,
      stripeCustomerId: true,
    },
  });

  if (!project?.stripeCustomerId) {
    throw new Error("No Stripe customer found for this project");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: project.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/${project.slug}/settings/billing`,
  });

  return { url: session.url };
};

/**
 * Get subscription information for a project
 */
export const getProjectSubscription = async (
  projectId: string,
): Promise<SubscriptionInfo | null> => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/login");
  }

  // Get project with Stripe info
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: currentUser.id,
    },
    select: {
      stripeSubscriptionId: true,
    },
  });

  if (!project?.stripeSubscriptionId) {
    return null;
  }

  // Fetch subscription from Stripe
  const subscription = await stripe.subscriptions.retrieve(
    project.stripeSubscriptionId,
  );

  return {
    status: subscription.status,
    currentPeriodStart: new Date(
      (subscription as any).current_period_start * 1000,
    ),
    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
    canceledAt: (subscription as any).canceled_at
      ? new Date((subscription as any).canceled_at * 1000)
      : null,
  };
};

/**
 * Get unified billing history (invoices + payments merged) for a project
 * Combines invoice data (number, PDF) with payment data (payment method)
 */
export const getProjectBillingHistory = async (projectId: string) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/login");
  }

  // Get project with Stripe info
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: currentUser.id,
    },
    select: {
      stripeCustomerId: true,
    },
  });

  if (!project?.stripeCustomerId) {
    return [];
  }

  // Fetch invoices and payment intents in parallel (EXACT FROM ARTICLE)
  const [invoicesList, paymentIntentsList] = await Promise.all([
    stripe.invoices.list({
      customer: project.stripeCustomerId,
      expand: ["data.payment_intent", "data.payment_intent.payment_method"],
      limit: 100,
    }),
    stripe.paymentIntents.list({
      customer: project.stripeCustomerId,
      expand: ["data.payment_method"],
      limit: 100,
    }),
  ]);

  // Get payment intent IDs that are already in invoices (EXACT FROM ARTICLE)
  const paymentIntentIdsInInvoices = invoicesList.data.flatMap((invoice) => {
    const pi = (invoice as any).payment_intent;
    if (!pi) return [];
    if (typeof pi === "string") return [pi];
    if (typeof pi === "object" && "id" in pi) return [pi.id];
    return [];
  });

  // Filter out standalone payments (EXACT FROM ARTICLE)
  const standalonePayments = paymentIntentsList.data.filter(
    (payment) => !paymentIntentIdsInInvoices.includes(payment.id),
  );

  // Create a map of payment intents for combining data
  const paymentIntentsMap = new Map(
    paymentIntentsList.data.map((pi) => [pi.id, pi]),
  );

  // Combine invoice and payment data into single entries
  const combinedEntries = invoicesList.data.map((invoice) => {
    let paymentMethod = null;

    // Try to get payment method from expanded payment_intent first
    const pi = (invoice as any).payment_intent;
    let piId: string | null = null;

    if (typeof pi === "string") {
      piId = pi;
    } else if (pi && typeof pi === "object" && "id" in pi) {
      piId = pi.id;
    }

    if (piId && paymentIntentsMap.has(piId)) {
      const matchingPI = paymentIntentsMap.get(piId)!;
      paymentMethod = extractPaymentMethodInfo(
        matchingPI.payment_method as Stripe.PaymentMethod | null,
      );
    }

    // If no payment method found via payment_intent, try to match by amount and date
    if (!paymentMethod) {
      const invoiceDate = new Date(invoice.created * 1000);
      const invoiceAmount = invoice.amount_due;

      // Find a payment with same amount and similar date (within 1 minute)
      const matchingPayment = paymentIntentsList.data.find((payment) => {
        const paymentDate = new Date(payment.created * 1000);
        const timeDiff = Math.abs(
          paymentDate.getTime() - invoiceDate.getTime(),
        );
        return payment.amount === invoiceAmount && timeDiff < 60000; // 1 minute
      });

      if (matchingPayment) {
        paymentMethod = extractPaymentMethodInfo(
          matchingPayment.payment_method as Stripe.PaymentMethod | null,
        );
      }
    }

    return {
      type: "invoice" as const,
      id: invoice.id,
      number: invoice.number,
      date: new Date(invoice.created * 1000),
      amount: invoice.amount_due,
      currency: invoice.currency.toUpperCase(),
      status: invoice.status,
      invoicePdfUrl: invoice.invoice_pdf,
      paymentMethod,
    };
  });

  // Add standalone payments (those not matched to any invoice)
  const unmatchedPayments = standalonePayments.filter((payment) => {
    // Check if this payment was used to match an invoice
    const paymentDate = new Date(payment.created * 1000);
    const paymentAmount = payment.amount;

    const wasMatched = invoicesList.data.some((invoice) => {
      const invoiceDate = new Date(invoice.created * 1000);
      const timeDiff = Math.abs(paymentDate.getTime() - invoiceDate.getTime());
      return invoice.amount_due === paymentAmount && timeDiff < 60000;
    });

    return !wasMatched;
  });

  const paymentEntries = unmatchedPayments.map((payment) => {
    const paymentMethod = extractPaymentMethodInfo(
      payment.payment_method as Stripe.PaymentMethod | null,
    );

    return {
      type: "payment" as const,
      id: payment.id,
      number: null,
      date: new Date(payment.created * 1000),
      amount: payment.amount,
      currency: payment.currency.toUpperCase(),
      status: payment.status,
      invoicePdfUrl: null,
      paymentMethod,
    };
  });

  // Merge and sort
  const billingEntries = [...combinedEntries, ...paymentEntries].sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );

  return billingEntries;
};
