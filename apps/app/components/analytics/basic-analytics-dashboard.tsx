"use client";

import { AnalyticsDataMultiPeriod } from "@/lib/actions/analytics";
import {
  getCountryCode,
  getCountryFlagUrl,
  getCountryInfo,
} from "@/lib/utils/countries";
import {
  CaretUp,
  Clock,
  Display,
  Eye,
  FileText,
  Globe,
  LayoutFooter,
  Persons,
  Pulse,
  Smartphone,
} from "@gravity-ui/icons";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@simplist/ui/components/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@simplist/ui/components/chart";
import type { ComponentType } from "react";
import Image from "next/image";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

interface BasicAnalyticsDashboardProps {
  analyticsData: AnalyticsDataMultiPeriod;
}

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  suffix = "",
  trend,
}: {
  title: string;
  value: number | string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  suffix?: string;
  trend?: number;
}) => (
  <Card>
    <CardHeader className="-mb-6">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <CardAction>
        <Icon className="text-muted-foreground h-4 w-4" />
      </CardAction>
    </CardHeader>

    <CardContent>
      <div className="text-2xl font-bold">
        {value}
        {suffix}
      </div>
      <div className="flex items-center space-x-2">
        <p className="text-muted-foreground text-xs">{description}</p>
        {trend !== undefined && (
          <div
            className={`flex items-center text-xs ${trend >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            <CaretUp className={`h-3 w-3 ${trend < 0 ? "rotate-180" : ""}`} />
            <span className="ml-1">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const DeviceIcon = ({ device }: { device: string }) => {
  switch (device.toLowerCase()) {
    case "mobile":
      return <Smartphone className="h-4 w-4" />;
    case "tablet":
      return <LayoutFooter className="h-4 w-4" />;
    default:
      return <Display className="h-4 w-4" />;
  }
};

// Chart color configuration
const chartConfig = {
  views: {
    label: "Views",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-1)",
  },
  desktop: {
    label: "Desktop",
    color: "var(--chart-2)",
  },
  tablet: {
    label: "Tablet",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

// Pie chart colors
const DEVICE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export const BasicAnalyticsDashboard = ({
  analyticsData,
}: BasicAnalyticsDashboardProps) => {
  // STARTER users only get 7 days data
  const analytics = analyticsData["7"];

  // Chart data for views over time (7 days only)
  const chartData =
    analytics.viewsOverTime?.map((stat) => {
      const dateObj = new Date(stat.date + "T00:00:00");
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return {
        date: formattedDate,
        views: stat.views,
      };
    }) || [];

  // Device data mapping for bar chart
  const deviceData =
    analytics.deviceStats?.map((stat, index) => ({
      device: stat.device,
      value: stat.views,
      percentage: stat.percentage,
      fill: DEVICE_COLORS[index % DEVICE_COLORS.length],
    })) || [];

  // Country data mapping (Top 3 only)
  const countryData =
    analytics.topCountries?.slice(0, 3).map((stat) => {
      const isCountryCode =
        stat.country.length === 2 &&
        stat.country.toUpperCase() === stat.country;

      let countryName = stat.country;
      let flagUrl = null;

      if (isCountryCode) {
        const countryInfo = getCountryInfo(stat.country);
        countryName = countryInfo.name;
        flagUrl = countryInfo.flagUrl;
      } else {
        const countryCode = getCountryCode(stat.country);
        if (countryCode) {
          flagUrl = getCountryFlagUrl(countryCode);
        }
      }

      return {
        country: countryName,
        flagUrl,
        value: stat.views,
        percentage: stat.percentage,
      };
    }) || [];

  return (
    <div className="container mx-auto max-w-7xl space-y-4">
      {/* Stats Cards - Basic metrics only */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Views"
          value={analytics.summary.totalViews?.toLocaleString() || "0"}
          description="Last 7 days"
          icon={Eye}
        />

        <StatCard
          title="Unique Visitors"
          value={analytics.summary.uniqueVisitors?.toLocaleString() || "0"}
          description="Different visitors"
          icon={Persons}
        />

        <StatCard
          title="Avg. Time"
          value={Math.round((analytics.summary.avgTimeOnPage || 0) / 60)}
          description="Minutes per page"
          icon={Clock}
          suffix="m"
        />

        <StatCard
          title="Bounce Rate"
          value={analytics.summary.bounceRate || 0}
          description="Visitors who left"
          icon={Pulse}
          suffix="%"
        />
      </div>

      {/* Views Chart - Simple 7-day view only */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-muted flex size-8 items-center justify-center rounded-sm border">
              <Eye className="size-4" />
            </div>
            <div>
              <CardTitle>Views Over Time</CardTitle>
              <CardDescription>Last 7 days of traffic</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {chartData.length === 0 ? (
            <div className="text-muted-foreground flex h-64 w-full items-center justify-center">
              No data available for this period
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-views)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-views)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  domain={[0, "auto"]}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="var(--color-views)"
                  strokeWidth={2}
                  fill="url(#fillViews)"
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Top 3 Articles */}
        <Card className="flex flex-1 flex-col">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-muted flex size-8 items-center justify-center rounded-sm border">
                <FileText className="size-4" />
              </div>
              <div>
                <CardTitle>Top Articles</CardTitle>
                <CardDescription>Top 3 most viewed</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-4">
              {analytics.topArticles?.slice(0, 3).map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm leading-none font-medium">
                      {article.title}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      /{article.slug}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{article.views}</p>
                  </div>
                </div>
              )) || (
                <p className="text-muted-foreground text-sm">
                  No data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Devices & Countries */}
        <div className="flex flex-col gap-4">
          {/* Devices */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-muted flex size-8 items-center justify-center rounded-sm border">
                  <Display className="size-4" />
                </div>
                <div>
                  <CardTitle>Device Types</CardTitle>
                  <CardDescription>Distribution by device</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {deviceData.length > 0 ? (
                <div className="flex flex-col space-y-4">
                  <ChartContainer
                    config={chartConfig}
                    className="min-h-[200px] w-full"
                  >
                    <BarChart accessibilityLayer data={deviceData}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="device"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent hideLabel nameKey="device" />
                        }
                      />
                      <Bar dataKey="value" radius={8} />
                    </BarChart>
                  </ChartContainer>
                  <div className="space-y-2">
                    {deviceData.map((device) => (
                      <div
                        key={device.device}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: device.fill }}
                          />
                          <DeviceIcon device={device.device} />
                          <span className="text-sm font-medium capitalize">
                            {device.device}
                          </span>
                        </div>
                        <span className="text-muted-foreground text-sm">
                          {device.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No device data available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Top 3 Countries */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-muted flex size-8 items-center justify-center rounded-sm border">
                  <Globe className="size-4" />
                </div>
                <div>
                  <CardTitle>Top Countries</CardTitle>
                  <CardDescription>Top 3 visitor locations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {countryData.length > 0 ? (
                  countryData.map((country) => (
                    <div
                      key={country.country}
                      className="relative flex items-center justify-between overflow-hidden rounded-md px-3 py-2"
                    >
                      <div
                        className="bg-primary/10 absolute inset-0 transition-all duration-300"
                        style={{ width: `${country.percentage}%` }}
                      />
                      <div className="relative flex items-center space-x-2">
                        {country.flagUrl ? (
                          <Image
                            src={country.flagUrl}
                            alt={`Flag of ${country.country}`}
                            width={16}
                            height={16}
                            className="h-4 w-4 flex-shrink-0 rounded"
                          />
                        ) : (
                          <div className="bg-muted h-4 w-4 flex-shrink-0 rounded-sm" />
                        )}
                        <span className="text-sm font-medium">
                          {country.country}
                        </span>
                      </div>
                      <span className="text-muted-foreground relative ml-2 flex-shrink-0 text-sm">
                        {country.percentage}%
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground py-8 text-center">
                    <p className="text-sm">No country data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
