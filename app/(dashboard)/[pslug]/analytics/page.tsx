import { AnalyticsDashboard } from "@/components/analytics/dashboard"
import { PageLayout } from "@/components/layout/page-layout"
import { EmptyProject } from "@/components/projects/empty-project"
import { getAllProjectAnalytics } from "@/lib/actions/analytics"
import { getCurrentUser } from "@/lib/auth-helper"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { getProjectSubscription } from "@/lib/subscription/quota-check"

interface AnalyticsPageProps {
  params: Promise<{
    pslug: string
  }>
}

const AnalyticsPage = async ({ params }: AnalyticsPageProps) => {
  const user = await getCurrentUser()
  const { pslug: slug } = await params

  if (!user) redirect("/auth/login");

  // Get project from slug
  const project = await prisma.project.findFirst({
    where: { slug, userId: user.id },
    cacheStrategy: { ttl: 60, swr: 300 },
  })
  if (!project) return <EmptyProject />

  // Check subscription tier - Analytics is PRO only
  const subscription = await getProjectSubscription(project.id)
  if (subscription.tier !== "PRO") {
    redirect(`/${slug}/settings/billing`)
  }

  // Get analytics data
  const analyticsData = await getAllProjectAnalytics(project.id)

  return (
    <PageLayout title="Analytics" description="Track visitor behavior and engagement for your articles">
      <AnalyticsDashboard analyticsData={analyticsData} />
    </PageLayout>
  )
}

export default AnalyticsPage
