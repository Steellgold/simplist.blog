"use client"

import { ApiKeysList } from "@/components/api-keys/list"
import { CreateApiKeyForm } from "@/components/api-keys/create-form"
import { PageLayout } from "@/components/layout/page-layout"
import { useApiKeys } from "@/hooks/use-api-keys"
import { useProject } from "@/hooks/use-project-context"
import { EmptyProject } from "@/components/projects/empty-project"

const ApiKeysPage = () => {
  const { currentProject } = useProject()
  const { data, error } = useApiKeys()

  if (!currentProject) return <EmptyProject />
  if (error) return <PageLayout title="API Keys" description="Failed to load API keys. Please try again." />

  const apiKeys = data?.apiKeys || []

  return (
    // <div className="container max-w-7xl mx-auto">
      <PageLayout
        title="API Keys"
        description={`Manage API keys for your ${currentProject.name} project`}
        actions={<CreateApiKeyForm projectId={currentProject.id} />}
      >
        <ApiKeysList apiKeys={apiKeys} />
      </PageLayout>
    // </div>
  )
}

export default ApiKeysPage
