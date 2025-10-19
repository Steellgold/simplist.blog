import { AnalyticsDashboard } from '@/components/analytics-dashboard-new'
import { PageHeader } from '@/components/page-header'
import { getAllProjectAnalytics } from '@/lib/actions/analytics'
import { getUserProjects } from '@/lib/actions/projects'
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

  // Parse optional article filters from query
  const { articles } = await loadSearchParams(searchParams)

  // Load all periods at once
  const analyticsData = await getAllProjectAnalytics(project.id, articles ? articles.split(',') : undefined)

  return (
    <div className="container max-w-7xl mx-auto">
      <PageHeader
        title="Analytics"
        description="Track visitor behavior and engagement for your articles"
      >
        <AnalyticsDashboard 
          analyticsData={analyticsData}
        />
      </PageHeader>
    </div>
  )
}

export default AnalyticsPage