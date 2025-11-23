"use client";

import { MiniBadge } from "@/components/ui/mini-badge";
import { Button } from "@simplist/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@simplist/ui/components/card";
import { Progress } from "@simplist/ui/components/progress";
import { format } from "date-fns";
import { CreditCard, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

interface SubscriptionCardProps {
  projectId: string;
  subscriptionTier: "STARTER" | "PRO";
  monthlyApiCalls: number;
  apiCallsLimit: number;
  apiCallsResetAt: Date;
  subscriptionExpiresAt?: Date | null;
}

export const SubscriptionCard = ({
  projectId,
  subscriptionTier,
  monthlyApiCalls,
  apiCallsLimit,
  apiCallsResetAt,
  subscriptionExpiresAt,
}: SubscriptionCardProps) => {
  const router = useRouter();
  const isPro = subscriptionTier === "PRO";
  const apiCallsPercentage = apiCallsLimit > 0 ? (monthlyApiCalls / apiCallsLimit) * 100 : 0;

  const handleManageBilling = async () => {
    router.push(`/p/${projectId}/settings/billing`);
  };

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
          <p className="text-sm text-muted-foreground mb-2">
            {isPro
              ? "You're on the Pro plan with unlimited features"
              : "You're on the free Starter plan"}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">API Calls This Month</span>
            <span className="font-medium">
              {monthlyApiCalls.toLocaleString()} / {apiCallsLimit.toLocaleString()}
            </span>
          </div>
          <Progress value={apiCallsPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Resets on {format(new Date(apiCallsResetAt), "MMMM d, yyyy")}
          </p>
        </div>

        {isPro && subscriptionExpiresAt && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              Next billing date:{" "}
              <span className="font-medium text-foreground">
                {format(new Date(subscriptionExpiresAt), "MMMM d, yyyy")}
              </span>
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {isPro ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleManageBilling}
          >
            <CreditCard />
            Manage Subscription
          </Button>
        ) : (
          <Button
            variant="default"
            className="w-full"
            onClick={() => router.push("/pricing")}
          >
            <TrendingUp />
            Upgrade to Pro
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
