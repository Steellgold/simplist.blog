import { PageLayout } from "@/components/layout/page-layout";
import { Skeleton } from "@simplist/ui/components/skeleton";

const TagsLoading = () => {
  return (
    <PageLayout
      title="Tags"
      description="Manage tags to organize and categorize your articles."
      actions={<Skeleton className="h-9 w-28" />}
    >
      <div className="space-y-4">
        {/* Search bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <Skeleton className="h-10 w-full sm:max-w-sm" />
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            {/* Header */}
            <div className="border-b p-4 flex items-center gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-8" />
            </div>

            {/* Rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border-b p-4 flex items-center gap-4">
                {/* Tag badge */}
                <Skeleton className="h-7 w-24 rounded" />
                {/* Slug */}
                <Skeleton className="h-5 w-20" />
                {/* Description */}
                <Skeleton className="h-4 w-32" />
                {/* Articles count */}
                <Skeleton className="h-6 w-20 rounded-full" />
                {/* Updated date */}
                <Skeleton className="h-4 w-24" />
                {/* Actions */}
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
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

export default TagsLoading;
