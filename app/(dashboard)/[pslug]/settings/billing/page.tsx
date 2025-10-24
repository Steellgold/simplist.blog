"use client"

import { PageLayout } from "@/components/layout/page-layout"
import { EmptyProject } from "@/components/projects/empty-project"
import { UpgradeProject } from "@/components/projects/upgrade-project"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { useProject } from "@/hooks/use-project-context"
import { ArrowUpRightIcon, FolderIcon } from "lucide-react"

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
