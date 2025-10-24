"use client"

import { useArticlesColumns } from "@/components/articles/columns"
import { ArticlesDataTable } from "@/components/articles/data-table"
import { PageLayout } from "@/components/layout/page-layout"
import { EmptyProject } from "@/components/projects/empty-project"
import { buttonVariants } from "@/components/ui/button"
import { ProgressButton } from "@/components/ui/progress-button"
import { useArticles } from "@/hooks/use-articles"
import { useProject } from "@/hooks/use-project-context"
import { useArticleLimits } from "@/hooks/use-subscription-limits"
import { Plus } from "lucide-react"
import Link from "next/link"

const ArticlesPage = () => {
  const { currentProject } = useProject()
  const { data: articles, error } = useArticles()
  const columns = useArticlesColumns()
  const { currentCount, maxCount, isLoading: limitsLoading } = useArticleLimits(currentProject?.id)

  if (error) {
    return (
      // <div className="container max-w-7xl mx-auto">
        <PageLayout title="Articles" description="Failed to load articles. Please try again." />
      // </div>
    )
  }

  if (!currentProject) return <EmptyProject />

  return (
    // <div className="container max-w-7xl mx-auto">
      <PageLayout
        title="Articles"
        description={`Manage your ${currentProject.name} blog articles and track their performance.`}
        actions={
          <ProgressButton value={currentCount} min={0} max={maxCount} variant="outline" asChild>
            <Link href={`/${currentProject.slug}/articles/new`} className="flex items-center gap-2">
              <Plus />
              New Article {!limitsLoading && `(${currentCount}/${maxCount === -1 ? "∞" : maxCount})`}
            </Link>
          </ProgressButton>
        }
      >
        <ArticlesDataTable columns={columns} data={articles || []} />
      </PageLayout>
    // </div>
  )
}

export default ArticlesPage
