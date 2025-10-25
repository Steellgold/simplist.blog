import { ArticlesClientPage } from "@/components/articles/articles-client-page"
import { getProjectArticles } from "@/lib/actions/articles"
import { getCurrentUser } from "@/lib/auth-helper"
import { prisma } from "@/lib/db"
import { getPlanLimits } from "@/lib/subscription/plans"
import { redirect } from "next/navigation"

const ArticlesPage = async ({ params }: { params: Promise<{ pslug: string }> }) => {
  const resolvedParams = await params
  const user = await getCurrentUser()

  if (!user) redirect("/auth/login")

  // Get user's project
  const project = await prisma.project.findFirst({
    where: {
      userId: user.id,
      slug: resolvedParams.pslug,
    },
  })

  if (!project) redirect("/create-project")

  // Load articles
  const articles = await getProjectArticles(project.id)

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
