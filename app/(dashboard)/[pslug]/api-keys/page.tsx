import { ApiKeysClientPage } from "@/components/api-keys/api-keys-client-page"
import { getCachedProjectApiKeys } from "@/lib/cache/api-keys"
import { getProjectWithStats } from "@/lib/cache/layout-data"
import { redirect } from "next/navigation"

const ApiKeysPage = async ({ params }: { params: Promise<{ pslug: string }> }) => {
  const resolvedParams = await params

  // Get cached project data
  const project = await getProjectWithStats(resolvedParams.pslug)
  if (!project) redirect("/create-project")

  // Load API keys using cached function
  const apiKeys = await getCachedProjectApiKeys(project.id)

  return (
    <ApiKeysClientPage
      apiKeys={apiKeys}
      project={{
        id: project.id,
        name: project.name,
        slug: project.slug,
      }}
    />
  )
}

export default ApiKeysPage
