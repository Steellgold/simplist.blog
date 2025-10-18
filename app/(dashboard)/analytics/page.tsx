import { getCurrentUser } from '@/lib/auth-helper'
import { getUserProjects } from '@/lib/actions/projects'
import { getProjectAnalytics } from '@/lib/actions/analytics'
import { AnalyticsDashboard } from '@/components/analytics-dashboard'
import { redirect } from 'next/navigation'

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { days?: string }
}) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const projects = await getUserProjects()
  const project = projects[0] // Single project per user

  if (!project) {
    redirect('/create-project')
  }

  const days = searchParams.days ? parseInt(searchParams.days) : 30
  const analytics = await getProjectAnalytics(project.id, days)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Track visitor behavior and engagement for your articles
        </p>
      </div>

      <AnalyticsDashboard 
        project={project} 
        analytics={analytics} 
        selectedDays={days}
      />
    </div>
  )
}