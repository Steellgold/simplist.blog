"use client";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import NumberFlow from "@number-flow/react";
import {
  getAllPlans,
  getPlanPrice,
  isPlanFree,
  type SubscriptionInterval
} from "@simplist/limits";
import { Badge } from "@simplist/ui/components/badge";
import { Button } from "@simplist/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@simplist/ui/components/card";
import { Tabs, TabsList, TabsTrigger } from "@simplist/ui/components/tabs";
import { clsx } from "clsx";
import { ArrowRight, BadgeCheck, X } from "lucide-react";
import { useState } from "react";

export default function PricingPage() {
  const [frequency, setFrequency] = useState<SubscriptionInterval>("monthly");
  
  const plans = getAllPlans();

  const handleGetStarted = () => {
    window.open("https://app.simplist.blog/billing", "_blank");
  };

  const handleSubscribe = () => {
    window.open("https://app.simplist.blog/billing", "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="flex flex-col items-center text-center mb-12">
          <h1 className="text-4xl font-bold">Simple, transparent pricing</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Start free and scale when you need more.
          </p>
          <Tabs 
            defaultValue={frequency} 
            onValueChange={(v) => setFrequency(v as SubscriptionInterval)} 
            className="flex justify-center"
          >
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">
                Yearly
                <Badge variant="secondary" className="bg-green-800 border-green-600 text-white ml-1">
                  20% off
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="mt-8 grid w-full max-w-4xl mx-auto md:grid-cols-2 gap-4">
          {plans.map((plan) => {
            const currentPrice = getPlanPrice(plan.id, frequency) || plan.prices[0];
            const isNumeric = typeof currentPrice?.amount === "number";
            const isFree = isPlanFree(plan.id);

            return (
              <Card
                key={plan.id}
                className={clsx(
                  "relative w-full text-left flex flex-col",
                  plan.popular && "ring-2 ring-primary"
                )}
              >
                {plan.popular && (
                  <Badge className="-translate-x-1/2 -translate-y-1/2 absolute top-0 left-1/2 rounded-full">
                    {plan.highlight || "Popular"}
                  </Badge>
                )}

                <CardHeader>
                  <CardTitle className="font-medium text-xl">{plan.name}</CardTitle>
                  <CardDescription>
                    <p>{plan.description}</p>
                    {isNumeric ? (
                      <NumberFlow
                        className="font-medium text-foreground text-2xl"
                        format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
                        suffix={` ${currentPrice.displayInterval}`}
                        value={currentPrice.amount}
                      />
                    ) : (
                      <span className="font-medium text-foreground text-2xl">
                        {currentPrice.displayAmount} {currentPrice.displayInterval}
                      </span>
                    )}
                    {currentPrice.yearlyEquivalent && (
                      <span className="block text-sm text-muted-foreground">
                        {currentPrice.yearlyEquivalent} ({currentPrice.savings})
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent className="grid gap-2">
                  {plan.features.map((feature, index) => (
                    <div 
                      className={clsx(
                        "flex gap-2 text-sm",
                        feature.included 
                          ? "text-muted-foreground" 
                          : "text-muted-foreground/50"
                      )} 
                      key={index}
                    >
                      {feature.included ? (
                        <BadgeCheck className="h-[1lh] w-4 flex-none" />
                      ) : (
                        <X className="h-[1lh] w-4 flex-none text-muted-foreground/50" />
                      )}
                      
                      <span className={clsx(feature.included ? "" : "line-through opacity-50")}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </CardContent>

                <CardFooter className="mt-auto">
                  {isFree ? (
                    <Button 
                      className="w-full" 
                      variant="secondary" 
                      onClick={handleGetStarted}
                    >
                      Get started for free<ArrowRight />
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={handleSubscribe}
                    >
                      Subscribe to {plan.name}<ArrowRight />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}