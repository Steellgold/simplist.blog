import { ArticlesClientPage } from "@/components/articles/articles-client-page";
import { getProjectArticles } from "@/lib/actions/articles";
import { getCurrentUser } from "@/lib/auth-helper";
import { getUserProjectMembership } from "@/lib/auth/permissions";
import { getPlanLimits } from "@/lib/subscription/plans";
import { prisma } from "@simplist/db";
import { redirect } from "next/navigation";
import { FC } from "react";

type PageParams = {
  params: Promise<{
    "project-slug": string;
  }>;
};

const ArticlesPage: FC<PageParams> = async ({ params }) => {
  const { "project-slug": projectSlug } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  // Find project by slug
  const project = await prisma.project.findUnique({
    where: {
      slug: projectSlug,
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!project) redirect("/create-project");

  // Verify user has access to this project (either as owner or member)
  const membership = await getUserProjectMembership(project.id, user.id);
  if (!membership) redirect("/create-project");

  const articles = await getProjectArticles(project.id, user.id);

  // Get article count and limits
  const articleCount = articles.filter((a) => a.status !== "deleted").length;
  const limits = getPlanLimits(project.subscriptionTier);
  const maxCount = limits.maxArticles;
  const maxVariantsPerArticle = limits.maxVariantsPerArticle;

  // Extract members for author filter
  const members = project.members.map((m) => ({
    id: m.user.id,
    name: m.user.name,
  }));

  return (
    <ArticlesClientPage
      articles={articles}
      project={{
        id: project.id,
        name: project.name,
        slug: project.slug,
      }}
      members={members}
      articleCount={articleCount}
      maxCount={maxCount}
      maxVariantsPerArticle={maxVariantsPerArticle}
    />
  );
};

export default ArticlesPage;
