"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemSeparator, ItemTitle } from "@/components/ui/item";
import { UpgradeOverlay } from "@/components/ui/upgrade-overlay";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Eye, TrendingDown, TrendingUp, Users } from "lucide-react";
import { useRouter } from "next/navigation";

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
        <UpgradeOverlay
          title="Unlock this feature"
          description="Track your audience engagement and optimize your content for different languages."
        />
      )}
    </div>
  );
};
