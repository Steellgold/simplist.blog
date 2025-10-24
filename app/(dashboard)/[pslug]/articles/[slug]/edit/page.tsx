import { EditArticleForm } from "@/components/articles/edit-form"
import { PageLayout } from "@/components/layout/page-layout"
import { getArticleBySlug } from "@/lib/actions/articles"
import { getCurrentUser } from "@/lib/auth-helper"
import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

type PageParams = Promise<{ 
  pslug: string
  slug: string 
}>

export const generateMetadata = async ({ params }: { params: PageParams }): Promise<Metadata> => {
  const { slug } = await params
  const article = await getArticleBySlug(slug);

  return {
    title: article?.title ?? "Edit Article",
    robots: { index: false, follow: false }
  }
}

const EditArticlePage = async ({ params }: { params: Promise<PageParams> }) => {
  const { slug } = await params;

  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  return (
    // <div className="container max-w-7xl mx-auto">
    // </div>
    <PageLayout
      title="Edit Article"
      description="Update your article content and settings."
    >
      <EditArticleForm article={article} />
    </PageLayout>
  )
}

export default EditArticlePage
