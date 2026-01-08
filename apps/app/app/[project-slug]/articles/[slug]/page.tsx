import { ArticleNotFound } from "@/components/articles/article-not-found";
import { ArticleRestore } from "@/components/articles/article-restore";
import { EditArticleForm } from "@/components/articles/edit-form";
import { getArticleBySlugWithVariants } from "@/lib/actions/articles";
import { getProjectTagsWithMetadata } from "@/lib/actions/tags";
import { getCurrentUser } from "@/lib/auth-helper";
import { getProjectSubscription } from "@/lib/subscription/quota-check";
import { type Tag } from "@simplist/db";
import { redirect } from "next/navigation";

type PageParams = Promise<{
  "project-slug": string;
  slug: string;
}>;

const ArticlePage = async ({ params }: { params: PageParams }) => {
  const { "project-slug": projectSlug, slug } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const article = await getArticleBySlugWithVariants(slug, projectSlug);

  if (!article) {
    return <ArticleNotFound slug={projectSlug} />;
  }

  if (article.status === "deleted") {
    return <ArticleRestore slug={projectSlug} articleId={article.id} />;
  }

  const [tags, subscription] = await Promise.all([
    getProjectTagsWithMetadata(article.projectId),
    getProjectSubscription(article.projectId),
  ]);

  const availableTags: Tag[] = tags.map((tag) => ({
    ...tag,
    projectId: article.projectId,
  }));

  return (
    <EditArticleForm
      article={article}
      availableTags={availableTags}
      subscription={subscription}
      title="Edit Article"
      description="Update your article content and settings."
    />
  );
};

export default ArticlePage;
