"use client";

import { Subscription } from "@better-auth/stripe";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Component } from "@workspace/ui/components/utils/component";
import { getBtterStatus, isYearlyPlan, Plan } from "@/lib/pricing";
import { CancelSubscriptionDialog } from "./cancel-subscription.dialog";
import { Badge } from "@workspace/ui/components/badge";
import { Calendar } from "lucide-react";
import { dayJS } from "@/lib/dayjs";
import { cloneElement } from "react";

type BillingCurrentPlanCardProps = {
  plan: Plan | undefined;
  subscription: Subscription;
};

export const BillingCurrentPlanCard: Component<BillingCurrentPlanCardProps> = ({ plan, subscription }) => {
  if (!plan) return <></>;

  const status = getBtterStatus(subscription.status);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Plan</CardTitle>
        <CardDescription>Manage your subscription and billing details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center border border-muted rounded-md p-4">
          <div>
            <p className="text-2xl font-bold">{plan.name}</p>
            <p className="text-muted-foreground">
              ${isYearlyPlan(subscription) ? plan.price?.yearly : plan.price?.monthly},00 per {isYearlyPlan(subscription) ? "year" : "month"}
            </p>
          </div>

          <CancelSubscriptionDialog />
        </div>

        <div className="space-x-2 flex flex-row">
          <Badge variant={status.badgeVariant} className="flex items-center gap-1.5 text-sm">
            {cloneElement(status.icon, { size: 14 })}
            <span>{status.text}</span>
          </Badge>

          <Badge className="flex items-center gap-1.5 text-sm" variant={"secondary"}>
            <Calendar size={14} />
            {subscription.cancelAtPeriodEnd
              ? "Will cancel at period end"
              : <span>Next billing date: {dayJS(subscription.periodEnd).format("MMMM D, YYYY")}</span>
            }
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}