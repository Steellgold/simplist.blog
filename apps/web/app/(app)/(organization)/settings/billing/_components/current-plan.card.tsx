"use client";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export const BillingCurrentPlanCard = () => {
  const [pending] = useState(false);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Plan</CardTitle>
        <CardDescription>Manage your subscription and billing details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            {/* <p className="text-2xl font-semibold">{subscription.product.name}</p>
            <p className="text-muted-foreground">${(subscription.amount ?? 0) / 100},00 per {subscription.recurringInterval}</p> */}
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