import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-helper"
import { getArticleBySlug } from "@/lib/actions/articles"
import { EditArticleForm } from "@/components/edit-article-form"
import { PageHeader } from "@/components/page-header"
import type { Metadata } from "next"

type PageParams = { slug: string }

export const generateMetadata = async (
  { params }: { params: Promise<PageParams> }
): Promise<Metadata> => {
  const { slug } = await params
  const article = await getArticleBySlug(slug);

  return {
    title: article?.title ?? "Edit Article",
    robots: { index: false, follow: false }
  }
}

const EditArticlePage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  return (
    <div className="container max-w-7xl mx-auto">
      <PageHeader
        title="Edit Article"
        description="Update your article content and settings."
      >
        <EditArticleForm article={article} />
      </PageHeader>
    </div>
  )
}

export default EditArticlePage

