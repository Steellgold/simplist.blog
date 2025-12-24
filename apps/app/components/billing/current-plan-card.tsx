"use client";

import { UpgradeModal } from "@/components/billing/upgrade-modal";
import { createBillingPortalSession } from "@/lib/stripe/actions";
import { getPlan } from "@/lib/subscription/plans";
import { Check, NutHex } from "@gravity-ui/icons";
import { SubscriptionTier } from "@simplist/db/types";
import { Badge } from "@simplist/ui/components/badge";
import { Button } from "@simplist/ui/components/button";
import { Card, CardContent } from "@simplist/ui/components/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@simplist/ui/components/field";
import { Spinner } from "@simplist/ui/components/spinner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type CurrentPlanCardProps = {
  projectId: string;
  projectName: string;
  subscriptionTier: SubscriptionTier;
};

export const CurrentPlanCard = ({
  projectId,
  projectName,
  subscriptionTier,
}: CurrentPlanCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleManageBilling = async () => {
    setIsLoading(true);

    toast.promise(createBillingPortalSession(projectId), {
      loading: "Opening billing portal...",
      success: (data: { url: string }) => {
        setIsLoading(false);
        router.push(data.url);
        return "Billing portal opened successfully";
      },
      error: () => {
        setIsLoading(false);
        return "Failed to open billing portal. Please try again.";
      },
    });
  };

  const currentPlan = getPlan(subscriptionTier);

  return (
    <Card>
      <CardContent>
        <FieldSet>
          <FieldGroup>
            <Field orientation="responsive">
              <FieldContent>
                <div className="flex items-center gap-2">
                  <FieldTitle className="text-lg font-bold">
                    {currentPlan.name}
                  </FieldTitle>
                  <Badge variant="secondary">Active Plan</Badge>
                </div>

                <FieldDescription>{currentPlan.description}</FieldDescription>
              </FieldContent>

              {subscriptionTier === SubscriptionTier.STARTER ? (
                <UpgradeModal projectId={projectId} projectName={projectName} />
              ) : (
                <Button onClick={handleManageBilling} disabled={isLoading}>
                  {isLoading ? <Spinner /> : <NutHex />}
                  Manage billing
                </Button>
              )}
            </Field>

            <FieldSeparator />

            <Field orientation="vertical">
              <FieldContent>
                <FieldLabel htmlFor="slug">Features</FieldLabel>
              </FieldContent>

              <div className="grid grid-cols-3 gap-2">
                {currentPlan.features.map((feature) => (
                  <div key={feature.name} className="flex items-center gap-1.5">
                    <Check className="text-primary size-3" />
                    <span className="text-muted-foreground text-sm">
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </Field>
          </FieldGroup>
        </FieldSet>
      </CardContent>
    </Card>
  );
};
