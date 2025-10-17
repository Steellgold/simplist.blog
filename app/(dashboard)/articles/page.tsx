import { articlesColumns } from "@/components/articles-columns"
import { ArticlesDataTable } from "@/components/articles-data-table"
import { buttonVariants } from "@/components/ui/button"
import { getProjectArticles } from "@/lib/actions/articles"
import { getUserProjects } from "@/lib/actions/projects"
import { Plus } from "lucide-react"
import Link from "next/link"

const ArticlesPage = async () => {
  const projects = await getUserProjects()
  const project = projects[0]

  if (!project) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
          <p className="text-muted-foreground">
            You need to create a project first to manage articles.
          </p>
        </div>
      </div>
    )
  }

  const articles = await getProjectArticles(project.id)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
          <p className="text-muted-foreground">
            Manage your blog articles and track their performance.
          </p>
        </div>

        <Link href="/articles/new" className={buttonVariants({ variant: "default" })}>
          <Plus />
          New Article
        </Link>
      </div>

      <ArticlesDataTable columns={articlesColumns} data={articles} />
    </div>
  )
}

export default ArticlesPage
