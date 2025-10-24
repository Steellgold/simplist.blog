"use client"

import { PageLayout } from "@/components/layout/page-layout"
import { useProject } from "@/hooks/use-project-context"

const SettingsPage = () => {
  const { currentProject } = useProject()

  if (!currentProject) {
    return (
      <div className="container max-w-7xl mx-auto">
        <PageLayout
          title="Settings"
          description="No project selected"
        />
      </div>
    )
  }

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
