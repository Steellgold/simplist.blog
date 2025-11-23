import { PageLayout } from "@/components/layout/page-layout"
import { Card, CardContent } from "@simplist/ui/components/card"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSeparator, FieldSet, FieldTitle } from "@simplist/ui/components/field"
import { Skeleton } from "@simplist/ui/components/skeleton"

const BillingLoadingSkeleton = () => {
  return (
    <PageLayout
      title="Billing"
      description="Manage billing and subscription"
      centered="sm"
    >
      {/* Current Plan Card Skeleton */}
      <Card>
        <CardContent>
          <FieldSet>
            <FieldGroup>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldTitle>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-5 w-20" />
                  </FieldTitle>
                  <FieldDescription>
                    <span className="inline-block h-4 w-64 bg-accent animate-pulse rounded-md" />
                  </FieldDescription>
                </FieldContent>
                <Skeleton className="h-9 w-32" />
              </Field>

              <FieldSeparator />

              <Field orientation="vertical">
                <FieldContent>
                  <FieldLabel>
                    <Skeleton className="h-4 w-16" />
                  </FieldLabel>
                </FieldContent>

                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                      <Skeleton className="size-3 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              </Field>
            </FieldGroup>
          </FieldSet>
        </CardContent>
      </Card>

      {/* Invoices Card Skeleton */}
      <Card>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-80" />
            </div>

            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4">
              <Skeleton className="h-4 w-40" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  )
}

export default BillingLoadingSkeleton
