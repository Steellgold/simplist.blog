"use client";

import NumberFlow from "@number-flow/react";
import {
  getAllPlans,
  getPlanLimits,
  getPlanPrice,
  type SubscriptionInterval,
} from "@simplist/limits";
import { Badge } from "@simplist/ui/components/badge";
import { BillingToggle } from "@simplist/ui/components/billing-toggle";
import { buttonVariants } from "@simplist/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@simplist/ui/components/card";
import { ArrowRight, BadgeCheck, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export const PricingSection = () => {
  const [frequency, setFrequency] = useState<SubscriptionInterval>("monthly");

  const plans = getAllPlans();
  const [, proPlan] = plans;

  const starterLimits = getPlanLimits("STARTER");
  const proLimits = getPlanLimits("PRO");

  const proPrice = getPlanPrice(proPlan.id, frequency) || proPlan.prices[0];

  return (
    <section id="pricing" className="px-4 py-20 md:py-24">
      <div className="container mx-auto max-w-6xl">
        <div className="intersect-once intersect:motion-preset-fade mb-10 flex flex-col items-center text-center">
          <Badge variant="secondary" className="mb-3">
            Simple, transparent pricing
          </Badge>
          <h2
            className="mb-3 text-3xl font-semibold md:text-4xl"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Start free, scale when you&apos;re ready
          </h2>
          <p className="text-muted-foreground mb-4 max-w-2xl text-base md:text-lg">
            One free plan for side projects, one PRO plan for serious content
            platforms.
          </p>

          <BillingToggle
            value={frequency}
            onValueChange={(value) => setFrequency(value)}
            showSavings={true}
          />
        </div>

        <div className="mx-auto mt-6 flex max-w-5xl flex-col gap-4 lg:flex-row lg:items-start lg:gap-4">
          <Card className="bg-card/80 backdrop-blur-sm lg:flex-[1.1]">
            <CardHeader>
              <CardTitle className="text-left text-lg md:text-xl">
                What you get with each plan
              </CardTitle>
              <CardDescription className="text-left text-sm md:text-[15px]">
                Pick the plan that matches where your project is today. You can
                upgrade at any time without migrations.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] gap-y-2 text-xs md:text-sm">
                <div />
                <div className="text-muted-foreground text-center font-medium">
                  Free
                </div>
                <div className="text-muted-foreground text-center font-medium">
                  Pro
                </div>

                <div className="text-muted-foreground py-1">Articles</div>
                <div className="py-1 text-center">
                  {starterLimits.maxArticles === -1
                    ? "Unlimited"
                    : `Up to ${starterLimits.maxArticles}`}
                </div>
                <div className="py-1 text-center">
                  {proLimits.maxArticles === -1
                    ? "Unlimited"
                    : `Up to ${proLimits.maxArticles}`}
                </div>

                <div className="text-muted-foreground py-1">
                  API calls / month
                </div>
                <div className="py-1 text-center">
                  {starterLimits.maxApiCallsPerMonth === -1
                    ? "Unlimited"
                    : starterLimits.maxApiCallsPerMonth.toLocaleString("en-US")}
                </div>
                <div className="py-1 text-center">
                  {proLimits.maxApiCallsPerMonth === -1
                    ? "Unlimited"
                    : proLimits.maxApiCallsPerMonth.toLocaleString("en-US")}
                </div>

                <div className="text-muted-foreground py-1">
                  Analytics dashboard
                </div>
                <div className="flex items-center justify-center gap-1 py-1 text-center">
                  {starterLimits.features.analytics ? (
                    <>
                      <BadgeCheck className="text-primary h-3.5 w-3.5" />
                      <span>Included</span>
                    </>
                  ) : (
                    <>
                      <X className="text-muted-foreground/50 h-3.5 w-3.5" />
                      <span className="text-muted-foreground/60">
                        Not included
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center justify-center gap-1 py-1 text-center">
                  {proLimits.features.analytics ? (
                    <>
                      <BadgeCheck className="text-primary h-3.5 w-3.5" />
                      <span>Included</span>
                    </>
                  ) : (
                    <>
                      <X className="text-muted-foreground/50 h-3.5 w-3.5" />
                      <span className="text-muted-foreground/60">
                        Not included
                      </span>
                    </>
                  )}
                </div>

                <div className="text-muted-foreground py-1">
                  Scheduled publishing
                </div>
                <div className="flex items-center justify-center gap-1 py-1 text-center">
                  {starterLimits.features.scheduledPublishing ? (
                    <>
                      <BadgeCheck className="text-primary h-3.5 w-3.5" />
                      <span>Included</span>
                    </>
                  ) : (
                    <>
                      <X className="text-muted-foreground/50 h-3.5 w-3.5" />
                      <span className="text-muted-foreground/60">
                        Not included
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center justify-center gap-1 py-1 text-center">
                  {proLimits.features.scheduledPublishing ? (
                    <>
                      <BadgeCheck className="text-primary h-3.5 w-3.5" />
                      <span>Included</span>
                    </>
                  ) : (
                    <>
                      <X className="text-muted-foreground/50 h-3.5 w-3.5" />
                      <span className="text-muted-foreground/60">
                        Not included
                      </span>
                    </>
                  )}
                </div>

                <div className="text-muted-foreground py-1">Team members</div>
                <div className="py-1 text-center">
                  {starterLimits.maxMembers === -1
                    ? "Unlimited"
                    : starterLimits.maxMembers}
                </div>
                <div className="py-1 text-center">
                  {proLimits.maxMembers === -1
                    ? "Unlimited"
                    : `Up to ${proLimits.maxMembers}`}
                </div>
              </div>
              <div className="mt-4 border-t pt-4">
                <p className="text-muted-foreground/60 text-center text-xs italic">
                  And more features coming soon...
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="lg:flex-[0.9]">
            <Card className="bg-card/80 border-primary/40 relative backdrop-blur-sm">
              <CardHeader>
                <Badge variant="secondary" className="mb-1.5">
                  Recommended
                </Badge>
                <CardTitle className="text-xl font-semibold">Pro</CardTitle>
                <CardDescription className="text-sm">
                  For teams who want their blog with full analytics, scheduling
                  and room for their team.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline gap-1 text-3xl font-semibold">
                  <span className="text-muted-foreground flex items-baseline gap-1.5 text-sm">
                    <NumberFlow
                      className="text-foreground inline-block text-3xl font-semibold"
                      format={{
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 2,
                      }}
                      value={proPrice?.amount ?? 0}
                    />

                    <span className="text-muted-foreground text-sm font-normal">
                      /{proPrice?.interval === "monthly" ? "month" : "year"}
                    </span>
                  </span>
                </div>

                <p className="text-muted-foreground text-xs">
                  Everything in Free, plus unlimited content, full analytics,
                  scheduling and room for your team.
                </p>
              </CardContent>
              <CardFooter className="mt-auto">
                <Link
                  className={buttonVariants({
                    variant: "default",
                    className: "w-full",
                    size: "sm",
                  })}
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
