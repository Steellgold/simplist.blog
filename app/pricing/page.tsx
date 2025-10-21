"use client";

import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { createCheckoutSession } from "@/lib/stripe/actions";
import { useRouter } from "next/navigation";
import { getAllPlans, getPlanPrice, type SubscriptionInterval } from "@/lib/subscription/plans";
import { HomeHeader } from "@/components/home-header";
import Footer from "@/components/footer";

const PricingPage = () => {
  const [isYearly, setIsYearly] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();
  
  const plans = getAllPlans();
  const interval: SubscriptionInterval = isYearly ? "yearly" : "monthly";

  const handleUpgrade = async (planInterval: SubscriptionInterval) => {
    setLoadingPlan(planInterval);
    try {
      const { url } = await createCheckoutSession(planInterval);
      window.location.href = url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <HomeHeader />
      
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose your plan</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Start free, upgrade when you need more power
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Yearly
            </span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full dark:bg-green-900 dark:text-green-300">
              Save 20%
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const currentPrice = getPlanPrice(plan.id, interval) || plan.prices[0];
            const isProPlan = plan.id === "pro";
            const buttonLoading = loadingPlan === interval && isProPlan;
            
            return (
              <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      {plan.highlight}
                    </span>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{currentPrice.displayAmount}</span>
                    <span className="text-muted-foreground">{currentPrice.displayInterval}</span>
                  </div>
                  {currentPrice.yearlyEquivalent && (
                    <p className="text-sm text-muted-foreground">
                      {currentPrice.yearlyEquivalent} ({currentPrice.savings})
                    </p>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className={`text-sm ${!feature.included ? 'text-muted-foreground line-through' : ''}`}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.id === "free" ? (
                    <Button 
                      variant="outline" 
                      className="w-full mt-6"
                      onClick={() => router.push("/dashboard")}
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <Button 
                      className="w-full mt-6" 
                      onClick={() => handleUpgrade(interval)}
                      disabled={loadingPlan !== null}
                    >
                      {buttonLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Upgrade to ${plan.name}`
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div>
              <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-muted-foreground text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What happens to my data if I downgrade?</h3>
              <p className="text-muted-foreground text-sm">
                Your data is safe. If you exceed free plan limits, you'll just need to upgrade again to access everything.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-muted-foreground text-sm">
                Yes, we offer a 30-day money-back guarantee on all paid plans.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is there a setup fee?</h3>
              <p className="text-muted-foreground text-sm">
                No setup fees, no hidden costs. Pay only for what you use.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PricingPage;