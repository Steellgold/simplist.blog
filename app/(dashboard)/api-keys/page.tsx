"use client"

import { ApiKeysList } from "@/components/api-keys-list"
import { CreateApiKeyForm } from "@/components/create-api-key-form"
import { PageHeader } from "@/components/page-header"
import { useApiKeys } from "@/hooks/use-api-keys"
import ApiKeysLoading from "./loading"

const ApiKeysPage = () => {
  const { data, isLoading, error } = useApiKeys()
  if (isLoading) return <ApiKeysLoading />

  if (error) {
    return (
      <PageHeader 
        title="API Keys"
        description="Failed to load API keys. Please try again."
      />
    )
  }

  const { apiKeys, projectId } = data || { apiKeys: [], projectId: null }

  if (!projectId) {
    return (
      <PageHeader 
        title="API Keys"
        description="You need to create a project first to manage API keys."
      />
    )
  }

  return (
    <PageHeader 
      title="API Keys"
      description="Manage API keys for your project to access your data programmatically."
      actions={<CreateApiKeyForm projectId={projectId} />}
    >
      <ApiKeysList apiKeys={apiKeys} />
    </PageHeader>
  )
}

export default ApiKeysPage
