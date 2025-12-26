"use client";

import {
  ArrowRight,
  Calendar,
  ChartColumn,
  CircleCheck,
  Globe,
  PersonsLock,
  Rocket,
} from "@gravity-ui/icons";
import NumberFlow from "@number-flow/react";
import {
  getAllPlans,
  getPlanLimits,
  getPlanPrice,
  type SubscriptionInterval,
} from "@simplist/limits";
import { Badge } from "@simplist/ui/components/badge";
import { BillingToggle } from "@simplist/ui/components/billing-toggle";
import { Button, buttonVariants } from "@simplist/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@simplist/ui/components/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@simplist/ui/components/collapsible";
import Link from "next/link";
import { useState } from "react";

interface Feature {
  icon: React.ElementType;
  name: string;
  free: string | boolean;
  pro: string | boolean;
  tooltip?: string;
}

const features: Feature[] = [
  {
    icon: Rocket,
    name: "Articles",
    free: "Up to 5",
    pro: "Unlimited",
  },
  {
    icon: ChartColumn,
    name: "API calls",
    free: "1,000/month",
    pro: "Unlimited",
  },
  {
    icon: ChartColumn,
    name: "Analytics",
    free: "Basic (7 days)",
    pro: "Advanced (unlimited)",
  },
  {
    icon: Calendar,
    name: "Scheduled publishing",
    free: false,
    pro: true,
  },
  {
    icon: Globe,
    name: "Language variants",
    free: "1 per article",
    pro: "Unlimited",
  },
  {
    icon: PersonsLock,
    name: "Team members",
    free: "1 (solo)",
    pro: "Up to 10",
  },
];

const faqs = [
  {
    question: "Can I upgrade or downgrade at any time?",
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll be charged a prorated amount. When downgrading, your account will be credited for the remaining time.",
  },
  {
    question: "What happens if I exceed my limits?",
    answer:
      "On the Free plan, you'll be prompted to upgrade when you reach your limits. On the Pro plan, most limits are unlimited, so you won't have to worry about hitting caps.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes! If you're not satisfied within the first 14 days, we'll give you a full refund, no questions asked.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Absolutely! You can cancel your subscription at any time from your billing settings. Your data will remain accessible until the end of your billing period.",
  },
];

export const PricingSection = () => {
  const [frequency, setFrequency] = useState<SubscriptionInterval>("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
            className="mb-3 text-3xl font-semibold md:text-4xl lg:text-5xl"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Start free, scale when you&apos;re ready
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl text-base md:text-lg">
            Build your blog with our free plan, upgrade to Pro when you need
            advanced features and unlimited growth.
          </p>

          <BillingToggle
            value={frequency}
            onValueChange={(value) => setFrequency(value)}
            showSavings={true}
          />
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
          {/* Free Plan */}
          <Card className="bg-card/50 relative overflow-hidden backdrop-blur-sm transition-all hover:shadow-lg">
            <CardHeader className="space-y-3 pb-8">
              <div>
                <CardTitle className="text-2xl font-semibold">
                  {starterPlan.name}
                </CardTitle>
                <CardDescription className="mt-2 text-[15px]">
                  {starterPlan.description}
                </CardDescription>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-muted-foreground text-lg">/month</span>
              </div>

              <p className="text-muted-foreground text-sm">
                Perfect for side projects and personal blogs
              </p>
            </CardHeader>

            <CardContent className="space-y-4 pb-8">
              <div className="space-y-3">
                {features.map((feature) => (
                  <div key={feature.name} className="flex items-start gap-3">
                    <feature.icon className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{feature.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {typeof feature.free === "boolean"
                          ? feature.free
                            ? "Included"
                            : "Not included"
                          : feature.free}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pb-8">
              <Link
                className={buttonVariants({
                  variant: "outline",
                  className: "w-full",
                })}
                href="https://app.simplist.blog"
                target="_blank"
              >
                Get Started Free
                <ArrowRight />
              </Link>
              <p className="text-muted-foreground text-center text-xs">
                No credit card required
              </p>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="border-primary/50 bg-card/50 ring-primary/20 relative overflow-hidden shadow-xl ring-1 backdrop-blur-sm transition-all hover:shadow-2xl">
            {/* Highlight badge */}
            <div className="bg-primary absolute top-4 right-4">
              <Badge className="shadow-lg">Most Popular</Badge>
            </div>

            <CardHeader className="space-y-3 pb-8">
              <div>
                <CardTitle className="text-2xl font-semibold">
                  {proPlan.name}
                </CardTitle>
                <CardDescription className="mt-2 text-[15px]">
                  {proPlan.description}
                </CardDescription>
              </div>

              <div className="flex items-baseline gap-2">
                <NumberFlow
                  className="text-5xl font-bold"
                  format={{
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 2,
                  }}
                  value={proPrice?.amount ?? 0}
                />
                <span className="text-muted-foreground text-lg">
                  /{proPrice?.interval === "monthly" ? "month" : "year"}
                </span>
              </div>

              {frequency === "yearly" && (
                <Badge variant="secondary" className="w-fit">
                  Save $24/year
                </Badge>
              )}

              <p className="text-muted-foreground text-sm">
                For teams building serious content platforms
              </p>
            </CardHeader>

            <CardContent className="space-y-4 pb-8">
              <div className="space-y-3">
                {features.map((feature) => (
                  <div key={feature.name} className="flex items-start gap-3">
                    <feature.icon className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{feature.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {typeof feature.pro === "boolean"
                          ? feature.pro
                            ? "Included"
                            : "Not included"
                          : feature.pro}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                  <CircleCheck className="text-primary h-4 w-4" />
                  Everything in Free, plus advanced features
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pb-8">
              <Link
                className={buttonVariants({
                  variant: "default",
                  className: "w-full shadow-lg",
                })}
                href="https://app.simplist.blog/billing"
                target="_blank"
              >
                Upgrade to Pro
                <ArrowRight />
              </Link>
              <div className="flex flex-col items-center gap-1">
                <p className="text-muted-foreground text-center text-xs">
                  Cancel anytime, no questions asked
                </p>
                <p className="text-muted-foreground/60 flex items-center gap-1.5 text-[11px]">
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M14 9.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-2 5.5c-1.22 0-2.33.44-3.19 1.17l-.55-.83C9.18 14.46 10.53 14 12 14c1.47 0 2.82.46 3.74 1.34l-.55.83C14.33 15.44 13.22 15 12 15zm10 0c0 5.52-4.48 10-10 10S2 20.52 2 15 6.48 5 12 5s10 4.48 10 10zm-2 0c0-4.41-3.59-8-8-8s-8 3.59-8 8 3.59 8 8 8 8-3.59 8-8z" />
                  </svg>
                  Secured by Stripe
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Trust indicators */}
        <div className="mx-auto mt-8 flex max-w-5xl flex-wrap items-center justify-center gap-6 text-center">
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

        {/* FAQ Section */}
        <div className="mx-auto mt-20 max-w-3xl">
          <div className="mb-8 text-center">
            <h3
              className="mb-2 text-2xl font-semibold md:text-3xl"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              Frequently asked questions
            </h3>
            <p className="text-muted-foreground">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Collapsible
                key={index}
                open={openFaq === index}
                onOpenChange={(isOpen) => setOpenFaq(isOpen ? index : null)}
              >
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-6 text-left hover:bg-transparent"
                    >
                      <span className="font-medium">{faq.question}</span>
                      <ArrowRight
                        className={`text-muted-foreground h-5 w-5 shrink-0 transition-transform ${
                          openFaq === index ? "rotate-90" : ""
                        }`}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="text-muted-foreground border-t px-6 pt-4 pb-6 text-sm">
                      {faq.answer}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>

          <div className="bg-muted/30 mt-8 rounded-lg border p-6 text-center">
            <p className="text-muted-foreground mb-3">
              Still have questions? We&apos;re here to help.
            </p>
            <Link
              href="mailto:support@simplist.blog"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
