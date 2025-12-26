"use client";

import { MiniBadge } from "@/components/ui/mini-badge";
import {
  Calendar,
  ChartAreaStackedNormalized,
  ChartMixed,
  Clock,
  FolderOpen,
  Globe,
  Megaphone,
} from "@gravity-ui/icons";
import { buttonVariants } from "@simplist/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@simplist/ui/components/card";
import Link from "next/link";

interface UpgradeBannerProps {
  projectSlug: string;
}

const features = [
  {
    icon: Calendar,
    title: "Extended Time Ranges",
    description: "30 & 90 days + custom periods",
  },
  {
    icon: Globe,
    title: "Complete Geographic Data",
    description: "Top 10 countries, cities & regions",
  },
  {
    icon: Megaphone,
    title: "UTM Campaign Tracking",
    description: "Sources, mediums & campaigns",
  },
  {
    icon: FolderOpen,
    title: "Scroll Depth Funnel",
    description: "Engagement milestones & metrics",
  },
  {
    icon: Clock,
    title: "Recent Activity Feed",
    description: "Latest 20 views with full details",
  },
];

export const UpgradeBanner = ({ projectSlug }: UpgradeBannerProps) => {
  return (
    <Card className="from-primary/5 via-primary/10 to-background bg-linear-to-br border-none">
      <CardHeader>
        <CardTitle className="text-xl">Unlock Advanced Analytics</CardTitle>
        <CardDescription>Get deeper insights with professional analytics features</CardDescription>
        
        <CardAction>
          <Link
            className={buttonVariants({
              variant: "default",
              size: "xs",
            })}
            href={`/${projectSlug}/settings/billing`}
          >
            Upgrade
            <ChartMixed />
          </Link>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-6 pt-3">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="flex gap-3">
                <div className="bg-background/35 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                  <Icon className="text-primary h-4 w-4" />
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm leading-none font-medium">
                    {feature.title}
                  </p>
                  
                  <p className="text-muted-foreground text-xs">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
