"use client"

import { PageLayout } from "@/components/layout/page-layout"
import { EmptyProject } from "@/components/projects/empty-project"
import { useProject } from "@/hooks/use-project-context"

const SettingsPage = () => {
  const { currentProject } = useProject()

  if (!currentProject) return <EmptyProject />

  return (
    // <div className="container max-w-7xl mx-auto">
      <PageLayout
        title="Settings"
        description={`Manage settings for your ${currentProject.name} project`}
      />
    // </div>
  )
}

export default SettingsPage
