import { Polar } from "@polar-sh/sdk";
import { SubscriptionStatus } from "@polar-sh/sdk/models/components/subscriptionstatus.js";

export const polar = new Polar({
  server: process.env.POLAR_SERVER! as "production" | "sandbox",
  accessToken: process.env.POLAR_ACCESS_TOKEN!
})

export const getStatus = (status: SubscriptionStatus) => {
  switch (status) {
    case SubscriptionStatus.Active:
      return "Active";
    case SubscriptionStatus.Canceled:
      return "Canceled";
    case SubscriptionStatus.Incomplete:
      return "Incomplete";
    case SubscriptionStatus.IncompleteExpired:
      return "Incomplete Expired";
    case SubscriptionStatus.PastDue:
      return "Past Due";
    case SubscriptionStatus.Trialing:
      return "Trial Period";
    case SubscriptionStatus.Unpaid:
      return "Unpaid";
    default:
      return "Unknown";
  }
}