import { articlesColumns } from "@/components/articles-columns"
import { ArticlesDataTable } from "@/components/articles-data-table"
import { PageHeader } from "@/components/page-header"
import { buttonVariants } from "@/components/ui/button"
import { getUserProjectWithArticles } from "@/lib/actions/articles"
import { getArticleViewsOverTime } from "@/lib/actions/analytics"
import { Plus } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Articles",
  robots: { index: false, follow: false }
}

const ArticlesPage = async () => {
  // Single optimized query for project + articles
  const project = await getUserProjectWithArticles()

  if (!project) {
    return (
      <PageHeader
        title="Articles"
        description="You need to create a project first to manage articles."
      />
    )
  }

  const articles = project.articles

  // Skip analytics if no articles to avoid unnecessary processing
  let articlesWithAnalytics = articles

  if (articles.length > 0) {
    // Only fetch analytics for existing articles
    articlesWithAnalytics = await Promise.all(
      articles.map(async (article) => {
        const viewsOverTime = await getArticleViewsOverTime(article.id, 7)
        return {
          ...article,
          viewsOverTime
        }
      })
    )
  }

  return (
    <PageHeader
      title="Articles"
      description="Manage your blog articles and track their performance."
      actions={
        <Link href="/articles/new" className={buttonVariants({ variant: "default" })}>
          <Plus />
          New Article
        </Link>
      }
    >
      <ArticlesDataTable columns={articlesColumns} data={articlesWithAnalytics} />
    </PageHeader>
  )
}

export default ArticlesPage
