"use client"

import { ApiKeysList } from "@/components/api-keys/list"
import { CreateApiKeyForm } from "@/components/api-keys/create-form"
import { PageHeader } from "@/components/layout/page-header"
import { useApiKeys } from "@/hooks/use-api-keys"
import { useProject } from "@/hooks/use-project-context"

const ApiKeysPage = () => {
  const { currentProject } = useProject()
  const { data, error } = useApiKeys()

  if (!currentProject) {
    return (
      <div className="container max-w-7xl mx-auto">
        <PageHeader
          title="API Keys"
          description="No project selected"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto">
        <PageHeader
          title="API Keys"
          description="Failed to load API keys. Please try again."
        />
      </div>
    )
  }

  const apiKeys = data?.apiKeys || []

  return (
    <div className="container max-w-7xl mx-auto">
      <PageHeader
        title="API Keys"
        description={`Manage API keys for your ${currentProject.name} project`}
        actions={<CreateApiKeyForm projectId={currentProject.id} />}
      >
        <ApiKeysList apiKeys={apiKeys} />
      </PageHeader>
    </div>
  )
}

export default ApiKeysPage
