import { prisma } from "@simplist/db";
import { getSubscriptionExpiryDate, stripe } from "@/lib/stripe/client";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

interface InvoiceWithSubscription extends Stripe.Invoice {
  subscription?: string | null;
}

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
          const projectId = session.metadata?.projectId;

          if (!userId || !projectId) {
            console.error("No userId or projectId in session metadata");
            break;
          }

          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          await prisma.project.update({
            where: { 
              id: projectId,
              userId: userId 
            },
            data: {
              subscriptionTier: "PRO",
              subscriptionExpiresAt: getSubscriptionExpiryDate(subscription),
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscription.id,
            },
          });

          console.log(`Subscription activated for project ${projectId} (user ${userId})`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const projectId = subscription.metadata?.projectId;

        if (!userId || !projectId) {
          console.error("No userId or projectId in subscription metadata");
          break;
        }

        // Update subscription status and expiration
        await prisma.project.update({
          where: { 
            id: projectId,
            userId: userId 
          },
          data: {
            subscriptionTier: subscription.status === "active" ? "PRO" : "STARTER",
            subscriptionExpiresAt:
              subscription.status === "active"
                ? getSubscriptionExpiryDate(subscription)
                : null,
          },
        });

        console.log(`Subscription updated for project ${projectId} (user ${userId}): ${subscription.status}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const projectId = subscription.metadata?.projectId;

        if (!userId || !projectId) {
          console.error("No userId or projectId in subscription metadata");
          break;
        }

        // Downgrade to free plan
        await prisma.project.update({
          where: { 
            id: projectId,
            userId: userId 
          },
          data: {
            subscriptionTier: "STARTER",
            subscriptionExpiresAt: null,
            stripeSubscriptionId: null,
          },
        });

        console.log(`Subscription canceled for project ${projectId} (user ${userId})`);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as InvoiceWithSubscription;

        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription
          );

          const userId = subscription.metadata?.userId;
          const projectId = subscription.metadata?.projectId;

          if (!userId || !projectId) {
            console.error("No userId or projectId in subscription metadata");
            break;
          }

          // Update subscription expiration on successful payment
          await prisma.project.update({
            where: { 
              id: projectId,
              userId: userId 
            },
            data: {
              subscriptionTier: "PRO",
              subscriptionExpiresAt: getSubscriptionExpiryDate(subscription),
            },
          });

          console.log(`Payment succeeded for project ${projectId} (user ${userId})`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as InvoiceWithSubscription;

        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription
          );

          const userId = subscription.metadata?.userId;
          const projectId = subscription.metadata?.projectId;

          if (userId && projectId) {
            console.warn(`Payment failed for project ${projectId} (user ${userId})`);
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
