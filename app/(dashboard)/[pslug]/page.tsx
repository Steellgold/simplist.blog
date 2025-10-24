"use client"

import { PageLayout } from "@/components/layout/page-layout"
import { EmptyProject } from "@/components/projects/empty-project"
import { useProject } from "@/hooks/use-project-context"

const ProjectPage = () => {
  const { currentProject } = useProject()
  if (!currentProject) return <EmptyProject />

  return (
    <PageLayout
      title="Dashboard"
      description={`Welcome to your ${currentProject.name} blog management dashboard`}
    />
  )
}

export default ProjectPage
