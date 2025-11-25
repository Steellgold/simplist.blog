"use client";

import { Blocks } from "@simplist/ui/components/animate-ui/icons/blocks";
import { Cctv } from "@simplist/ui/components/animate-ui/icons/cctv";
import { ChartNoAxesColumn } from "@simplist/ui/components/animate-ui/icons/chart-no-axes-column";
import { ChevronLeftRight } from "@simplist/ui/components/animate-ui/icons/chevron-left-right";
import { Fingerprint } from "@simplist/ui/components/animate-ui/icons/fingerprint";
import { Lightbulb } from "@simplist/ui/components/animate-ui/icons/lightbulb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@simplist/ui/components/card";
import { useState } from "react";

type Feature = {
  title: string;
  description: string;
  icon: (animate: boolean) => React.ReactNode;
  list: string[];
}

const features: Feature[] = [
  {
    title: "Lightning Fast",
    description: "Your content loads instantly, keeping your audience engaged",
    icon: (animate) => <Lightbulb animate={animate} />,
    list: [
      "Sub-50ms response times worldwide",
      "Built-in caching for zero latency",
      "CDN-ready for global performance",
    ],
  },
  {
    title: "Secure by Design",
    description: "Sleep well knowing your content is protected by enterprise-grade security",
    icon: (animate) => <Cctv animate={animate} />,
    list: [
      "Secure API keys with granular permissions",
      "Rate limiting to prevent abuse",
      "CORS protection for your domains",
    ],
  },
  {
    title: "SEO Optimized",
    description: "Rank higher on Google with built-in SEO tools that just work",
    icon: (animate) => <Fingerprint animate={animate} />,
    list: [
      "Auto-generated XML sitemaps",
      "Rich meta tags for social sharing",
      "RSS feeds for content syndication",
    ],
  },
  {
    title: "Developer Experience First",
    description: "Build faster with modern tools and comprehensive documentation",
    icon: (animate) => <ChevronLeftRight animate={animate} />,
    list: [
      "TypeScript SDK with auto-completion",
      "Interactive API documentation",
      "Works with React, Vue, Next.js & more",
    ],
  },
  {
    title: "Know Your Audience",
    description: "Understand who reads your content and what they love",
    icon: (animate) => <ChartNoAxesColumn animate={animate} />,
    list: [
      "Track views, time on page & engagement",
      "Geographic data of your readers",
      "Filter bot traffic automatically",
    ],
  },
  {
    title: "Grows With You",
    description: "Start small, scale big. No migration headaches",
    icon: (animate) => <Blocks animate={animate} />,
    list: [
      "From side project to production",
      "Handle millions of requests effortlessly",
      "No infrastructure to manage",
    ],
  }
];

export const FeaturesSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="features" className="py-28 px-4 mb-20">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16 intersect-once intersect:motion-preset-fade">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need for content management
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built for developers who want a simple, powerful, and fast content API without the complexity.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            // Static delay classes for Tailwind
            const delayClasses = [
              '',
              'intersect:motion-delay-[150ms]',
              'intersect:motion-delay-[300ms]',
              'intersect:motion-delay-[450ms]',
              'intersect:motion-delay-[600ms]',
              'intersect:motion-delay-[750ms]'
            ];

            return (
              <Card
                key={feature.title}
                className={`intersect-once intersect:motion-preset-slide-up-sm ${delayClasses[index]} hover:border-primary/95 transition-colors duration-300`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <CardHeader>
                  <div className="w-fit bg-secondary/60 p-1 rounded-md">
                    {feature.icon(hoveredIndex === index)}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {feature.list.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
