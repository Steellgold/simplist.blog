"use client"

import { ApiKeysList } from "@/components/api-keys-list"
import { CreateApiKeyForm } from "@/components/create-api-key-form"
import { Spinner } from "@/components/ui/spinner"
import { useApiKeys } from "@/hooks/use-api-keys"

const ApiKeysPage = () => {
  const { data, isLoading, error } = useApiKeys()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground">
            Failed to load API keys. Please try again.
          </p>
        </div>
      </div>
    )
  }

  const { apiKeys, projectId } = data || { apiKeys: [], projectId: null }

  if (!projectId) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground">
            You need to create a project first to manage API keys.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground">
            Manage API keys for your project to access your data programmatically.
          </p>
        </div>

        <CreateApiKeyForm projectId={projectId} />
      </div>

      <ApiKeysList apiKeys={apiKeys} />
    </div>
  )
}

export default ApiKeysPage
