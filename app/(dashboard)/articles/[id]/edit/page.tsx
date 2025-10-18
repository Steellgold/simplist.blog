import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-helper"
import { getArticle } from "@/lib/actions/articles"
import { EditArticleForm } from "@/components/edit-article-form"
import type { Metadata } from "next"

type PageParams = { id: string }

export async function generateMetadata(
  { params }: { params: Promise<PageParams> }
): Promise<Metadata> {
  const { id } = await params
  const article = await getArticle(id);

  return {
    title: article?.title ?? "Edit Article",
    robots: { index: false, follow: false }
  }
}

const EditArticlePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const { id } = await params
  const article = await getArticle(id)
  if (!article) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Article</h1>
        <p className="text-muted-foreground">
          Update your article content and settings.
        </p>
      </div>

      <EditArticleForm article={article} />
    </div>
  )
}

export default EditArticlePage

