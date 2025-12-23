import { CreateArticleForm } from "@/components/articles/create-form";
import { PageLayout } from "@/components/layout/page-layout";
import { getProjectTagsWithMetadata } from "@/lib/actions/tags";
import { getCurrentUser } from "@/lib/auth-helper";
import { getProjectSubscription } from "@/lib/subscription/quota-check";
import { prisma, type Tag } from "@simplist/db";
import { redirect } from "next/navigation";
import { FC } from "react";

type PageParams = {
  params: Promise<{
    "project-slug": string;
  }>;
};

const NewArticlePage: FC<PageParams> = async ({ params }) => {
  const resolvedParams = await params;
  const projectSlug = resolvedParams["project-slug"];

  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  // Get project by slug
  const project = await prisma.project.findUnique({
    where: { slug: projectSlug },
    select: { id: true, name: true },
  });

  if (!project) {
    redirect("/");
  }

  const [tags, subscription] = await Promise.all([
    getProjectTagsWithMetadata(project.id),
    getProjectSubscription(project.id),
  ]);

  const availableTags: Tag[] = tags.map((tag) => ({
    ...tag,
    projectId: project.id,
  }));

  return (
    <div className="container mx-auto max-w-7xl">
      <PageLayout
        title="Create a new article"
        description={`Write and publish a new article for your ${project.name} blog`}
      >
        <CreateArticleForm
          projectId={project.id}
          availableTags={availableTags}
          subscription={subscription}
        />
      </PageLayout>
    </div>
  );
};

export default NewArticlePage;
