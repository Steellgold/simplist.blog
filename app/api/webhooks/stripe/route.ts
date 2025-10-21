import { prisma } from "@/lib/db";
import { stripe, getSubscriptionExpiryDate } from "@/lib/stripe/client";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const POST = async (req: Request) => {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Handle successful subscription
        if (session.mode === "subscription" && session.subscription) {
          const userId = session.metadata?.userId;

          if (!userId) {
            console.error("No userId in session metadata");
            break;
          }

          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          await prisma.user.update({
            where: { id: userId },
            data: {
              subscription: "pro",
              subscriptionExpiresAt: getSubscriptionExpiryDate(subscription),
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscription.id,
            },
          });

          console.log(`Subscription activated for user ${userId}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          console.error("No userId in subscription metadata");
          break;
        }

        // Update subscription status and expiration
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscription: subscription.status === "active" ? "pro" : "free",
            subscriptionExpiresAt:
              subscription.status === "active"
                ? getSubscriptionExpiryDate(subscription)
                : null,
          },
        });

        console.log(`Subscription updated for user ${userId}: ${subscription.status}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          console.error("No userId in subscription metadata");
          break;
        }

        // Downgrade to free plan
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscription: "free",
            subscriptionExpiresAt: null,
            stripeSubscriptionId: null,
          },
        });

        console.log(`Subscription canceled for user ${userId}`);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.subscription_id) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription_id as string
          );

          const userId = subscription.metadata?.userId;

          if (!userId) {
            console.error("No userId in subscription metadata");
            break;
          }

          // Update subscription expiration on successful payment
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscription: "pro",
              subscriptionExpiresAt: getSubscriptionExpiryDate(subscription),
            },
          });

          console.log(`Payment succeeded for user ${userId}`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.subscription_id) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription_id as string
          );

          const userId = subscription.metadata?.userId;

          if (userId) {
            console.warn(`Payment failed for user ${userId}`);
            // Optionally send notification or handle failed payment
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
};
