"use client"

import { PageLayout } from "@/components/layout/page-layout"
import { EmptyProject } from "@/components/projects/empty-project"
import { useProject } from "@/hooks/use-project-context"

const BillingPage = () => {
  const { currentProject } = useProject()

  if (!currentProject) return <EmptyProject />

  return (
    <PageLayout
      title="Billing"
      description={`Manage settings for your ${currentProject.name} project`}
    >

    </PageLayout>
  )
}

export default BillingPage
