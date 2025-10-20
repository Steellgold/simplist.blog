import { articlesColumns } from "@/components/articles-columns"
import { ArticlesDataTable } from "@/components/articles-data-table"
import { PageHeader } from "@/components/page-header"
import { buttonVariants } from "@/components/ui/button"
import { getUserProjectWithArticles } from "@/lib/actions/articles"
import { getBatchArticleViewsOverTime } from "@/lib/actions/analytics"
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
    // Fetch analytics for all articles in a single optimized batch query
    const articleIds = articles.map(a => a.id)
    const viewsDataMap = await getBatchArticleViewsOverTime(articleIds, 7)

    articlesWithAnalytics = articles.map(article => ({
      ...article,
      viewsOverTime: viewsDataMap.get(article.id) || []
    }))
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
