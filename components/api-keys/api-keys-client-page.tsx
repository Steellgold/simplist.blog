"use client"

import { CreateApiKeyForm } from "@/components/api-keys/create-form"
import { ApiKeysList } from "@/components/api-keys/list"
import { PageLayout } from "@/components/layout/page-layout"
import type { ApiKey } from "@simplist/db/types"

type ApiKeySelect = Pick<
  ApiKey,
  "id" | "name" | "key" | "type" | "permissions" | "lastUsedAt" | "expiresAt" | "status" | "createdAt"
>

type ApiKeysClientPageProps = {
  apiKeys: ApiKeySelect[]
  project: {
    id: string
    name: string
    slug: string
  }
}

export const ApiKeysClientPage = ({ apiKeys, project }: ApiKeysClientPageProps) => {
  return (
    <PageLayout
      title="API Keys"
      description={`Manage API keys for your ${project.name} project`}
      actions={<CreateApiKeyForm projectId={project.id} />}
    >
      <ApiKeysList apiKeys={apiKeys} />
    </PageLayout>
  )
}
