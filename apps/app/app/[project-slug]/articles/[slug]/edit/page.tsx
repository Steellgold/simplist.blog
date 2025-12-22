import { ArticleNotFound } from "@/components/articles/article-not-found";
import { ArticleRestore } from "@/components/articles/article-restore";
import { EditArticleForm } from "@/components/articles/edit-form";
import { PageLayout } from "@/components/layout/page-layout";
import { getArticleBySlugWithVariants } from "@/lib/actions/articles";
import { getProjectTagsWithMetadata } from "@/lib/actions/tags";
import { getCurrentUser } from "@/lib/auth-helper";
import { type Tag } from "@simplist/db";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

type PageParams = Promise<{
  "project-slug": string;
  slug: string;
}>;

export const generateMetadata = async ({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> => {
  const { "project-slug": projectSlug, slug } = await params;

  const article = await getArticleBySlugWithVariants(slug, projectSlug);

  return {
    title: article?.title ?? "Edit Article",
    robots: { index: false, follow: false },
  };
};

const EditArticlePage = async ({ params }: { params: Promise<PageParams> }) => {
  const resolvedParams = await params;
  const projectSlug = resolvedParams["project-slug"];
  const slug = resolvedParams.slug;

  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  // First check if the article exists and is not deleted
  const article = await getArticleBySlugWithVariants(slug, projectSlug);
  if (article) {
    if (article.status === "deleted") {
      return <ArticleRestore slug={projectSlug} articleId={article.id} />;
    }

    const tags = await getProjectTagsWithMetadata(article.projectId);
    const availableTags: Tag[] = tags.map((tag) => ({
      ...tag,
      projectId: article.projectId,
    }));

    return (
      <PageLayout
        title="Edit Article"
        description="Update your article content and settings."
      >
        <EditArticleForm article={article} availableTags={availableTags} />
      </PageLayout>
    );
  }

  // Article doesn't exist at all
  return <ArticleNotFound slug={projectSlug} />;
};

export default EditArticlePage;
