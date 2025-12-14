import { PageLayout } from "@/components/layout/page-layout"
import { Button, buttonVariants } from "@simplist/ui/components/button"
import { ButtonGroup } from "@simplist/ui/components/button-group"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@simplist/ui/components/card"
import { Skeleton } from "@simplist/ui/components/skeleton"
import { ChevronLeft, MoreVertical } from "lucide-react"
import Link from "next/link"
import { FC } from "react"

type Props = {
  projectSlug: string
}

const StatCardSkeleton = () => (
  <Card>
    <CardHeader className="-mb-6">
      <CardTitle className="text-sm font-medium">
        <Skeleton className="h-4 w-16" />
      </CardTitle>
      <CardAction>
        <Skeleton className="h-4 w-4" />
      </CardAction>
    </CardHeader>

    <CardContent>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-3 w-24" />
    </CardContent>
  </Card>
)

const DeliveryItemSkeleton = () => (
  <div className="py-4">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
)

export const WebhookDashboardLoading: FC<Props> = ({ projectSlug }) => {
  return (
    <PageLayout
      title="Webhook Details"
      description="View webhook configuration and delivery history."
      actions={
        <div className="flex items-center gap-2">
          <Link
            href={`/${projectSlug}/webhooks`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <ChevronLeft />
            Back to webhooks
          </Link>
          <Button variant="outline" size="sm" disabled>
            <MoreVertical />
          </Button>
        </div>
      }
    >
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Configuration Overview Skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Webhook URL</p>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Events</p>
              <div className="flex flex-wrap gap-1">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-18" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Secret</p>
              <Skeleton className="h-4 w-24" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Custom Headers</p>
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Custom Payload</p>
            <Skeleton className="h-4 w-32" />
          </div>
        </CardContent>
      </Card>

      {/* Recent Deliveries Skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
          <CardAction>
            <ButtonGroup>
              <Button variant="outline" size="sm" disabled>
                <Skeleton className="h-4 w-4 mr-2" />
                <Skeleton className="h-4 w-16" />
              </Button>
            </ButtonGroup>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="divide-y">
              <DeliveryItemSkeleton />
              <DeliveryItemSkeleton />
              <DeliveryItemSkeleton />
              <DeliveryItemSkeleton />
              <DeliveryItemSkeleton />
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  )
}