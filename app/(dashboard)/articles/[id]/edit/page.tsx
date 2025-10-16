import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-helper"
import { getArticle } from "@/lib/actions/articles"
import { EditArticleForm } from "@/components/edit-article-form"

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const article = await getArticle(params.id)
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

