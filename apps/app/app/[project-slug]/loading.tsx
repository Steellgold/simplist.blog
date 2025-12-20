import { Skeleton } from "@simplist/ui/components/skeleton";

const DashboardLoading = () => {
  return (
    <div className="container mx-auto max-w-7xl space-y-6">
      {/* Header section */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Stats Grid - 4 cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2 rounded-lg border p-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>

      {/* Recent Articles & Analytics Preview - 2 columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Articles Card */}
        <div className="rounded-lg border">
          <div className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-9 w-24" />
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics Preview Card */}
        <div className="rounded-lg border">
          <div className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-9 w-32" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-7 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Subscription - 2 columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions Card */}
        <div className="rounded-lg border">
          <div className="space-y-4 p-6">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Subscription Card */}
        <div className="rounded-lg border">
          <div className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLoading;
