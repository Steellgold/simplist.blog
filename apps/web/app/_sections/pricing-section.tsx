"use client";

import {
  ArrowRight,
  Calendar,
  ChartAreaStackedNormalized,
  Files,
  Globe,
  PersonsLock,
  Picture,
  Terminal,
} from "@gravity-ui/icons";
import NumberFlow from "@number-flow/react";
import {
  getAllPlans,
  getPlanLimits,
  getPlanPrice,
  type PlanLimits,
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
import { Webhook } from "@simplist/ui/components/icons";
import Link from "next/link";
import { type ComponentType, type SVGProps, useState } from "react";

interface FeatureDisplay {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  getValue: (limits: PlanLimits) => string | null;
  getBadge?: (limits: PlanLimits) => string | null;
  skipInFree?: boolean;
  skipInPro?: boolean;
}

const featureDisplays: FeatureDisplay[] = [
  {
    icon: Files,
    label: "Articles",
    getValue: (limits) =>
      limits.maxArticles === -1 ? "Unlimited" : `${limits.maxArticles}`,
  },
  {
    icon: Terminal,
    label: "API calls",
    getValue: (limits) =>
      limits.maxApiCallsPerMonth === -1
        ? "Unlimited"
        : `${(limits.maxApiCallsPerMonth / 1000).toFixed(0)}K/month`,
  },
  {
    icon: ChartAreaStackedNormalized,
    label: "Analytics",
    getValue: (limits) =>
      limits.features.analytics ? "Advanced" : "Basic (7 days)",
  },
  {
    icon: Calendar,
    label: "Scheduled Publishing",
    getValue: (limits) =>
      limits.features.scheduledPublishing ? "Included" : null,
  },
  {
    icon: Globe,
    label: "Variants",
    getValue: (limits) =>
      limits.maxVariantsPerArticle === -1
        ? "Unlimited"
        : `${limits.maxVariantsPerArticle} per article`,
  },
  {
    icon: Picture,
    label: "Media Library",
    getValue: () => "Included",
    skipInPro: true
    // getBadge: (limits) => {
    //   const sizeInMB = limits.maxStorageBytes / (1024 * 1024);
    //   if (sizeInMB >= 1024) {
    //     const sizeInGB = sizeInMB / 1024;
    //     return `${sizeInGB % 1 === 0 ? Math.round(sizeInGB) : sizeInGB.toFixed(1)} GB`;
    //   }
    //   return `${Math.round(sizeInMB)} MB`;
    // },
  },
  {
    icon: Webhook,
    label: "Webhooks",
    getValue: () => "Included",
    skipInPro: true,
  },
  {
    icon: PersonsLock,
    label: "Team members",
    getValue: (limits) =>
      limits.maxMembers === -1 ? "Unlimited" : `Up to ${limits.maxMembers}`,
    skipInFree: true,
  },
];

export const PricingSection = () => {
  const [frequency, setFrequency] = useState<SubscriptionInterval>("monthly");

  const plans = getAllPlans();
  const [starterPlan, proPlan] = plans;

  const starterLimits = getPlanLimits("STARTER");
  const proLimits = getPlanLimits("PRO");

  const proPrice = getPlanPrice(proPlan.id, frequency) || proPlan.prices[0];

  return (
    <section id="pricing" className="px-4 py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="intersect-once mb-12 flex flex-col items-center text-center">
          <Badge variant="secondary" className="mb-3">
            Simple, transparent pricing
          </Badge>
          <h2
            className="mb-3 text-3xl font-semibold md:text-4xl"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Start free, scale when you&apos;re ready
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl text-base md:text-lg">
            Build your blog with our free plan, upgrade to Pro when you need
            advanced features.
          </p>

          <BillingToggle
            value={frequency}
            onValueChange={(value) => setFrequency(value)}
            showSavings={true}
          />
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2 md:items-start">
          {/* Free Plan */}
          <Card className="bg-card/50 relative overflow-hidden backdrop-blur-sm">
            <div className="from-muted/20 to-background pointer-events-none absolute inset-0 bg-gradient-to-br" />

            <CardHeader className="relative">
              <CardTitle
                className="text-2xl font-extrabold"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                {starterPlan.name}
              </CardTitle>
              <CardDescription>{starterPlan.description}</CardDescription>

              <div className="flex items-baseline gap-1 pt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>

            <CardContent className="relative space-y-3">
              {featureDisplays.map((feature) => {
                const Icon = feature.icon;
                const value = feature.getValue(starterLimits);
                const badge = feature.getBadge?.(starterLimits);

                // Skip features not included or marked to skip in free
                if (value === null || feature.skipInFree) return null;

                return (
                  <div
                    key={feature.label}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-muted/50 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                        <Icon className="text-muted-foreground h-4 w-4" />
                      </div>
                      <span className="text-sm">
                        {value !== "Included" ? `${value} ` : ""}
                        {feature.label}
                      </span>
                    </div>

                    {badge && (
                      <Badge
                        variant="secondary"
                        className="text-xs font-normal"
                      >
                        {badge}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </CardContent>

            <CardFooter className="relative">
              <Link
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "w-full",
                })}
                href="https://app.simplist.blog"
                target="_blank"
              >
                Get Started Free
                <ArrowRight />
              </Link>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="border-primary/50 ring-primary/20 relative overflow-hidden shadow-lg ring-1">
            <div className="from-primary/5 via-primary/10 to-background pointer-events-none absolute inset-0 bg-gradient-to-br" />

            {/* Popular badge */}
            <div className="absolute top-4 right-4">
              <Badge className="shadow-sm">Most Popular</Badge>
            </div>

            <CardHeader className="relative">
              <CardTitle
                className="text-2xl font-extrabold"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                {proPlan.name}
              </CardTitle>
              <CardDescription>{proPlan.description}</CardDescription>

              <div className="flex items-baseline gap-1 pt-4">
                <NumberFlow
                  className="text-4xl font-bold"
                  format={{
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 2,
                  }}
                  value={proPrice?.amount ?? 0}
                />
                <span className="text-muted-foreground">
                  /{proPrice?.interval === "monthly" ? "month" : "year"}
                </span>
              </div>

              {frequency === "yearly" && (
                <Badge variant="secondary" className="w-fit">
                  Save $24/year
                </Badge>
              )}
            </CardHeader>

            <CardContent className="relative space-y-3">
              {featureDisplays.map((feature) => {
                const Icon = feature.icon;
                const value = feature.getValue(proLimits);
                const badge = feature.getBadge?.(proLimits);

                // Skip null values or features marked to skip in pro
                if (value === null || feature.skipInPro) return null;

                return (
                  <div
                    key={feature.label}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                        <Icon className="text-primary h-4 w-4" />
                      </div>
                      <span className="text-sm">
                        {value !== "Included" ? `${value} ` : ""}
                        {feature.label}
                      </span>
                    </div>

                    {badge && (
                      <Badge
                        variant="secondary"
                        className="text-xs font-normal"
                      >
                        {badge}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </CardContent>

            <CardFooter className="relative">
              <Link
                className={buttonVariants({
                  variant: "default",
                  size: "sm",
                  className: "w-full shadow-md",
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

        {/* Trust indicators */}
        <div className="mx-auto mt-8 flex max-w-4xl flex-wrap items-center justify-center gap-6 text-center">
          <div className="flex items-center gap-2">
            <svg
              className="text-muted-foreground h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
            </svg>
            <span className="text-muted-foreground text-sm">
              Secured by Stripe
            </span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="text-muted-foreground h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
            </svg>
            <span className="text-muted-foreground text-sm">SSL encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="text-muted-foreground h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
            </svg>
            <span className="text-muted-foreground text-sm">
              Cancel anytime
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
