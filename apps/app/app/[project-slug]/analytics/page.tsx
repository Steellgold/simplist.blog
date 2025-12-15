import { AnalyticsDashboard } from "@/components/analytics/dashboard"
import { PageLayout } from "@/components/layout/page-layout"
import { EmptyProject } from "@/components/projects/empty-project"
import { getAllProjectAnalytics } from "@/lib/actions/analytics"
import { getCurrentUser } from "@/lib/auth-helper"
import { getUserProjectMembership } from "@/lib/auth/permissions"
import { getProjectSubscription } from "@/lib/subscription/quota-check"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@simplist/ui/components/empty"
import { prisma } from "@simplist/db"
import { BarChart3 } from "lucide-react"
import { redirect } from "next/navigation"

interface AnalyticsPageProps {
  params: Promise<{
    "project-slug": string
  }>
}

const AnalyticsPage = async ({ params }: AnalyticsPageProps) => {
  const user = await getCurrentUser()
  const { "project-slug": slug } = await params

  if (!user) redirect("/auth/login");

  // Get project from slug
  const project = await prisma.project.findUnique({
    where: { slug },
  })
  if (!project) return <EmptyProject />

  // Verify user has access to this project (either as owner or member)
  const membership = await getUserProjectMembership(project.id, user.id);
  if (!membership) return <EmptyProject />

  // Check subscription tier - Analytics is PRO only
  const subscription = await getProjectSubscription(project.id)
  if (subscription.tier !== "PRO") {
    redirect(`/${slug}/settings/billing`)
  }

  // Get analytics data
  const analyticsData = await getAllProjectAnalytics(project.id)

  // Check if there's any data at all (check for 7 days period by default)
  const analytics7Days = analyticsData["7"]
  const hasNoData = analytics7Days.summary.totalViews === 0 &&
                    (!analytics7Days.topArticles || analytics7Days.topArticles.length === 0)

  // Show empty state if no data (without PageLayout)
  if (hasNoData) {
    return (
      <Empty className="flex min-h-[calc(90vh-4rem)] items-center justify-center h-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BarChart3 />
          </EmptyMedia>
          <EmptyTitle>No analytics data yet</EmptyTitle>
          <EmptyDescription>
            Start tracking analytics by implementing the SDK in your application. Data will appear here once visitors start viewing your articles.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <PageLayout title="Analytics" description="Track visitor behavior and engagement for your articles">
      <AnalyticsDashboard analyticsData={analyticsData} />
    </PageLayout>
  )
}

export default AnalyticsPage
