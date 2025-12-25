"use client";

import { UpgradeOverlay } from "@/components/ui/upgrade-overlay";
import {
  ArrowRight,
  ChevronsDownWide,
  ChevronsUpWide,
  Eye,
  Persons,
} from "@gravity-ui/icons";
import { buttonVariants } from "@simplist/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@simplist/ui/components/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@simplist/ui/components/item";
import Link from "next/link";

interface AnalyticsPreviewCardProps {
  todayViews?: number;
  todayUniqueVisitors?: number;
  averageBounceRate?: number;
  projectSlug: string;
  isPro: boolean;
}

export const AnalyticsPreviewCard = ({
  todayViews = 0,
  todayUniqueVisitors = 0,
  averageBounceRate = 0,
  projectSlug,
  isPro,
}: AnalyticsPreviewCardProps) => {
  return (
    <div className="group relative">
      <Card>
        <CardHeader>
          <CardTitle>Analytics Overview</CardTitle>
          <CardDescription>
            Track your article views and unique visitors.
          </CardDescription>
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
                  {todayViews.toLocaleString()}
                </ItemTitle>
              </ItemContent>
            </Item>

            <ItemSeparator />

            <Item variant="muted">
              <ItemMedia variant="icon">
                <Persons />
              </ItemMedia>
              <ItemContent>
                <ItemDescription>Unique Visitors</ItemDescription>
                <ItemTitle className="text-2xl font-bold">
                  {todayUniqueVisitors.toLocaleString()}
                </ItemTitle>
              </ItemContent>
            </Item>

            <ItemSeparator />

            <Item variant="muted" size="sm">
              <ItemMedia variant="icon">
                {averageBounceRate > 50 ? <ChevronsDownWide /> : <ChevronsUpWide />}
              </ItemMedia>
              <ItemContent>
                <ItemDescription>Avg. Bounce Rate</ItemDescription>
                <ItemTitle className="text-2xl font-bold">
                  {`${averageBounceRate.toFixed(1)}%`}
                </ItemTitle>
              </ItemContent>
            </Item>
          </ItemGroup>
        </CardContent>

        <CardFooter>
          <Link
            href={`/${projectSlug}/analytics`}
            className={buttonVariants({
              variant: "secondary",
              className: "w-full",
            })}
          >
            View detailed analytics
            <ArrowRight />
          </Link>
        </CardFooter>
      </Card>

      {!isPro && (
        <UpgradeOverlay
          title="Unlock this feature"
          description="Track your audience engagement and optimize your content for different languages."
        />
      )}
    </div>
  );
};
