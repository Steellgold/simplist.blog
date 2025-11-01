"use client";

import Footer from "@/components/layout/footer";
import { AppNavbar } from "@/components/layout/navbar";
import { ProjectSelectorModal } from "@/components/projects/selector-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createCheckoutSession } from "@/lib/stripe/actions";
import { getAllPlans, getPlanPrice, type SubscriptionInterval } from "@/lib/subscription/plans";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { ArrowRight, BadgeCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Project } from "@prisma/client";

const PricingPage = () => {
  const [frequency, setFrequency] = useState<SubscriptionInterval>("monthly");
  const [loading, setLoading] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [pendingInterval, setPendingInterval] = useState<SubscriptionInterval | null>(null);
  const router = useRouter();
  
  const plans = getAllPlans();
  const interval: SubscriptionInterval = frequency;

  // Fetch user projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects");
        if (response.ok) {
          const data = await response.json();
          setProjects(data.projects || []);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  const handleUpgrade = async (planInterval: SubscriptionInterval) => {
    if (projects.length === 0) {
      router.push("/create-project");
      return;
    }

    // Filter projects to only show free projects (those that can be upgraded)
    const freeProjects = projects.filter(project => project.subscriptionTier === "STARTER");
    
    if (freeProjects.length === 0) {
      // All projects are already pro, redirect to dashboard
      router.push("/dashboard");
      return;
    }

    if (freeProjects.length === 1) {
      // Only one free project - proceed directly
      await processCheckout(planInterval, freeProjects[0].id);
    } else {
      // Multiple free projects - show selector with only free projects
      setPendingInterval(planInterval);
      setShowProjectSelector(true);
    }
  };

  const handleProjectSelect = async (projectId: string) => {
    if (pendingInterval) {
      await processCheckout(pendingInterval, projectId);
    }
  };

  const processCheckout = async (planInterval: SubscriptionInterval, projectId: string) => {
    setLoading(true);
    try {
      const { url } = await createCheckoutSession(planInterval, projectId);
      window.location.href = url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <AppNavbar />
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="flex flex-col items-center text-center mb-12">
          <h1 className="text-4xl font-bold">Simple, transparent pricing</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Start free and scale when you need more.
          </p>
          <Tabs defaultValue={frequency} onValueChange={(v) => setFrequency(v as SubscriptionInterval)} className="flex justify-center">
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">
                Yearly
                <Badge variant="secondary" className="bg-green-800 border-green-600 text-white ml-1">20% off</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="mt-8 grid w-full max-w-4xl mx-auto md:grid-cols-2 gap-4">
          {plans.map((plan) => {
            const currentPrice = getPlanPrice(plan.id, interval) || plan.prices[0];
            const isNumeric = typeof currentPrice.amount === "number";
            const isFree = plan.id === "STARTER";

            return (
              <Card
                key={plan.id}
                className={cn("relative w-full text-left flex flex-col", plan.popular && "ring-2 ring-primary")}
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
                        className="font-medium text-foreground"
                        format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
                        suffix={` ${currentPrice.displayInterval}`}
                        value={currentPrice.amount}
                      />
                    ) : (
                      <span className="font-medium text-foreground">{currentPrice.displayAmount} {currentPrice.displayInterval}</span>
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
                      className={cn(
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
                      
                      <span className={cn(feature.included ? "" : "line-through opacity-50")}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </CardContent>


                <CardFooter className="mt-auto">
                  {isFree ? (
                    <Button className="w-full" variant="secondary" onClick={() => router.push("/dashboard")}>
                      Get started for free<ArrowRight />
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={() => handleUpgrade(interval)} disabled={loading}>
                      {loading ? (
                        <>
                          <Spinner />
                          Processing...
                        </>
                      ) : (
                        <>Subscribe to {plan.name}<ArrowRight /></>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
      
      <Footer />

      <ProjectSelectorModal
        open={showProjectSelector}
        onOpenChange={setShowProjectSelector}
        projects={projects.filter(project => project.subscriptionTier === "STARTER")}
        onProjectSelect={handleProjectSelect}
        title="Select Project to Upgrade"
        description="Choose which project you want to upgrade to Pro"
      />
    </div>
  );
};

export default PricingPage;