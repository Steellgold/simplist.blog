"use client";

import type { SubscriptionInfo } from "@/lib/stripe/types";
import {
  Calendar,
  CircleCheck,
  CircleExclamation,
  CircleXmark,
} from "@gravity-ui/icons";
import { Badge } from "@simplist/ui/components/badge";
import { Card, CardContent, CardHeader } from "@simplist/ui/components/card";
import type Stripe from "stripe";

type SubscriptionInfoCardProps = {
  subscriptionInfo: SubscriptionInfo | null;
};

const getStatusBadge = (status: Stripe.Subscription.Status) => {
  switch (status) {
    case "active":
      return (
        <Badge variant="default" className="gap-1">
          <CircleCheck className="size-3" />
          Active
        </Badge>
      );
    case "canceled":
      return (
        <Badge variant="destructive" className="gap-1">
          <CircleXmark className="size-3" />
          Canceled
        </Badge>
      );
    case "past_due":
      return (
        <Badge variant="destructive" className="gap-1">
          <CircleExclamation className="size-3" />
          Past Due
        </Badge>
      );
    case "incomplete":
    case "incomplete_expired":
      return (
        <Badge variant="secondary" className="gap-1">
          <CircleExclamation className="size-3" />
          Incomplete
        </Badge>
      );
    case "trialing":
      return (
        <Badge variant="secondary" className="gap-1">
          <CircleCheck className="size-3" />
          Trial
        </Badge>
      );
    case "unpaid":
      return (
        <Badge variant="destructive" className="gap-1">
          <CircleExclamation className="size-3" />
          Unpaid
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

export const SubscriptionInfoCard = ({
  subscriptionInfo,
}: SubscriptionInfoCardProps) => {
  if (!subscriptionInfo) {
    return null;
  }

  const { status, currentPeriodEnd, cancelAtPeriodEnd, canceledAt } =
    subscriptionInfo;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Subscription Status</h3>
          {getStatusBadge(status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Calendar className="size-4" />
            <span>Next payment date</span>
          </div>
          <span className="text-sm font-medium">
            {cancelAtPeriodEnd ? "No renewal" : formatDate(currentPeriodEnd)}
          </span>
        </div>

        {cancelAtPeriodEnd && (
          <div className="border-destructive/50 bg-destructive/10 rounded-md border p-3">
            <p className="text-destructive text-sm">
              Your subscription will end on {formatDate(currentPeriodEnd)}
              {canceledAt && ` (canceled on ${formatDate(canceledAt)})`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
