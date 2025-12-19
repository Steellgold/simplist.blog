import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@simplist/ui/components/card";
import {
  Blocks,
  Cctv,
  ChartNoAxesColumn,
  ChevronsLeftRight,
  Fingerprint,
  Lightbulb,
  Minus,
  type LucideIcon,
} from "lucide-react";

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
  list: string[];
};

const features: Feature[] = [
  {
    title: "Global performance by default",
    description: "Your content loads instantly anywhere in the world.",
    icon: Lightbulb,
    list: [
      "Sub-50ms response times worldwide",
      "Built-in caching for zero latency",
      "CDN-ready for global performance",
    ],
  },
  {
    title: "Security first",
    description: "Enterprise-grade security baked into every request.",
    icon: Cctv,
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
    icon: ChevronsLeftRight,
    list: [
      "TypeScript SDK with auto-completion",
      "Interactive API documentation",
      "Works with React, Vue, Next.js & more",
    ],
  },
  {
    title: "Analytics that actually help",
    description: "Understand your readers and what they care about.",
    icon: ChartNoAxesColumn,
    list: [
      "Track views, time on page & engagement",
      "Geographic data of your readers",
      "Filter bot traffic automatically",
    ],
  },
  {
    title: "Scales with your projects",
    description: "From side project to production-grade content platform.",
    icon: Blocks,
    list: [
      "From side project to production",
      "Handle millions of requests effortlessly",
      "No infrastructure to manage",
    ],
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="relative py-24 md:py-28 px-4 mb-10">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-14 intersect-once intersect:motion-preset-fade">
          <p className="text-sm font-medium text-primary mb-2 uppercase tracking-[0.18em]">
            Why Developers Pick Simplist
          </p>
          <h2
            className="text-3xl md:text-4xl font-semibold mb-2.5"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Everything you need to run a content platform
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Content API, analytics, SEO and multi-tenant projects – all in one
            place, without a custom backend to maintain.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="overflow-hidden rounded-2xl bg-muted/70 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 sm:gap-0.5 space-y-0.5 sm:space-y-0 p-0.5 border">
            {features.map((feature) => (
              <Card key={feature.title} className="group relative border-0 p-0">
                <CardHeader className="space-y-2 px-4 pt-4 pb-2">
                  <div className="w-fit rounded-lg bg-secondary/70 p-1.5">
                    <feature.icon className="h-6 w-6 opacity-30 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardTitle className="text-base md:text-lg">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-sm md:text-[15px]">
                    {feature.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-4 pb-4 pt-1">
                  <ul className="text-xs md:text-sm text-muted-foreground space-y-1.5">
                    {feature.list.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <Minus size={16} className="text-muted-foreground/50" />
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
