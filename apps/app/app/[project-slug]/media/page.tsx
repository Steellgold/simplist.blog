import { MediaClientPage } from "@/components/media/media-client-page";
import { getProjectMedia, getStorageStats } from "@/lib/actions/media";
import { getCurrentUser } from "@/lib/auth-helper";
import { getUserProjectMembership } from "@/lib/auth/permissions";
import { prisma } from "@simplist/db";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    "project-slug": string;
  }>;
};

const MediaPage = async ({ params }: Props) => {
  const resolvedParams = await params;
  const user = await getCurrentUser();

  if (!user) redirect("/auth/login");

  // Get project by slug
  const project = await prisma.project.findUnique({
    where: {
      slug: resolvedParams["project-slug"],
    },
    include: {
      members: true,
    },
  });

  if (!project) redirect("/create-project");

  // Verify user has access to this project (either as owner or member)
  const membership = await getUserProjectMembership(project.id, user.id);
  if (!membership) redirect("/create-project");

  // Load initial data
  const [mediaResult, storageStats] = await Promise.all([
    getProjectMedia(project.id, { page: 1, limit: 24 }),
    getStorageStats(project.id),
  ]);

  return (
    <MediaClientPage
      initialMedia={mediaResult.media}
      initialTotal={mediaResult.total}
      initialTotalPages={mediaResult.totalPages}
      storageStats={storageStats}
      memberCount={project.members.length}
      project={{
        id: project.id,
        name: project.name,
        slug: project.slug,
      }}
    />
  );
};

export default MediaPage;
