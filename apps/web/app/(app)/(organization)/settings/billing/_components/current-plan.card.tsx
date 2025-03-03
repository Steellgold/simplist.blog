"use client";

import { usePlan } from "@/hooks/use-plan";
import { Subscription } from "@better-auth/stripe";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Component } from "@workspace/ui/components/utils/component";
import { isYearlyPlan, Plan } from "@workspace/ui/lib/pricing";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type BillingCurrentPlanCardProps = {
  plan: Plan | undefined;
  subscription: Subscription;
};

export const BillingCurrentPlanCard: Component<BillingCurrentPlanCardProps> = ({ plan, subscription }) => {
  const [pending, setPending] = useState(false);

  if (!plan) return <></>;

  // return (
  //   <pre>
  //     {JSON.stringify({ plan, subscription }, null, 2)}
  //   </pre>
  // )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Plan</CardTitle>
        <CardDescription>Manage your subscription and billing details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-2xl font-semibold">{plan.name}</p>
            <p className="text-muted-foreground">
              ${isYearlyPlan(subscription.priceId ?? "") ? plan.price?.yearly : plan.price?.monthly}
              ,00 per {isYearlyPlan(subscription.priceId ?? "") ? "year" : "month"}
            </p>
          </div>

          <Button size={"sm"}>
            {pending ? <Loader2 className="animate-spin" /> : "Manage Subscription"}
          </Button>
        </div>

        <div className="space-x-2 flex flex-row">
          {/* <Badge variant={"default"} className="flex items-center gap-1.5 text-sm">
            <CheckCircle2 size={14} />
            <span>{status}</span>
          </Badge>

          <Badge className="flex items-center gap-1.5 text-sm" variant={"secondary"}>
            <Calendar size={14} />
            {subscription.cancelAtPeriodEnd
              ? "Will cancel at period end"
              : <span>Next billing date: {dayJS(subscription.currentPeriodEnd).format("MMMM D, YYYY")}</span>
            }
          </Badge> */}
        </div>
      </CardContent>
    </Card>
  );
}