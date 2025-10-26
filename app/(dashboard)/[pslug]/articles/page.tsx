import { ArticlesClientPage } from "@/components/articles/articles-client-page"
import { getCachedProjectArticles } from "@/lib/cache/articles"
import { getProjectWithStats } from "@/lib/cache/layout-data"
import { getPlanLimits } from "@/lib/subscription/plans"
import { redirect } from "next/navigation"

const ArticlesPage = async ({ params }: { params: Promise<{ pslug: string }> }) => {
  const resolvedParams = await params

  // Get cached project data with stats
  const project = await getProjectWithStats(resolvedParams.pslug)
  if (!project) redirect("/create-project")

  // Load articles using cached function
  const articles = await getCachedProjectArticles(project.id)

  // Get article count and limits
  const articleCount = articles.length
  const limits = getPlanLimits(project.subscriptionTier)
  const maxCount = limits.maxArticles

  return (
    <ArticlesClientPage
      articles={articles}
      project={{
        id: project.id,
        name: project.name,
        slug: project.slug,
      }}
      articleCount={articleCount}
      maxCount={maxCount}
    />
  )
}

export default ArticlesPage
