import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader } from "@simplist/ui/components/card";
import { Skeleton } from "@simplist/ui/components/skeleton";

const WebhookDetailsLoading = () => {
  return (
    <PageLayout
      title="Webhook Details"
      description="View webhook configuration and delivery history."
      centered="md"
      actions={
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="mb-2 h-4 w-16" />
                <Skeleton className="h-6 w-full" />
              </div>
              <div>
                <Skeleton className="mb-2 h-4 w-12" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>

            <div>
              <Skeleton className="mb-2 h-4 w-12" />
              <Skeleton className="h-6 w-full" />
            </div>

            <div>
              <Skeleton className="mb-2 h-4 w-16" />
              <div className="flex gap-1">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-18 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-48" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2 text-center">
                  <Skeleton className="mx-auto h-8 w-16" />
                  <Skeleton className="mx-auto h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>

                  <div className="space-y-1 text-right">
                    <Skeleton className="h-4 w-20" />
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

export default WebhookDetailsLoading;
