import { PageLayout } from "@/components/layout/page-layout";
import { Skeleton } from "@simplist/ui/components/skeleton";

const ApiKeysLoading = () => {
  return (
    <PageLayout
      title="API Keys"
      description="Manage API keys for your project"
      actions={<Skeleton className="h-10 w-40" />}
    >
      <div className="space-y-4">
        <Skeleton className="h-10 w-80" />

        <div className="rounded-md border">
          <div className="border-b">
            <div className="flex items-center gap-4 p-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="ml-auto h-5 w-20" />
            </div>
          </div>

          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b p-4 last:border-b-0"
            >
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="ml-auto h-8 w-8" />
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default ApiKeysLoading;
