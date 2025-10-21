import { AnalyticsActivation } from "@/components/analytics-activation"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { AnalyticsIntegrationGuide } from "@/components/analytics-integration-guide"
import { PageHeader } from "@/components/page-header"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllProjectAnalytics } from "@/lib/actions/analytics"
import { getProjectApiKeys } from "@/lib/actions/api-keys"
import { getUserProjects } from "@/lib/actions/projects"
import { getCurrentUser } from "@/lib/auth-helper"
import { checkAnalyticsAccess } from "@/lib/subscription/quota-check"
import { Crown } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { SearchParams } from "nuqs"
import { createLoader, parseAsString } from "nuqs/server"

// Describe your search params, and reuse this in useQueryStates / createSerializer:
export const analyticsSearchParams = {
  articles: parseAsString.withDefault("")
}

export const loadSearchParams = createLoader(analyticsSearchParams)

type PageProps = {
  searchParams: Promise<SearchParams>
}

const AnalyticsPage = async ({ searchParams }: PageProps) => {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const projects = await getUserProjects()
  const project = projects[0] // Single project per user

  if (!project) {
    redirect("/create-project")
  }

  // Check if user has access to analytics (Pro feature)
  const hasAnalyticsAccess = await checkAnalyticsAccess(user.id);
  if (!hasAnalyticsAccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="max-w-2xl w-full p-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics is a Pro Feature</CardTitle>
              <CardDescription>
                Unlock advanced analytics to track your blog performance with detailed metrics including:
              </CardDescription>
            </CardHeader>

            <CardContent>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Real-time page views and unique visitors</li>
                <li>Engagement metrics (time on page, scroll depth)</li>
                <li>Geographic distribution and device stats</li>
                <li>Traffic sources and referrers</li>
                <li>Article performance comparison</li>
              </ul>
            </CardContent>

            <CardFooter className="flex justify-end">
              <Link className={buttonVariants({ size: "sm" })} href={"/settings/billing"}>
                <Crown />
                Upgrade to Pro
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  // Check if analytics is enabled
  if (!project.analyticsEnabled) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <AnalyticsActivation projectId={project.id} />
      </div>
    )
  }

  // Get the analytics public key
  const apiKeys = await getProjectApiKeys(project.id)
  const analyticsKey = apiKeys.find(key => key.type === "public" && key.permissions.includes("analytics"))

  // Parse optional article filters from query
  const { articles } = await loadSearchParams(searchParams)

  // Load all periods at once
  const analyticsData = await getAllProjectAnalytics(project.id, articles ? articles.split(",") : undefined)
  
  // Check if we have analytics data (using 7 days as reference)
  const hasAnalyticsData = analyticsData["7"]?.summary.totalViews > 0

  return (
    <PageHeader
      title="Analytics"
      description="Track visitor behavior and engagement for your articles"
    >
      <div className="space-y-6">
        {analyticsKey && (
          <AnalyticsIntegrationGuide 
            apiKey={analyticsKey.key} 
            showSuccessCard={false} 
            hasData={hasAnalyticsData}
          />
        )}

        <AnalyticsDashboard analyticsData={analyticsData} />
      </div>
    </PageHeader>
  )
}

export default AnalyticsPage