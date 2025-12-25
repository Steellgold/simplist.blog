"use client";

import { MiniBadge } from "@/components/ui/mini-badge";
import { ChartAreaStackedNormalized, CreditCard } from "@gravity-ui/icons";
import { buttonVariants } from "@simplist/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@simplist/ui/components/card";
import { Progress } from "@simplist/ui/components/progress";
import { format } from "date-fns";
import Link from "next/link";

interface SubscriptionCardProps {
  projectSlug: string;
  subscriptionTier: "STARTER" | "PRO";
  monthlyApiCalls: number;
  apiCallsLimit: number;
  apiCallsResetAt: Date;
  subscriptionExpiresAt?: Date | null;
}

export const SubscriptionCard = ({
  projectSlug,
  subscriptionTier,
  monthlyApiCalls,
  apiCallsLimit,
  apiCallsResetAt,
  subscriptionExpiresAt,
}: SubscriptionCardProps) => {
  const isPro = subscriptionTier === "PRO";
  const apiCallsPercentage =
    apiCallsLimit > 0 ? (monthlyApiCalls / apiCallsLimit) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Subscription</CardTitle>
          <MiniBadge tier={isPro ? "LPRO" : "LSTARTER"} size="md" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-muted-foreground mb-2 text-sm">
            {isPro
              ? "You're on the Pro plan with unlimited features"
              : "You're on the free Starter plan"}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">API Calls This Month</span>
            <span className="font-medium">
              {monthlyApiCalls.toLocaleString()} /{" "}
              {apiCallsLimit === -1
                ? "Unlimited"
                : apiCallsLimit.toLocaleString()}
            </span>
          </div>
          <Progress value={apiCallsPercentage} className="h-2" />
          <p className="text-muted-foreground text-xs">
            Resets on {format(new Date(apiCallsResetAt), "MMMM d, yyyy")}
          </p>
        </div>

        {isPro && subscriptionExpiresAt && (
          <div className="border-t pt-2">
            <p className="text-muted-foreground text-sm">
              Next billing date:{" "}
              <span className="text-foreground font-medium">
                {format(new Date(subscriptionExpiresAt), "MMMM d, yyyy")}
              </span>
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {isPro ? (
          <Link
            className={buttonVariants({
              variant: "outline",
              className: "w-full",
            })}
            href={`/${projectSlug}/settings/billing`}
          >
            <CreditCard />
            Manage Subscription
          </Link>
        ) : (
          <Link
            className={buttonVariants({
              variant: "default",
              className: "w-full",
            })}
            href="/pricing"
          >
            <ChartAreaStackedNormalized />
            Upgrade to Pro
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};
