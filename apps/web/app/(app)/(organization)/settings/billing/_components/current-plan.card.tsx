import { dayJS } from "@/lib/dayjs";
import { getStatus } from "@/lib/polar";
import { Subscription } from "@polar-sh/sdk/models/components/subscription.js";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Component } from "@workspace/ui/components/utils/component";
import { Calendar, CheckCircle2 } from "lucide-react";

type BillingCurrentPlanCardProps = {
  subscription: Subscription;
};

export const BillingCurrentPlanCard: Component<BillingCurrentPlanCardProps> = ({ subscription }) => {
  const { classVariant, status } = getStatus(subscription.status);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Plan</CardTitle>
        <CardDescription>Manage your subscription and billing details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-2xl font-semibold">{subscription.product.name}</p>
            <p className="text-muted-foreground">${(subscription.amount ?? 0) / 100},00 per {subscription.recurringInterval}</p>
          </div>
          <Button size={"sm"}>Change Plan</Button>
        </div>

        <div className="space-x-3.5 flex flex-row">
          <Badge variant={classVariant} className="flex items-center gap-2">
            <CheckCircle2 size={14} />
            <span>{status}</span>
          </Badge>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar size={20} />
            <span>Next billing date: {dayJS(subscription.currentPeriodEnd).format("MMMM D, YYYY")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}