"use client";

import { ArrowRight, ChevronDown, Envelope } from "@gravity-ui/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@simplist/ui/components/accordion";
import { Button, buttonVariants } from "@simplist/ui/components/button";
import { Card } from "@simplist/ui/components/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@simplist/ui/components/collapsible";
import { cn } from "@simplist/ui/lib/utils";
import Link from "next/link";
import { useState } from "react";

const faqs = [
  {
    question: "Can I upgrade or downgrade at any time?",
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll be charged a prorated amount. When downgrading, your account will be credited for the remaining time.",
  },
  {
    question: "Will I get access to historical data when upgrading to Pro?",
    answer:
      "Yes! We collect all analytics data from day one, even on the Free plan. When you upgrade to Pro, you'll instantly get access to all your historical data beyond the 7-day limit, including all the advanced metrics that were being collected in the background.",
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

export const FaqSection = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section id="faq" className="px-4 py-20 md:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h2
            className="mb-2 text-2xl font-semibold md:text-3xl"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know about our pricing
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card className="bg-card/50 p-0 backdrop-blur-sm" key={index}>
              <Accordion type="single" collapsible>
                <AccordionItem value={`item-${index}`} className="border-none">
                  <AccordionTrigger className="px-6 py-4 text-left text-base font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>

                  <AccordionContent className="text-muted-foreground px-6 pb-4 text-pretty">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          ))}
        </div>

        <div className="bg-muted/30 mt-8 rounded-lg border p-6 text-center">
          <p className="text-muted-foreground mb-3">
            Still have questions? We&apos;re here to help.
          </p>

          <Link
            href="mailto:support@simplist.blog?subject=Question about Simplist"
            className={buttonVariants({ variant: "outline" })}
          >
            <Envelope className="size-4" />
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
};
