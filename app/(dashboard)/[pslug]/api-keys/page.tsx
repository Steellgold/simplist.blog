import { ApiKeysClientPage } from "@/components/api-keys/api-keys-client-page"
import { getProjectApiKeys } from "@/lib/actions/api-keys"
import { getCurrentUser } from "@/lib/auth-helper"
import { prisma } from "@simplist/db"
import { redirect } from "next/navigation"

const ApiKeysPage = async ({ params }: { params: Promise<{ pslug: string }> }) => {
  const resolvedParams = await params
  const user = await getCurrentUser()

  if (!user) redirect("/auth/login")

  // Get user's project
  const project = await prisma.project.findFirst({
    where: {
      userId: user.id,
      slug: resolvedParams.pslug,
    },
    
  })

  if (!project) redirect("/create-project")

  // Load API keys
  const apiKeys = await getProjectApiKeys(project.id)

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
