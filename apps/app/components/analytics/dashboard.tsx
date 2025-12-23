"use client";

import { AnalyticsDataMultiPeriod } from "@/lib/actions/analytics";
import {
  getCountryCode,
  getCountryFlagUrl,
  getCountryInfo,
} from "@/lib/utils/countries";
import { Button } from "@simplist/ui/components/button";
import { ButtonGroup } from "@simplist/ui/components/button-group";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@simplist/ui/components/select";
import {
  Activity,
  Clock,
  Eye,
  FileText,
  Globe,
  Link2,
  Megaphone,
  Monitor,
  MousePointerClick,
  ScrollText,
  Smartphone,
  Tablet,
  TrendingUp,
  Users,
} from "lucide-react";
import Image from "next/image";
import { parseAsInteger, useQueryState } from "nuqs";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { RecentActivityTable } from "./recent-activity-table";

interface AnalyticsDashboardProps {
  analyticsData: AnalyticsDataMultiPeriod;
}

interface AnalyticsDashboardContentProps {
  analyticsData: AnalyticsDataMultiPeriod;
  selectedPeriod: number;
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
  icon: React.ComponentType<{ className?: string }>;
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
            <TrendingUp
              className={`h-3 w-3 ${trend < 0 ? "rotate-180" : ""}`}
            />
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
      return <Tablet className="h-4 w-4" />;
    default:
      return <Monitor className="h-4 w-4" />;
  }
};

// Chart color configuration
const chartConfig = {
  views: {
    label: "Views",
    color: "var(--chart-1)",
  },
  visitors: {
    label: "Visitors",
    color: "var(--chart-2)",
  },
  engagement: {
    label: "Engagement",
    color: "var(--chart-3)",
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

export const AnalyticsDashboardContent = ({
  analyticsData,
  selectedPeriod,
}: AnalyticsDashboardContentProps) => {
  const [selectedLocationTab, setSelectedLocationTab] = useQueryState(
    "location",
    parseAsInteger.withDefault(0),
  );
  const [selectedChartTab, setSelectedChartTab] = useQueryState(
    "chart",
    parseAsInteger.withDefault(0),
  );
  const [selectedUtmTab, setSelectedUtmTab] = useQueryState(
    "utm",
    parseAsInteger.withDefault(0),
  );

  // Get analytics data for selected period
  const analytics =
    analyticsData[selectedPeriod.toString()] || analyticsData["7"];

  // Chart data for views over time
  const chartData =
    analytics.viewsOverTime?.map((stat) => {
      // stat.date is already in ISO format (YYYY-MM-DD)
      const dateObj = new Date(stat.date + "T00:00:00"); // Add time to ensure correct timezone handling
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      // Keep avgTimeOnPage in seconds for better visibility
      const engagementSeconds = Math.round(stat.avgTimeOnPage || 0);
      return {
        date: formattedDate,
        views: stat.views,
        visitors: stat.uniqueVisitors,
        engagement: engagementSeconds,
        engagementFormatted: `${engagementSeconds}s `,
      };
    }) || [];

  // Device data mapping for pie chart
  const deviceData =
    analytics.deviceStats?.map((stat, index) => ({
      device: stat.device,
      value: stat.views,
      percentage: stat.percentage,
      fill: DEVICE_COLORS[index % DEVICE_COLORS.length],
    })) || [];

  // Country data mapping
  const countryData =
    analytics.topCountries?.slice(0, 8).map((stat) => {
      // Check if it's a country code (2 letters) or country name
      const isCountryCode =
        stat.country.length === 2 &&
        stat.country.toUpperCase() === stat.country;

      let countryName = stat.country;
      let flagUrl = null;

      if (isCountryCode) {
        // It's a country code, convert to name and get flag
        const countryInfo = getCountryInfo(stat.country);
        countryName = countryInfo.name;
        flagUrl = countryInfo.flagUrl;
      } else {
        // It's a country name, try to get the flag
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

  // City data mapping
  const cityData =
    analytics.topCities?.slice(0, 8).map((stat) => {
      // Get country flag for the city
      let flagUrl = null;
      if (stat.countryCode) {
        flagUrl = getCountryFlagUrl(stat.countryCode);
      } else if (stat.country) {
        const countryCode = getCountryCode(stat.country);
        if (countryCode) {
          flagUrl = getCountryFlagUrl(countryCode);
        }
      }

      return {
        city: stat.city,
        country: stat.country,
        flagUrl,
        value: stat.views,
        percentage: stat.percentage,
      };
    }) || [];

  // Region data mapping
  const regionData =
    analytics.topRegions?.slice(0, 8).map((stat) => {
      // Get country flag for the region
      let flagUrl = null;
      if (stat.countryCode) {
        flagUrl = getCountryFlagUrl(stat.countryCode);
      } else if (stat.country) {
        const countryCode = getCountryCode(stat.country);
        if (countryCode) {
          flagUrl = getCountryFlagUrl(countryCode);
        }
      }

      return {
        region: stat.region,
        country: stat.country,
        flagUrl,
        value: stat.views,
        percentage: stat.percentage,
      };
    }) || [];

  // Helper to get favicon URL for a domain
  const getFaviconUrl = (domain: string) => {
    if (domain === "Direct" || !domain) return null;
    // Use Google's favicon service
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  };

  // Referrer data mapping
  const referrerData =
    analytics.topReferrers?.slice(0, 8).map((stat) => ({
      referrer: stat.referrer,
      faviconUrl: getFaviconUrl(stat.referrer),
      value: stat.views,
      percentage: stat.percentage,
    })) || [];

  // UTM data mapping
  const utmSourceData = analytics.utmStats?.sources?.slice(0, 8) || [];
  const utmMediumData = analytics.utmStats?.mediums?.slice(0, 8) || [];
  const utmCampaignData = analytics.utmStats?.campaigns?.slice(0, 8) || [];

  return (
    <div className="container mx-auto max-w-7xl space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Views"
          value={analytics.summary.totalViews?.toLocaleString() || "0"}
          description="Total page views"
          icon={Eye}
        />

        <StatCard
          title="Unique Visitors"
          value={analytics.summary.uniqueVisitors?.toLocaleString() || "0"}
          description="Different visitors"
          icon={Users}
        />

        <StatCard
          title="Avg. Time"
          value={Math.round((analytics.summary.avgTimeOnPage || 0) / 60)}
          description="Minutes per page"
          icon={Clock}
          suffix="m"
        />

        <StatCard
          title="Engagement Rate"
          value={100 - (analytics.summary.bounceRate || 0)}
          description="Engaged visitors"
          icon={Activity}
          suffix="%"
        />
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-muted flex size-8 items-center justify-center rounded-sm border">
              <TrendingUp className="size-4" />
            </div>
            <div>
              <CardTitle>
                {selectedChartTab === 0 && "Traffic Overview"}
                {selectedChartTab === 1 && "Views Traffic"}
                {selectedChartTab === 2 && "Visitors Traffic"}
                {selectedChartTab === 3 && "Engagement Traffic"}
              </CardTitle>

              <CardDescription>
                Traffic evolution over the last {selectedPeriod} days
              </CardDescription>
            </div>
          </div>

          <CardAction>
            {/* Chart type dropdown */}
            <Select
              value={selectedChartTab.toString()}
              onValueChange={(value) => setSelectedChartTab(parseInt(value))}
            >
              <SelectTrigger className="w-[130px]" suppressHydrationWarning>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Overview</SelectItem>
                <SelectItem value="1">Views</SelectItem>
                <SelectItem value="2">Visitors</SelectItem>
                <SelectItem value="3">Engagement</SelectItem>
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {selectedChartTab === 0 && (
              <div className="space-y-4">
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
                        <linearGradient
                          id="fillViews"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
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
                        <linearGradient
                          id="fillVisitors"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="var(--color-visitors)"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--color-visitors)"
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
                      <Area
                        type="monotone"
                        dataKey="visitors"
                        stroke="var(--color-visitors)"
                        strokeWidth={2}
                        fill="url(#fillVisitors)"
                      />
                    </AreaChart>
                  </ChartContainer>
                )}
              </div>
            )}

            {selectedChartTab === 1 && (
              <div className="space-y-4">
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
                        <linearGradient
                          id="fillViewsOnly"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
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
                        strokeWidth={3}
                        fill="url(#fillViewsOnly)"
                      />
                    </AreaChart>
                  </ChartContainer>
                )}
              </div>
            )}

            {selectedChartTab === 2 && (
              <div className="space-y-4">
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
                        <linearGradient
                          id="fillVisitorsOnly"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="var(--color-visitors)"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--color-visitors)"
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
                        dataKey="visitors"
                        stroke="var(--color-visitors)"
                        strokeWidth={3}
                        fill="url(#fillVisitorsOnly)"
                      />
                    </AreaChart>
                  </ChartContainer>
                )}
              </div>
            )}

            {selectedChartTab === 3 && (
              <div className="space-y-4">
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
                        <linearGradient
                          id="fillEngagement"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="var(--color-engagement)"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--color-engagement)"
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
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value, name) => {
                              if (name === "engagement") {
                                return [`${value}s `, "Engagement"];
                              }
                              return [value, name];
                            }}
                          />
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="engagement"
                        stroke="var(--color-engagement)"
                        strokeWidth={2}
                        fill="url(#fillEngagement)"
                      />
                    </AreaChart>
                  </ChartContainer>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left Column - Top Articles & Referrers */}
        <div className="flex flex-col gap-4">
          {/* Top Articles */}
          <Card className="flex flex-1 flex-col">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-muted flex size-8 items-center justify-center rounded-sm border">
                  <FileText className="size-4" />
                </div>
                <div>
                  <CardTitle>Popular Articles</CardTitle>
                  <CardDescription>Most viewed articles</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <div className="space-y-4">
                {analytics.topArticles?.map((article) => (
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
                    <div className="space-y-1 text-right">
                      <p className="text-sm font-medium">{article.views}</p>
                      <p className="text-muted-foreground text-xs">
                        {Math.round(article.avgTimeOnPage / 60)}m
                      </p>
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

          {/* Top Referrers */}
          <Card className="flex flex-1 flex-col">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-muted flex size-8 items-center justify-center rounded-sm border">
                  <Link2 className="size-4" />
                </div>
                <div>
                  <CardTitle>Top Referrers</CardTitle>
                  <CardDescription>Traffic sources</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <div className="space-y-2">
                {referrerData.length > 0 ? (
                  referrerData.map((referrer) => {
                    const isDirect = referrer.referrer === "Direct";

                    return (
                      <div
                        key={referrer.referrer}
                        className="relative flex items-center justify-between overflow-hidden rounded-md px-3 py-2"
                      >
                        <div
                          className="bg-primary/10 absolute inset-0 transition-all duration-300"
                          style={{ width: `${referrer.percentage}%` }}
                        />
                        <div className="relative flex min-w-0 items-center space-x-2">
                          {isDirect ? (
                            <MousePointerClick className="h-4 w-4 flex-shrink-0" />
                          ) : referrer.faviconUrl ? (
                            <Image
                              src={referrer.faviconUrl}
                              alt={`${referrer.referrer} favicon`}
                              width={16}
                              height={16}
                              className="h-4 w-4 flex-shrink-0"
                            />
                          ) : (
                            <Link2 className="h-4 w-4 flex-shrink-0" />
                          )}
                          <span className="truncate text-sm font-medium">
                            {referrer.referrer}
                          </span>
                        </div>
                        <span className="text-muted-foreground relative ml-2 flex-shrink-0 text-sm">
                          {referrer.percentage}%
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No referrer data available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Devices & Countries */}
        <div className="flex flex-col gap-4">
          {/* Devices */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-muted flex size-8 items-center justify-center rounded-sm border">
                  <Monitor className="size-4" />
                </div>
                <div>
                  <CardTitle>Device Types</CardTitle>
                  <CardDescription>Distribution by device type</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {deviceData.length > 0 ? (
                <div className="flex flex-col space-y-4">
                  <ChartContainer
                    config={chartConfig}
                    className="min-h-[240px] w-full"
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

          {/* Geographic Data */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-muted flex size-8 items-center justify-center rounded-sm border">
                    <Globe className="size-4" />
                  </div>
                  <div>
                    <CardTitle>Geographic Data</CardTitle>
                    <CardDescription>
                      Origin of visitors by location
                    </CardDescription>
                  </div>
                </div>
                <ButtonGroup>
                  <Button
                    variant={selectedLocationTab === 0 ? "default" : "outline"}
                    onClick={() => setSelectedLocationTab(0)}
                  >
                    Countries
                  </Button>
                  <Button
                    variant={selectedLocationTab === 1 ? "default" : "outline"}
                    onClick={() => setSelectedLocationTab(1)}
                  >
                    Cities
                  </Button>
                  <Button
                    variant={selectedLocationTab === 2 ? "default" : "outline"}
                    onClick={() => setSelectedLocationTab(2)}
                  >
                    Regions
                  </Button>
                </ButtonGroup>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedLocationTab === 0 &&
                  (countryData.length > 0 ? (
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
                  ))}

                {selectedLocationTab === 1 &&
                  (cityData.length > 0 ? (
                    cityData.map((city) => (
                      <div
                        key={city.city}
                        className="relative flex items-center justify-between overflow-hidden rounded-md px-3 py-2"
                      >
                        <div
                          className="bg-primary/10 absolute inset-0 transition-all duration-300"
                          style={{ width: `${city.percentage}%` }}
                        />
                        <div className="relative flex items-center space-x-2">
                          {city.flagUrl ? (
                            <Image
                              src={city.flagUrl}
                              alt={`Flag of ${city.country}`}
                              width={16}
                              height={16}
                              className="h-4 w-4 flex-shrink-0 rounded"
                            />
                          ) : (
                            <div className="bg-muted h-4 w-4 flex-shrink-0 rounded-sm" />
                          )}
                          <span className="text-sm font-medium">
                            {city.city}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            ({city.country})
                          </span>
                        </div>
                        <span className="text-muted-foreground relative ml-2 flex-shrink-0 text-sm">
                          {city.percentage}%
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground py-8 text-center">
                      <p className="text-sm">No city data available</p>
                    </div>
                  ))}

                {selectedLocationTab === 2 &&
                  (regionData.length > 0 ? (
                    regionData.map((region) => (
                      <div
                        key={region.region}
                        className="relative flex items-center justify-between overflow-hidden rounded-md px-3 py-2"
                      >
                        <div
                          className="bg-primary/10 absolute inset-0 transition-all duration-300"
                          style={{ width: `${region.percentage}%` }}
                        />
                        <div className="relative flex items-center space-x-2">
                          {region.flagUrl ? (
                            <Image
                              src={region.flagUrl}
                              alt={`Flag of ${region.country}`}
                              width={16}
                              height={16}
                              className="h-4 w-4 flex-shrink-0 rounded"
                            />
                          ) : (
                            <div className="bg-muted h-4 w-4 flex-shrink-0 rounded-sm" />
                          )}
                          <span className="text-sm font-medium">
                            {region.region}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            ({region.country})
                          </span>
                        </div>
                        <span className="text-muted-foreground relative ml-2 flex-shrink-0 text-sm">
                          {region.percentage}%
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground py-8 text-center">
                      <p className="text-sm">No region data available</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* UTM Stats & Scroll Funnel Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* UTM Stats */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-muted flex size-8 items-center justify-center rounded-sm border">
                <Megaphone className="size-4" />
              </div>
              <div>
                <CardTitle>Campaigns</CardTitle>
                <CardDescription>UTM tracking data</CardDescription>
              </div>
            </div>
            <CardAction>
              <ButtonGroup>
                <Button
                  variant={selectedUtmTab === 0 ? "default" : "outline"}
                  onClick={() => setSelectedUtmTab(0)}
                >
                  Sources
                </Button>
                <Button
                  variant={selectedUtmTab === 1 ? "default" : "outline"}
                  onClick={() => setSelectedUtmTab(1)}
                >
                  Mediums
                </Button>
                <Button
                  variant={selectedUtmTab === 2 ? "default" : "outline"}
                  onClick={() => setSelectedUtmTab(2)}
                >
                  Campaigns
                </Button>
              </ButtonGroup>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* UTM Sources */}
              {selectedUtmTab === 0 &&
                (utmSourceData.length > 0 ? (
                  utmSourceData.map((source) => (
                    <div
                      key={source.source}
                      className="relative flex items-center justify-between overflow-hidden rounded-md px-3 py-2"
                    >
                      <div
                        className="bg-primary/10 absolute inset-0 transition-all duration-300"
                        style={{ width: `${source.percentage}%` }}
                      />
                      <span className="relative truncate text-sm font-medium">
                        {source.source}
                      </span>
                      <span className="text-muted-foreground relative ml-2 flex-shrink-0 text-sm">
                        {source.percentage}%
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground py-4 text-center text-sm">
                    No source data available
                  </p>
                ))}

              {/* UTM Mediums */}
              {selectedUtmTab === 1 &&
                (utmMediumData.length > 0 ? (
                  utmMediumData.map((medium) => (
                    <div
                      key={medium.medium}
                      className="relative flex items-center justify-between overflow-hidden rounded-md px-3 py-2"
                    >
                      <div
                        className="bg-primary/10 absolute inset-0 transition-all duration-300"
                        style={{ width: `${medium.percentage}%` }}
                      />
                      <span className="relative truncate text-sm font-medium">
                        {medium.medium}
                      </span>
                      <span className="text-muted-foreground relative ml-2 flex-shrink-0 text-sm">
                        {medium.percentage}%
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground py-4 text-center text-sm">
                    No medium data available
                  </p>
                ))}

              {/* UTM Campaigns */}
              {selectedUtmTab === 2 &&
                (utmCampaignData.length > 0 ? (
                  utmCampaignData.map((campaign) => (
                    <div
                      key={campaign.campaign}
                      className="relative flex items-center justify-between overflow-hidden rounded-md px-3 py-2"
                    >
                      <div
                        className="bg-primary/10 absolute inset-0 transition-all duration-300"
                        style={{ width: `${campaign.percentage}%` }}
                      />
                      <span className="relative truncate text-sm font-medium">
                        {campaign.campaign}
                      </span>
                      <span className="text-muted-foreground relative ml-2 flex-shrink-0 text-sm">
                        {campaign.percentage}%
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground py-4 text-center text-sm">
                    No campaign data available
                  </p>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Scroll Funnel / Read Depth */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-muted flex size-8 items-center justify-center rounded-sm border">
                <ScrollText className="size-4" />
              </div>
              <div>
                <CardTitle>Read Depth</CardTitle>
                <CardDescription>
                  How far visitors scroll through content
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* 25% milestone */}
              <div className="relative flex items-center justify-between overflow-hidden rounded-md px-3 py-2">
                <div
                  className="bg-primary/10 absolute inset-0 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, analytics.scrollFunnel?.percentages?.reached25 || 0)}%`,
                  }}
                />
                <span className="relative text-sm font-medium">
                  Reached 25%
                </span>
                <span className="text-muted-foreground relative text-sm">
                  {analytics.scrollFunnel?.percentages?.reached25 || 0}%
                </span>
              </div>

              {/* 50% milestone */}
              <div className="relative flex items-center justify-between overflow-hidden rounded-md px-3 py-2">
                <div
                  className="bg-primary/10 absolute inset-0 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, analytics.scrollFunnel?.percentages?.reached50 || 0)}%`,
                  }}
                />
                <span className="relative text-sm font-medium">
                  Reached 50%
                </span>
                <span className="text-muted-foreground relative text-sm">
                  {analytics.scrollFunnel?.percentages?.reached50 || 0}%
                </span>
              </div>

              {/* 75% milestone */}
              <div className="relative flex items-center justify-between overflow-hidden rounded-md px-3 py-2">
                <div
                  className="bg-primary/10 absolute inset-0 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, analytics.scrollFunnel?.percentages?.reached75 || 0)}%`,
                  }}
                />
                <span className="relative text-sm font-medium">
                  Reached 75%
                </span>
                <span className="text-muted-foreground relative text-sm">
                  {analytics.scrollFunnel?.percentages?.reached75 || 0}%
                </span>
              </div>

              {/* 90% milestone */}
              <div className="relative flex items-center justify-between overflow-hidden rounded-md px-3 py-2">
                <div
                  className="bg-primary/10 absolute inset-0 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, analytics.scrollFunnel?.percentages?.reached90 || 0)}%`,
                  }}
                />
                <span className="relative text-sm font-medium">
                  Reached 90%
                </span>
                <span className="text-muted-foreground relative text-sm">
                  {analytics.scrollFunnel?.percentages?.reached90 || 0}%
                </span>
              </div>

              <div className="text-muted-foreground pt-2 text-center text-xs">
                Average scroll depth: {analytics.summary?.avgScrollDepth || 0}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-muted flex size-8 items-center justify-center rounded-sm border">
              <Activity className="size-4" />
            </div>
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest page views and interactions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RecentActivityTable data={analytics.recentViews || []} />
        </CardContent>
      </Card>
    </div>
  );
};
