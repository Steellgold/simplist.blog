import { PageLayout } from "@/components/layout/page-layout";
import { Skeleton } from "@simplist/ui/components/skeleton";

const WebhooksLoading = () => {
  return (
    <PageLayout
      title="Webhooks"
      description="Receive notifications when articles are published, scheduled, updated, or deleted."
      actions={<Skeleton className="h-9 w-32" />}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-80" />
        </div>

        <div className="rounded-md border">
          <div className="border-b">
            <div className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="ml-auto h-5 w-16" />
            </div>
          </div>

          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-b last:border-b-0">
              <div className="flex items-center gap-4 px-4 py-4">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-48" />
                <div className="flex gap-1">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="ml-auto h-8 w-8" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default WebhooksLoading;
