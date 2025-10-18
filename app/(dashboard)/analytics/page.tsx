import { AnalyticsDashboard } from '@/components/analytics-dashboard'
import { getProjectAnalytics } from '@/lib/actions/analytics'
import { getUserProjects } from '@/lib/actions/projects'
import { getCurrentUser } from '@/lib/auth-helper'
import { redirect } from 'next/navigation'

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ days: string }>;
}) {
  const { days } = await params;
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const projects = await getUserProjects()
  const project = projects[0] // Single project per user

  if (!project) {
    redirect('/create-project')
  }

  const analytics = await getProjectAnalytics(project.id, parseInt(days) || 30)

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
        selectedDays={parseInt(days) || 30}
      />
    </div>
  )
}