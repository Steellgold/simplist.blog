"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { MiniBadge } from "@/components/ui/mini-badge";
import { Item, ItemContent, ItemTitle, ItemDescription, ItemMedia, ItemGroup, ItemSeparator } from "@/components/ui/item";
import { LineChart, TrendingUp, TrendingDown, Eye, Users, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AnalyticsPreviewCardProps {
  analyticsEnabled: boolean;
  todayViews?: number;
  todayUniqueVisitors?: number;
  averageBounceRate?: number;
  projectSlug: string;
}

export const AnalyticsPreviewCard = ({
  analyticsEnabled,
  todayViews = 0,
  todayUniqueVisitors = 0,
  averageBounceRate = 0,
  projectSlug,
}: AnalyticsPreviewCardProps) => {
  const router = useRouter();

  return (
    <div className="relative group">
      <Card>
        <CardHeader>
          <CardTitle>Analytics Overview</CardTitle>
          <CardDescription>Track your article views and unique visitors.</CardDescription>
        </CardHeader>

        <CardContent>
          <ItemGroup>
            <Item variant="muted" size="sm">
              <ItemMedia variant="icon">
                <Eye />
              </ItemMedia>
              <ItemContent>
                <ItemDescription>Views Today</ItemDescription>
                <ItemTitle className="text-2xl font-bold">
                  {analyticsEnabled ? todayViews.toLocaleString() : "---"}
                </ItemTitle>
              </ItemContent>
            </Item>

            <ItemSeparator />

            <Item variant="muted">
              <ItemMedia variant="icon">
                <Users />
              </ItemMedia>
              <ItemContent>
                <ItemDescription>Unique Visitors</ItemDescription>
                <ItemTitle className="text-2xl font-bold">
                  {analyticsEnabled ? todayUniqueVisitors.toLocaleString() : "---"}
                </ItemTitle>
              </ItemContent>
            </Item>

            <ItemSeparator />

            <Item variant="muted" size="sm">
              <ItemMedia variant="icon">
                {averageBounceRate > 50 ? <TrendingDown /> : <TrendingUp />}
              </ItemMedia>
              <ItemContent>
                <ItemDescription>Avg. Bounce Rate</ItemDescription>
                <ItemTitle className="text-2xl font-bold">
                  {analyticsEnabled ? `${averageBounceRate.toFixed(1)}%` : "---"}
                </ItemTitle>
              </ItemContent>
            </Item>
          </ItemGroup>
        </CardContent>

        <CardFooter className={cn({
          "hidden": !analyticsEnabled
        })}>
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => router.push(`/${projectSlug}/analytics`)}
          >
            View detailed analytics
            <ArrowUpRight />
          </Button>
        </CardFooter>
      </Card>

      {!analyticsEnabled && (
        <div className="border absolute backdrop-blur-sm inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 via-background/80 to-background/60" />
          <div className="relative h-full flex items-center justify-center p-6">
            <div className="flex flex-col items-center text-center gap-4 max-w-xs">
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-semibold text-foreground">
                  Upgrade to Pro to unlock Analytics
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Track page views, unique visitors, and engagement metrics for your articles.
                </p>
              </div>

              <Link
                href="/pricing"
                className={buttonVariants({ size: "sm", variant: "default" })}
              >
                <MiniBadge tier="PRO" size="sm" />
                Unlock with Pro
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
