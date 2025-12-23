import { ApiKeysClientPage } from "@/components/api-keys/api-keys-client-page";
import { getProjectApiKeys } from "@/lib/actions/api-keys";
import { getCurrentUser } from "@/lib/auth-helper";
import { getUserProjectMembership } from "@/lib/auth/permissions";
import { prisma } from "@simplist/db";
import { redirect } from "next/navigation";

const ApiKeysPage = async ({
  params,
}: {
  params: Promise<{ "project-slug": string }>;
}) => {
  const resolvedParams = await params;
  const user = await getCurrentUser();

  if (!user) redirect("/auth/login");

  // Get project by slug
  const project = await prisma.project.findUnique({
    where: {
      slug: resolvedParams["project-slug"],
    },
  });

  if (!project) redirect("/create-project");

  // Verify user has access to this project (either as owner or member)
  const membership = await getUserProjectMembership(project.id, user.id);
  if (!membership) redirect("/create-project");

  // Load API keys
  const apiKeys = await getProjectApiKeys(project.id);

  return (
    <ApiKeysClientPage
      apiKeys={apiKeys}
      project={{
        id: project.id,
        name: project.name,
        slug: project.slug,
      }}
    />
  );
};

export default ApiKeysPage;
