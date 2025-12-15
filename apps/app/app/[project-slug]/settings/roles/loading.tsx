import { PageLayout } from "@/components/layout/page-layout"
import { Card, CardContent, CardHeader } from "@simplist/ui/components/card"
import { Skeleton } from "@simplist/ui/components/skeleton"

const RolesLoading = () => {
  return (
    <PageLayout
      title="Roles"
      description="Manage custom roles and permissions for your team."
      centered
      actions={<Skeleton className="h-9 w-28" />}
    >
      <div className="space-y-4">
        {/* Liste compacte des rôles */}
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    {/* Gauche: Nom + Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-16 rounded-sm" />
                        </div>
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>

                    {/* Droite: Actions */}
                    <Skeleton className="h-8 w-8 shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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