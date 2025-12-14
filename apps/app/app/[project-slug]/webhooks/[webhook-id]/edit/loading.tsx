import { PageLayout } from "@/components/layout/page-layout"
import { Skeleton } from "@simplist/ui/components/skeleton"

const EditWebhookLoading = async () => {
  return (
    <PageLayout
      title="Edit webhook"
      description="Update the configuration for the webhook."
      centered="md"
      actions={
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      }
    >
      <form className="space-y-3">
        <div className="space-y-4 border rounded-lg p-4">
          <Skeleton className="h-6 w-24" />
          <div className="space-y-3">
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div>
              <Skeleton className="h-4 w-12 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>

            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 border rounded-lg p-4">
          <Skeleton className="h-6 w-20" />

          <div className="space-y-3">
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>

        <div className="space-y-4 border rounded-lg p-4">
          <Skeleton className="h-6 w-20" />

          <div className="space-y-3">
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </form>
    </PageLayout>
  )
}

export default EditWebhookLoading