"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createBillingPortalSession, createCheckoutSession } from "@/lib/stripe/actions";
import { SUBSCRIPTION_PRICING, type SubscriptionTier } from "@/lib/subscription/types";
import { CreditCard, Crown, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface BillingCardProps {
  currentTier: SubscriptionTier;
  subscriptionExpiresAt: Date | null;
}

export const BillingCard = ({ currentTier, subscriptionExpiresAt }: BillingCardProps) => {
  const isPro = currentTier === "pro";
  const isExpired = subscriptionExpiresAt ? subscriptionExpiresAt < new Date() : false;
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      const { url } = await createCheckoutSession("monthly");
      window.location.href = url;
    } catch (error) {
      toast.error("Failed to start checkout. Please try again.");
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      const { url } = await createBillingPortalSession();
      window.location.href = url;
    } catch (error) {
      toast.error("Failed to open billing portal. Please try again.");
      console.error("Billing portal error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPro ? (
              <Crown className="h-5 w-5 text-yellow-500" />
            ) : (
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            )}
            <CardTitle>Current Plan</CardTitle>
          </div>
          {isPro ? (
            <img 
              src="https://cdn.simplist.blog/assets/billing/badge-pro.png" 
              alt="Pro" 
              className="h-5 w-auto"
            />
          ) : (
            <img 
              src="https://cdn.simplist.blog/assets/billing/badge-starter.png" 
              alt="Starter" 
              className="h-5 w-auto"
            />
          )}
        </div>
        <CardDescription>
          {isPro
            ? "You're on the Pro plan with unlimited access"
            : "You're on the Free plan"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPro && subscriptionExpiresAt && (
          <div className="text-sm">
            <p className="text-muted-foreground">
              {isExpired ? "Expired on:" : "Renews on:"}
            </p>
            <p className="font-medium">
              {subscriptionExpiresAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}

        {!isPro && (
          <div className="rounded-lg border bg-gradient-to-br from-primary/10 to-primary/5 p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="font-semibold">Upgrade to Pro</p>
                <p className="text-sm text-muted-foreground">
                  Get unlimited articles, analytics, and more for just $
                  {SUBSCRIPTION_PRICING.pro.monthly.amount}/month
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Unlimited articles</li>
                  <li>• Advanced analytics dashboard</li>
                  <li>• 500,000 API calls/month</li>
                  <li>• 10 GB storage</li>
                  <li>• Priority support</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {isPro ? (
            <Button onClick={handleManageSubscription} className="w-full" disabled={isLoading}>
              {isLoading ? "Loading..." : "Manage Subscription"}
            </Button>
          ) : (
            <Button onClick={handleUpgrade} className="w-full" disabled={isLoading}>
              <Crown className="mr-2 h-4 w-4" />
              {isLoading ? "Loading..." : "Upgrade to Pro"}
            </Button>
          )}
        </div>

        {!isPro && (
          <p className="text-xs text-center text-muted-foreground">
            30-day money-back guarantee
          </p>
        )}
      </CardContent>
    </Card>
  );
};
