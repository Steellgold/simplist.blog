import { ArticlesDataTable } from "@/components/articles-data-table"
import { articlesColumns } from "@/components/articles-columns"
import { getProjectArticles } from "@/lib/actions/articles"
import { getUserProjects } from "@/lib/actions/projects"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function ArticlesPage() {
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

        <Button asChild>
          <Link href="/articles/new">
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Link>
        </Button>
      </div>

      <ArticlesDataTable columns={articlesColumns} data={articles} />
    </div>
  )
}
