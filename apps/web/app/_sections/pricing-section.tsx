 "use client";

import NumberFlow from "@number-flow/react";
import { getAllPlans, getPlanLimits, getPlanPrice, type SubscriptionInterval } from "@simplist/limits";
import { Badge } from "@simplist/ui/components/badge";
import { buttonVariants } from "@simplist/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@simplist/ui/components/card";
import { cn } from "@simplist/ui/lib/utils";
import { ArrowRight, BadgeCheck, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export const PricingSection = () => {
  const [frequency, setFrequency] = useState<SubscriptionInterval>("monthly");
  const plans = getAllPlans();
  const [starterPlan, proPlan] = plans;
  const starterLimits = getPlanLimits("STARTER");
  const proLimits = getPlanLimits("PRO");

  const proPrice = getPlanPrice(proPlan.id, frequency) || proPlan.prices[0];

  // const handleOpenBilling = () => {
  //   window.open("https://app.simplist.blog/billing", "_blank");
  // };

  return (
    <section id="pricing" className="py-20 md:py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center mb-10 intersect-once intersect:motion-preset-fade">
          <Badge variant="secondary" className="mb-3">
            Simple, transparent pricing
          </Badge>
          <h2
            className="text-3xl md:text-4xl font-semibold mb-3"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Start free, scale when you&apos;re ready
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mb-4">
            One free plan for side projects, one PRO plan for serious content platforms.
          </p>

          <div className="inline-flex items-center gap-2 rounded-full border bg-card/80 px-1.5 py-1 text-xs shadow-sm">
            <button
              type="button"
              onClick={() => setFrequency("monthly")}
              className={`px-3 py-1 rounded-full transition-colors ${
                frequency === "monthly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>

            <button
              type="button"
              onClick={() => setFrequency("yearly")}
              className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${
                frequency === "yearly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[9px] uppercase tracking-wide ", {
                    "bg-secondary-foreground/45 text-white dark:bg-secondary dark:text-primary": frequency === "yearly",
                    "bg-emerald-500/35 dark:bg-emerald-500/45 text-foreground/80 dark:text-foreground/80": frequency !== "yearly"
                  }
                )}
              >
                -20%
              </span>
            </button>
          </div>
        </div>

        <div className="mt-6 max-w-5xl mx-auto flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-4">
          <Card className="bg-card/80 backdrop-blur-sm lg:flex-[1.1]">
            <CardHeader>
              <CardTitle className="text-left text-lg md:text-xl">What you get with each plan</CardTitle>
              <CardDescription className="text-left text-sm md:text-[15px]">
                Pick the plan that matches where your project is today. You can upgrade at any time
                without migrations.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] text-xs md:text-sm gap-y-2">
                <div />
                <div className="text-center font-medium text-muted-foreground">Free</div>
                <div className="text-center font-medium text-muted-foreground">Pro</div>

                <div className="py-1 text-muted-foreground">Articles</div>
                <div className="py-1 text-center">
                  {starterLimits.maxArticles === -1 ? "Unlimited" : `Up to ${starterLimits.maxArticles}`}
                </div>
                <div className="py-1 text-center">
                  {proLimits.maxArticles === -1 ? "Unlimited" : `Up to ${proLimits.maxArticles}`}
                </div>

                <div className="py-1 text-muted-foreground">API calls / month</div>
                <div className="py-1 text-center">
                  {starterLimits.maxApiCallsPerMonth.toLocaleString("en-US")}
                </div>
                <div className="py-1 text-center">
                  {proLimits.maxApiCallsPerMonth.toLocaleString("en-US")}
                </div>

                <div className="py-1 text-muted-foreground">Analytics dashboard</div>
                <div className="py-1 text-center flex items-center justify-center gap-1">
                  {starterLimits.features.analytics ? (
                    <>
                      <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                      <span>Included</span>
                    </>
                  ) : (
                    <>
                      <X className="h-3.5 w-3.5 text-muted-foreground/50" />
                      <span className="text-muted-foreground/60">Not included</span>
                    </>
                  )}
                </div>
                <div className="py-1 text-center flex items-center justify-center gap-1">
                  {proLimits.features.analytics ? (
                    <>
                      <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                      <span>Included</span>
                    </>
                  ) : (
                    <>
                      <X className="h-3.5 w-3.5 text-muted-foreground/50" />
                      <span className="text-muted-foreground/60">Not included</span>
                    </>
                  )}
                </div>

                <div className="py-1 text-muted-foreground">Scheduled publishing</div>
                <div className="py-1 text-center flex items-center justify-center gap-1">
                  {starterLimits.features.scheduledPublishing ? (
                    <>
                      <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                      <span>Included</span>
                    </>
                  ) : (
                    <>
                      <X className="h-3.5 w-3.5 text-muted-foreground/50" />
                      <span className="text-muted-foreground/60">Not included</span>
                    </>
                  )}
                </div>
                <div className="py-1 text-center flex items-center justify-center gap-1">
                  {proLimits.features.scheduledPublishing ? (
                    <>
                      <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                      <span>Included</span>
                    </>
                  ) : (
                    <>
                      <X className="h-3.5 w-3.5 text-muted-foreground/50" />
                      <span className="text-muted-foreground/60">Not included</span>
                    </>
                  )}
                </div>

                <div className="py-1 text-muted-foreground">Team members</div>
                <div className="py-1 text-center">
                  {starterLimits.maxMembers === -1 ? "Unlimited" : starterLimits.maxMembers}
                </div>
                <div className="py-1 text-center">
                  {proLimits.maxMembers === -1 ? "Unlimited" : `Up to ${proLimits.maxMembers}`}
                </div>

              </div>
            </CardContent>
          </Card>

          <div className="lg:flex-[0.9]">
            <Card className="relative bg-card/80 backdrop-blur-sm border-primary/40">
              <CardHeader>
                <Badge variant="secondary" className="mb-1.5">Recommended</Badge>
                <CardTitle className="text-xl font-semibold">Pro</CardTitle>
                <CardDescription className="text-sm">
                  For teams who want their blog with full analytics, scheduling and room for their team.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-semibold flex items-baseline gap-1">
                  <span className="flex items-baseline gap-1.5 text-muted-foreground text-sm">
                    <NumberFlow
                      className="font-semibold text-foreground text-3xl inline-block"
                      format={{ style: "currency", currency: "USD", maximumFractionDigits: 2 }}
                      value={proPrice?.amount ?? 0}
                    />

                    <span className="text-black text-sm font-normal">
                      /{proPrice?.interval === "monthly" ? "month" : "year"}
                    </span>
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  Everything in Free, plus unlimited content, full analytics, scheduling and room for your team.
                </p>
              </CardContent>
              <CardFooter className="mt-auto">
                <Link
                  className={buttonVariants({ variant: "default", className: "w-full", size: "sm" })}
                  href="https://app.simplist.blog/billing"
                  target="_blank"
                >
                  Upgrade to Pro
                  <ArrowRight />
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};


