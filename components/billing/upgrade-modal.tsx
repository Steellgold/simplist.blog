"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSet, FieldTitle } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createCheckoutSession } from "@/lib/stripe/actions"
import { getPlan } from "@/lib/subscription/plans"
import { SubscriptionTier } from "@simplist/db"
import { Check, CircleFadingArrowUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Spinner } from "../ui/spinner"

type UpgradeModalProps = {
  projectId: string
  projectName: string
}

export const UpgradeModal = ({ projectId, projectName }: UpgradeModalProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedInterval, setSelectedInterval] = useState<"monthly" | "yearly">("yearly")
  const router = useRouter()

  const proPlan = getPlan(SubscriptionTier.PRO)
  const monthlyPrice = proPlan.prices.find(p => p.interval === "monthly")
  const yearlyPrice = proPlan.prices.find(p => p.interval === "yearly")

  const handleUpgrade = async () => {
    setIsLoading(true)

    toast.promise(
      createCheckoutSession(selectedInterval, projectId),
      {
        loading: "Creating checkout session...",
        success: (data: { url: string }) => {
          setIsLoading(false)
          setIsOpen(false)
          router.push(data.url)
          return "Redirecting to checkout..."
        },
        error: () => {
          setIsLoading(false)
          return "Failed to create checkout session. Please try again."
        },
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <CircleFadingArrowUp />
          Upgrade
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upgrade to Pro</DialogTitle>
          <DialogDescription>
            Choose your billing interval for {projectName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <FieldGroup>
            <FieldSet>
              <FieldLabel htmlFor="billing-interval">
                Billing Interval
              </FieldLabel>
              <FieldDescription>
                Choose your billing preference for {projectName}
              </FieldDescription>
              <RadioGroup
                value={selectedInterval}
                onValueChange={(value) => setSelectedInterval(value as "monthly" | "yearly")}
              >
                <FieldLabel htmlFor="monthly-option">
                  <Field orientation="horizontal">
                    <FieldContent>
                      <div className="flex items-center gap-2">
                        <FieldTitle>Monthly</FieldTitle>
                        <Badge variant="secondary">Standard</Badge>
                      </div>

                      <FieldDescription>
                        {monthlyPrice?.displayAmount} {monthlyPrice?.displayInterval}
                      </FieldDescription>
                    </FieldContent>
                    <RadioGroupItem value="monthly" id="monthly-option" />
                  </Field>
                </FieldLabel>
                
                <FieldLabel htmlFor="yearly-option">
                  <Field orientation="horizontal">
                    <FieldContent>
                      <div className="flex items-center gap-2">
                        <FieldTitle>Yearly</FieldTitle>
                        <Badge variant="secondary" className="bg-green-800 border-green-600 text-white">
                          {yearlyPrice?.savings}
                        </Badge>
                      </div>

                      <FieldDescription>
                        {yearlyPrice?.displayAmount} {yearlyPrice?.displayInterval}
                        {yearlyPrice?.yearlyEquivalent && (
                          <span className="block text-xs text-muted-foreground">
                            {yearlyPrice.yearlyEquivalent} ({yearlyPrice.savings})
                          </span>
                        )}
                      </FieldDescription>
                    </FieldContent>
                    <RadioGroupItem value="yearly" id="yearly-option" />
                  </Field>
                </FieldLabel>
              </RadioGroup>
            </FieldSet>
          </FieldGroup>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Unlock these features</h4>
            <div className="grid grid-cols-2 gap-1">
              {proPlan.features.slice(0, 6).map((feature) => (
                <div key={feature.name} className="flex items-center gap-1.5">
                  <Check className="size-3 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            
            <Button
              variant="default"
              onClick={handleUpgrade}
              disabled={isLoading}
              size="sm"
              className="flex-1"
            >
              {isLoading ? <Spinner /> : <CircleFadingArrowUp />}
              Upgrade Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
