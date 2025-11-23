"use client"

import { UpgradeModal } from "@/components/billing/upgrade-modal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSeparator, FieldSet, FieldTitle } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { createBillingPortalSession } from "@/lib/stripe/actions"
import { getPlan } from "@/lib/subscription/plans"
import { SubscriptionTier } from "@simplist/db/types"
import { Check, CircleGauge } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

type CurrentPlanCardProps = {
  projectId: string
  projectName: string
  subscriptionTier: SubscriptionTier
}

export const CurrentPlanCard = ({ projectId, projectName, subscriptionTier }: CurrentPlanCardProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleManageBilling = async () => {
    setIsLoading(true)

    toast.promise(
      createBillingPortalSession(projectId),
      {
        loading: "Opening billing portal...",
        success: (data: { url: string }) => {
          setIsLoading(false)
          router.push(data.url)
          return "Billing portal opened successfully"
        },
        error: () => {
          setIsLoading(false)
          return "Failed to open billing portal. Please try again."
        },
      }
    )
  }

  const currentPlan = getPlan(subscriptionTier)

  return (
    <Card>
      <CardContent>
        <FieldSet>
          <FieldGroup>
            <Field orientation="responsive">
              <FieldContent>
                <div className="flex items-center gap-2">
                  <FieldTitle className="text-lg font-bold">{currentPlan.name}</FieldTitle>
                  <Badge variant="secondary">Active Plan</Badge>
                </div>

                <FieldDescription>
                  {currentPlan.description}
                </FieldDescription>
              </FieldContent>

              {subscriptionTier === SubscriptionTier.STARTER ? (
                <UpgradeModal projectId={projectId} projectName={projectName} />
              ) : (
                <Button size="sm" onClick={handleManageBilling} disabled={isLoading}>
                  {isLoading ? <Spinner /> : <CircleGauge />}
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
                    <Check className="size-3 text-primary" />
                    <span className="text-sm text-muted-foreground">
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
  )
}
