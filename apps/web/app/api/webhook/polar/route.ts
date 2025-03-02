import { prisma } from "@/lib/prisma";
import { Webhooks } from "@polar-sh/nextjs";
import { Subscription } from "@polar-sh/sdk/models/components/subscription.js";
import { getPlanByCriteria } from "@workspace/ui/lib/pricing";
import { z } from "zod";

type WebhookSubscriptionCreatedPayload = {
  type?: "subscription.created" | undefined;
  data: Subscription;
};

type WebhookSubscriptionCanceledPayload = {
  type?: "subscription.canceled" | undefined;
  data: Subscription;
};

type WebhookSubscriptionUncanceledPayload = {
  type?: "subscription.uncanceled" | undefined;
  data: Subscription;
};

export const POST = Webhooks({
	webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
	onPayload: async (payload) => {
		switch (payload.type) {
			case "subscription.created":
        await handleSubscriptionCreated(payload as WebhookSubscriptionCreatedPayload);
				break;

			case "subscription.updated":
				break;

			case "subscription.active":
				break;

			case "subscription.revoked":
				break;

			case "subscription.canceled":
        await handleSubscriptionCanceled(payload as WebhookSubscriptionCanceledPayload);
				break;

      case "subscription.uncanceled":
        await handleSubscriptionUncanceled(payload as WebhookSubscriptionUncanceledPayload);
        break;

			default:
				console.log(`Unhandled event type ${payload.type}`);
		}
	}
})

const handleSubscriptionCreated = async (payload: WebhookSubscriptionCreatedPayload) => {
  const organizationId = payload.data.metadata.organizationId;
  const schema = z.object({ organizationId: z.string() }).safeParse({ organizationId });
  if (!schema.success) return;

  const plan = getPlanByCriteria({ productId: payload.data.productId });

  await prisma.organization.update({
    where: { id: schema.data.organizationId },
    data: {
      metadata: JSON.stringify({
        plan: plan?.name.toLowerCase(),
        startedAt: payload.data.currentPeriodStart,
        endsAt: payload.data.currentPeriodEnd,
        subscriptionId: payload.data.id,
        checkoutId: payload.data.checkoutId,
        customerId: payload.data.customerId,
        status: "active"
      })
    }
  });
}

const handleSubscriptionCanceled = async (payload: WebhookSubscriptionCanceledPayload) => {
  const organizationId = payload.data.metadata.organizationId;
  const schema = z.object({ organizationId: z.string() }).safeParse({ organizationId });
  if (!schema.success) return;

  const metadata = await prisma.organization.findUnique({
    where: { id: schema.data.organizationId },
    select: { metadata: true }
  });
  if (!metadata) return;

  const newMetadata = {
    ...metadata,
    status: "canceled"
  };

  await prisma.organization.update({
    where: { id: schema.data.organizationId },
    data: { metadata: JSON.stringify(newMetadata) }
  });
}

const handleSubscriptionUncanceled = async (payload: WebhookSubscriptionUncanceledPayload) => {
  const organizationId = payload.data.metadata.organizationId;
  const schema = z.object({ organizationId: z.string() }).safeParse({ organizationId });
  if (!schema.success) return;

  const metadata = await prisma.organization.findUnique({
    where: { id: schema.data.organizationId },
    select: { metadata: true }
  });

  if (!metadata) return;

  const newMetadata = {
    ...metadata,
    status: "active"
  };

  await prisma.organization.update({
    where: { id: schema.data.organizationId },
    data: { metadata: JSON.stringify(newMetadata) }
  });
}