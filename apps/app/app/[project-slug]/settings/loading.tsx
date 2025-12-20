import { PageLayout } from "@/components/layout/page-layout";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@simplist/ui/components/card";
import { Skeleton } from "@simplist/ui/components/skeleton";

const SettingsLoading = () => {
  return (
    <PageLayout
      title="Settings"
      description="Manage your project settings and configuration."
      centered="md"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-6">
              <Skeleton className="size-20 rounded-lg" />
              <div className="flex-1 space-y-4">
                <div>
                  <Skeleton className="mb-2 h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="mb-2 h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="mb-2 h-4 w-12" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="mb-2 h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="mb-2 h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="mb-2 h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div>
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-24" />
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="space-y-2">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-4 w-80" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="mb-2 h-4 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-10" />
                </div>
              </div>
            ))}
            <Skeleton className="h-9 w-32" />
          </CardContent>
        </Card>

        <Card className="border-destructive/20">
          <CardHeader>
            <div className="space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-64" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-9 w-32" />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default SettingsLoading;
