import {
  Bulb,
  ChartAreaStacked,
  ChevronsExpandHorizontal,
  Cubes3Overlap,
  Fingerprint,
  Lock,
  Minus,
} from "@gravity-ui/icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@simplist/ui/components/card";
import { ComponentType, SVGProps } from "react";

type Feature = {
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  list: string[];
};

const features: Feature[] = [
  {
    title: "Global performance by default",
    description: "Your content loads instantly anywhere in the world.",
    icon: Bulb,
    list: [
      "Sub-50ms response times worldwide",
      "Built-in caching for zero latency",
      "CDN-ready for global performance",
    ],
  },
  {
    title: "Security first",
    description: "Enterprise-grade security baked into every request.",
    icon: Lock,
    list: [
      "Secure API keys with granular permissions",
      "Rate limiting to prevent abuse",
      "CORS protection for your domains",
    ],
  },
  {
    title: "SEO & feeds included",
    description: "Ship sitemaps, RSS and social cards without extra services.",
    icon: Fingerprint,
    list: [
      "Auto-generated XML sitemaps",
      "Rich meta tags for social sharing",
      "RSS feeds for content syndication",
    ],
  },
  {
    title: "Developer experience first",
    description: "Modern SDKs, great docs and an API that feels familiar.",
    icon: ChevronsExpandHorizontal,
    list: [
      "TypeScript SDK with auto-completion",
      "Interactive API documentation",
      "Works with React, Vue, Next.js & more",
    ],
  },
  {
    title: "Analytics that actually help",
    description: "Understand your readers and what they care about.",
    icon: ChartAreaStacked,
    list: [
      "Track views, time on page & engagement",
      "Geographic data of your readers",
      "Filter bot traffic automatically",
    ],
  },
  {
    title: "Scales with your projects",
    description: "From side project to production-grade content platform.",
    icon: Cubes3Overlap,
    list: [
      "From side project to production",
      "Handle millions of requests effortlessly",
      "No infrastructure to manage",
    ],
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="relative z-300 mb-10 px-4 py-24 md:py-28">
      <div className="container mx-auto max-w-6xl">
        <div className="intersect-once mb-14 text-center">
          <p className="text-primary mb-2 text-sm font-medium tracking-[0.18em] uppercase">
            Why Developers Pick Simplist
          </p>
          <h2
            className="mb-2.5 text-3xl font-semibold md:text-4xl"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Everything you need to run a content platform
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base md:text-lg">
            Content API, analytics, SEO and multi-tenant projects – all in one
            place, without a custom backend to maintain.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="bg-muted/70 grid grid-cols-1 space-y-0.5 overflow-hidden rounded-2xl border p-0.5 shadow-sm sm:grid-cols-2 sm:gap-0.5 sm:space-y-0 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="group relative border-0 p-0">
                <CardHeader className="space-y-2 px-4 pt-4 pb-2">
                  <div className="bg-secondary/70 w-fit rounded-lg p-1.5">
                    <feature.icon className="h-6 w-6 opacity-30 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>

                  <CardTitle className="text-base md:text-lg">
                    {feature.title}
                  </CardTitle>

                  <CardDescription className="text-sm md:text-[15px]">
                    {feature.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-4 pt-1 pb-4">
                  <ul className="text-muted-foreground space-y-1.5 text-xs md:text-sm">
                    {feature.list.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <Minus className="text-muted-foreground/50" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
