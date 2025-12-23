import { PageLayout } from "@/components/layout/page-layout";
import { Skeleton } from "@simplist/ui/components/skeleton";

const MediaLoading = () => {
  return (
    <PageLayout
      title="Media"
      description="Manage your project's media library."
      actions={<Skeleton className="h-9 w-28" />}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <Skeleton className="h-10 w-full sm:max-w-sm" />
          <Skeleton className="h-10 w-20" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <Skeleton className="h-4 w-24" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default MediaLoading;
