import { ApiKeysList } from "@/components/api-keys-list"
import { CreateApiKeyForm } from "@/components/create-api-key-form"
import { getProjectApiKeys } from "@/lib/actions/api-keys"
import { getUserProjects } from "@/lib/actions/projects"

const ApiKeysPage = async () => {
  const projects = await getUserProjects()
  const project = projects[0]

  if (!project) {
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

  const apiKeys = await getProjectApiKeys(project.id)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground">
            Manage API keys for your project to access your data programmatically.
          </p>
        </div>

        <CreateApiKeyForm projectId={project.id} />
      </div>

      <ApiKeysList apiKeys={apiKeys} />
    </div>
  )
}

export default ApiKeysPage
