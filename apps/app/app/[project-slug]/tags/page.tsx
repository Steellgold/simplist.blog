import { TagsClientPage } from "@/components/tags/tags-client-page";
import { getProjectTagsWithMetadata } from "@/lib/actions/tags";
import { getCurrentUser } from "@/lib/auth-helper";
import { getUserProjectMembership } from "@/lib/auth/permissions";
import { prisma } from "@simplist/db";
import { redirect } from "next/navigation";

type TagsPageProps = {
  params: Promise<{
    "project-slug": string;
  }>;
};

const TagsPage = async ({ params }: TagsPageProps) => {
  const resolvedParams = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  // Find project by slug
  const project = await prisma.project.findUnique({
    where: {
      slug: resolvedParams["project-slug"],
    },
  });

  if (!project) redirect("/create-project");

  // Verify user has access to this project (either as owner or member)
  const membership = await getUserProjectMembership(project.id, user.id);
  if (!membership) redirect("/create-project");

  const tags = await getProjectTagsWithMetadata(project.id);

  return (
    <TagsClientPage
      tags={tags}
      project={{
        id: project.id,
        name: project.name,
        slug: project.slug,
        subscriptionTier: project.subscriptionTier,
        subscriptionExpiresAt: project.subscriptionExpiresAt,
      }}
      canManageTags={membership.role.canManageTags}
    />
  );
};

export default TagsPage;
