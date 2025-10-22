import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { getAllProjectAnalytics } from "@/lib/actions/analytics"
import { getCurrentUser } from "@/lib/auth-helper"
import { prisma } from "@/lib/db"
import { checkAnalyticsAccess } from "@/lib/subscription/quota-check"
import { redirect } from "next/navigation"

interface AnalyticsPageProps {
  params: Promise<{
    "project-slug": string
  }>
}

const AnalyticsPage = async ({ params }: AnalyticsPageProps) => {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user has access to analytics
  const hasAccess = await checkAnalyticsAccess(user.id)

  if (!hasAccess) {
    redirect("/pricing")
  }

  const resolvedParams = await params
  const projectSlug = resolvedParams["project-slug"]

  // Get project from slug
  const project = await prisma.project.findFirst({
    where: {
      slug: projectSlug,
      userId: user.id,
    },
  })

  if (!project) {
    redirect("/dashboard")
  }

  // Get analytics data
  const analyticsData = await getAllProjectAnalytics(project.id)

  // Check if there's any meaningful data
  // TODO: Add a integration section guide
  // const hasData = analyticsData["7"]?.summary?.totalViews > 0 || 
  //                 analyticsData["30"]?.summary?.totalViews > 0 || 
  //                 analyticsData["90"]?.summary?.totalViews > 0

  return <AnalyticsDashboard analyticsData={analyticsData} />
}

export default AnalyticsPage
