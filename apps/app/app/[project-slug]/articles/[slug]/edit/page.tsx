import { ArticleNotFound } from "@/components/articles/article-not-found"
import { ArticleRestore } from "@/components/articles/article-restore"
import { EditArticleForm } from "@/components/articles/edit-form"
import { PageLayout } from "@/components/layout/page-layout"
import { getArticleBySlugWithVariants } from "@/lib/actions/articles"
import { getCurrentUser } from "@/lib/auth-helper"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

type PageParams = Promise<{ 
  "project-slug": string
  slug: string 
}>

export const generateMetadata = async ({ params }: { params: PageParams }): Promise<Metadata> => {
  const { slug } = await params
  const article = await getArticleBySlugWithVariants(slug);

  return {
    title: article?.title ?? "Edit Article",
    robots: { index: false, follow: false }
  }
}

const EditArticlePage = async ({ params }: { params: Promise<PageParams> }) => {
  const { "project-slug", slug } = await params;

  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  // First check if the article exists and is not deleted
  const article = await getArticleBySlugWithVariants(slug)
  if (article) {
    if (article.status === "deleted") {
      return <ArticleRestore slug={"project-slug"} articleId={article.id} />
    }

    return (
      <PageLayout
        title="Edit Article"
        description="Update your article content and settings."
      >
        <EditArticleForm article={article} />
      </PageLayout>
    )
  }

  // Article doesn't exist at all
  return <ArticleNotFound slug={"project-slug"} />
}

export default EditArticlePage
