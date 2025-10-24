import { EditArticleForm } from "@/components/articles/edit-form"
import { PageHeader } from "@/components/layout/page-header"
import { getArticleBySlug } from "@/lib/actions/articles"
import { getCurrentUser } from "@/lib/auth-helper"
import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

type PageParams = { 
  "project-slug": string
  slug: string 
}

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

const EditArticlePage = async ({ params }: { params: Promise<PageParams> }) => {
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
