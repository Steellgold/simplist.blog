import { prisma } from "@/lib/prisma";
import { Webhooks } from "@polar-sh/nextjs";
import { Subscription } from "@polar-sh/sdk/models/components/subscription.js";
import { getPlanByCriteria } from "@workspace/ui/lib/pricing";
import { z } from "zod";

type WebhookSubscriptionCreatedPayload = {
  type?: "subscription.created" | undefined;
  data: Subscription;
};

export const POST = Webhooks({
	webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
	onPayload: async (payload) => {
		// Handle the event
		switch (payload.type) {
			case "subscription.created":
        await handleSubscriptionCreated(payload as WebhookSubscriptionCreatedPayload);
				break;

			// A catch-all case to handle all subscription webhook events
			case "subscription.updated":
				break;

			// Subscription has been activated
			case "subscription.active":
				break;

			// Subscription has been revoked/peroid has ended with no renewal
			case "subscription.revoked":
				break;

			// Subscription has been explicitly canceled by the user
			case "subscription.canceled":
				break;

      // Subscription has been un-canceled by the user
      case "subscription.uncanceled":
        break;

			default:
				console.log(`Unhandled event type ${payload.type}`);
		}
	}
})

const handleSubscriptionCreated = async (payload: WebhookSubscriptionCreatedPayload) => {
  const organizationId = payload.data.metadata.organizationId;
  const schema = z.object({ organizationId: z.string() }).safeParse({ organizationId });

  if (!schema.success) {
    console.error("Invalid organizationId");
    return;
  }

  const plan = getPlanByCriteria({ productId: payload.data.productId });

  await prisma.$queryRaw`UPDATE "organization" SET metadata = ${{
    plan: plan?.name.toLowerCase(),
    startedAt: payload.data.currentPeriodStart,
    endsAt: payload.data.currentPeriodEnd,
    subscriptionId: payload.data.id,
    checkoutId: payload.data.checkoutId,
    customerId: payload.data.customerId
  }}::jsonb WHERE id = ${schema.data.organizationId}`;
}