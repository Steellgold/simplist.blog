import { PageLayout } from "@/components/layout/page-layout";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@simplist/ui/components/card";
import { Skeleton } from "@simplist/ui/components/skeleton";

const AnalyticsLoading = () => {
  return (
    <PageLayout
      title="Analytics"
      description="Track visitor behavior and engagement for your articles"
    >
      <div className="container mx-auto max-w-7xl space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="-mb-6">
                <CardTitle>
                  <Skeleton className="h-4 w-20" />
                </CardTitle>
                <CardAction>
                  <Skeleton className="h-4 w-4 rounded" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-1 h-8 w-16" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Traffic Overview Chart Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  <Skeleton className="h-6 w-40" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-64" />
                </CardDescription>
              </div>
              <div className="flex items-center gap-1 rounded-md border p-1">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-8 w-14" />
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Chart Area */}
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Left Column - Top Articles & Referrers */}
          <div className="flex flex-col gap-4">
            {/* Popular Articles */}
            <Card className="flex flex-1 flex-col">
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-32" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-36" />
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <div className="space-y-1 text-right">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-3 w-8" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Referrers */}
            <Card className="flex flex-1 flex-col">
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-28" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-24" />
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-md px-3 py-2"
                    >
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-4 w-8" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Devices & Geographic Data */}
          <div className="flex flex-col gap-4">
            {/* Devices */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-24" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-40" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  {/* Chart skeleton */}
                  <Skeleton className="h-60 w-full" />
                  {/* Device list */}
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-3 w-3 rounded-full" />
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-4 w-8" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Geographic Data */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      <Skeleton className="h-6 w-32" />
                    </CardTitle>
                    <CardDescription>
                      <Skeleton className="h-4 w-48" />
                    </CardDescription>
                  </div>
                  {/* Tab buttons skeleton */}
                  <div className="flex items-center gap-1 rounded-md border p-1">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-8 w-14" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-md px-3 py-2"
                    >
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-4 w-8" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-32" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-48" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default AnalyticsLoading;
