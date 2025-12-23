import { RolesClientPage } from "@/components/roles/roles-client-page";
import { getCurrentUser } from "@/lib/auth-helper";
import { getUserProjectMembership } from "@/lib/auth/permissions";
import { getProjectRoles } from "@/lib/actions/roles";
import { prisma } from "@simplist/db";
import { redirect } from "next/navigation";

const RolesPage = async ({
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

  // Fetch roles (getProjectRoles already checks permissions internally)
  const roles = await getProjectRoles(project.id);

  return (
    <RolesClientPage
      project={{
        id: project.id,
        name: project.name,
        slug: project.slug,
        subscriptionTier: project.subscriptionTier,
        subscriptionExpiresAt: project.subscriptionExpiresAt,
      }}
      roles={roles}
    />
  );
};

export default RolesPage;
