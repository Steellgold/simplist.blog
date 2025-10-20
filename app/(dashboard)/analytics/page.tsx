import { AnalyticsDashboard } from '@/components/analytics-dashboard-new'
import { AnalyticsActivation } from '@/components/analytics-activation'
import { AnalyticsIntegrationGuide } from '@/components/analytics-integration-guide'
import { PageHeader } from '@/components/page-header'
import { getAllProjectAnalytics } from '@/lib/actions/analytics'
import { getUserProjects } from '@/lib/actions/projects'
import { getProjectApiKeys } from '@/lib/actions/api-keys'
import { getCurrentUser } from '@/lib/auth-helper'
import { redirect } from 'next/navigation'
import { SearchParams } from 'nuqs'
import { createLoader, parseAsString } from 'nuqs/server'

// Describe your search params, and reuse this in useQueryStates / createSerializer:
export const analyticsSearchParams = {
  articles: parseAsString.withDefault('')
}

export const loadSearchParams = createLoader(analyticsSearchParams)

type PageProps = {
  searchParams: Promise<SearchParams>
}

const AnalyticsPage = async ({ searchParams }: PageProps) => {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const projects = await getUserProjects()
  const project = projects[0] // Single project per user

  if (!project) {
    redirect('/create-project')
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
  const analyticsKey = apiKeys.find(key => key.type === 'public' && key.permissions.includes('analytics'))

  // Parse optional article filters from query
  const { articles } = await loadSearchParams(searchParams)

  // Load all periods at once
  const analyticsData = await getAllProjectAnalytics(project.id, articles ? articles.split(',') : undefined)

  return (
    <PageHeader
      title="Analytics"
      description="Track visitor behavior and engagement for your articles"
    >
      <div className="space-y-6">
        {analyticsKey && (
          <AnalyticsIntegrationGuide apiKey={analyticsKey.key} />
        )}

        <AnalyticsDashboard
          analyticsData={analyticsData}
        />
      </div>
    </PageHeader>
  )
}

export default AnalyticsPage