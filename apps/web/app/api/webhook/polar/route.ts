import { Webhooks } from "@polar-sh/nextjs";

export const POST = Webhooks({
	webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
	onPayload: async (payload) => {
		// Handle the event
		switch (payload.type) {
			// Subscription has been created
			case "subscription.created":
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