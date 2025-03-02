"use client";

import { dayJS } from "@/lib/dayjs";
import { getStatus } from "@/lib/polar";
import { Subscription } from "@polar-sh/sdk/models/components/subscription.js";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Component } from "@workspace/ui/components/utils/component";
import { toast } from "@workspace/ui/hooks/use-toast";
import { Calendar, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

type BillingCurrentPlanCardProps = {
  subscription: Subscription;
};

export const BillingCurrentPlanCard: Component<BillingCurrentPlanCardProps> = ({ subscription }) => {
  const { classVariant, status } = getStatus(subscription.status);
  const [pending, setPending] = useState(false);
  
  const router = useRouter();

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

          <Button size={"sm"} onClick={async() => {
            const schema = z.object({ url: z.string() });

            setPending(true);
            const res = await fetch(`/checkout/portal?customerId=${subscription.customerId}`);

            if (res.ok) {
              const data = schema.safeParse(await res.json());
              if (!data.success) {
                toast({
                  title: "Failed to redirect to billing portal",
                  description: "Invalid response from server",
                  variant: "destructive"
                });

                setPending(false);
                return;
              }

              toast({
                title: "Redirecting to billing portal",
                description: "You will be redirected to the billing portal to manage your subscription"
              });

              router.push(data.data.url);

              return;
            }

            toast({
              title: "Failed to redirect to billing portal",
              description: res.statusText,
              variant: "destructive"
            });

            setPending(false);
          }}>
            {pending ? <Loader2 className="animate-spin" /> : "Manage Subscription"}
          </Button>
        </div>

        <div className="space-x-2 flex flex-row">
          <Badge variant={classVariant} className="flex items-center gap-1.5 text-sm">
            <CheckCircle2 size={14} />
            <span>{status}</span>
          </Badge>

          <Badge className="flex items-center gap-1.5 text-sm" variant={"secondary"}>
            <Calendar size={14} />
            {subscription.cancelAtPeriodEnd
              ? "Will cancel at period end"
              : <span>Next billing date: {dayJS(subscription.currentPeriodEnd).format("MMMM D, YYYY")}</span>
            }
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}