"use client"

import { PageHeader } from "@/components/page-header"
import { useProject } from "@/hooks/use-project-context"

const ProjectPage = () => {
  const { currentProject } = useProject()

  if (!currentProject) {
    return (
      <PageHeader title="Dashboard" description="No project selected" />
    )
  }

  return (
    <PageHeader
      title="Dashboard"
      description={`Welcome to your ${currentProject.name} blog management dashboard`}
    />
  )
}

export default ProjectPage
