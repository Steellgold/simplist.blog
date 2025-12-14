import { PageLayout } from "@/components/layout/page-layout"
import { Card, CardContent, CardFooter, CardHeader } from "@simplist/ui/components/card"
import { Skeleton } from "@simplist/ui/components/skeleton"

const RolesLoading = () => {
  return (
    <PageLayout
      title="Roles"
      description="Manage custom roles and permissions for your team."
      actions={<Skeleton className="h-9 w-28" />}
    >
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-4" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <div className="flex items-center justify-between w-full">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>

                  <div className="pl-4 space-y-2">
                    {Array.from({ length: 2 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <Skeleton className="size-6 rounded-full" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}

export default RolesLoading