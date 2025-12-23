import type Stripe from "stripe";

export type BillingEntryType = "invoice" | "payment";

export type PaymentMethodInfo = {
  type: string;
  brand?: string;
  last4?: string;
};

export type BillingEntry = {
  type: BillingEntryType;
  id: string;
  number?: string | null;
  date: Date;
  amount: number;
  currency: string;
  status: Stripe.Invoice.Status | Stripe.PaymentIntent.Status | null;
  invoicePdfUrl?: string | null;
  paymentMethod?: PaymentMethodInfo | null;
};

export type SubscriptionInfo = {
  status: Stripe.Subscription.Status;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
};
