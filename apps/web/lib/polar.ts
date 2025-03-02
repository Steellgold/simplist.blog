import { Polar } from "@polar-sh/sdk";
import { SubscriptionStatus } from "@polar-sh/sdk/models/components/subscriptionstatus.js";
import { BadgeSubscriptionVariant } from "@workspace/ui/components/badge";

export const polar = new Polar({
  server: process.env.POLAR_SERVER! as "production" | "sandbox",
  accessToken: process.env.POLAR_ACCESS_TOKEN!
})

type GetStatusReturnType = {
  classVariant: BadgeSubscriptionVariant;
  status: string;
};

export const getStatus = (status: SubscriptionStatus): GetStatusReturnType => {
  switch (status) {
    case SubscriptionStatus.Active:
      return { classVariant: "subscriptionActive", status: "Active" };
    case SubscriptionStatus.Canceled:
      return { classVariant: "subscriptionCanceled", status: "Canceled" };
    case SubscriptionStatus.Incomplete:
      return { classVariant: "subscriptionIncomplete", status: "Incomplete" };
    case SubscriptionStatus.IncompleteExpired:
      return { classVariant: "subscriptionIncompleteExpired", status: "Incomplete Expired" };
    case SubscriptionStatus.PastDue:
      return { classVariant: "subscriptionPastDue", status: "Past Due" };
    case SubscriptionStatus.Trialing:
      return { classVariant: "subscriptionTrialing", status: "Trial Period" };
    case SubscriptionStatus.Unpaid:
      return { classVariant: "subscriptionUnpaid", status: "Unpaid" };
    default:
      return { classVariant: "subscriptionUnknown", status: "Unknown" };
  }
}