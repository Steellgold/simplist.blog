import { PageLayout } from "@/components/layout/page-layout"
import { Skeleton } from "@simplist/ui/components/skeleton"

const ArticlesLoading = () => {
  return (
    <PageLayout
      title="Articles"
      description="Manage your blog articles and track their performance."
      actions={
        <Skeleton className="h-9 w-40" />
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <Skeleton className="h-10 w-full sm:max-w-sm" />
        </div>

        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <div className="border-b p-4 flex items-center gap-4">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-32 flex-1" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-10" />
            </div>

            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border-b p-4 flex items-center gap-4">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-16 w-24 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

export default ArticlesLoading
