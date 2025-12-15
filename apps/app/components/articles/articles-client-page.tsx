"use client"

import { useArticlesColumns } from "@/components/articles/columns"
import { ArticlesDataTable } from "@/components/articles/data-table"
import { PageLayout } from "@/components/layout/page-layout"
import type { Article } from "@simplist/db/types"
import { buttonVariants } from "@simplist/ui/components/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@simplist/ui/components/empty"
import { ProgressLink } from "@simplist/ui/components/progress-button"
import { FileText, Plus } from "lucide-react"
import Link from "next/link"

type ArticlesClientPageProps = {
  articles: Omit<Article, 'content'>[]
  project: {
    id: string
    name: string
    slug: string
  }
  articleCount: number
  maxCount: number
}

export const ArticlesClientPage = ({
  articles,
  project,
  articleCount,
  maxCount,
}: ArticlesClientPageProps) => {
  const columns = useArticlesColumns()
  const isAtLimit = maxCount !== -1 && articleCount >= maxCount

  if (articles.length === 0) {
    return (
      <div className="flex min-h-[calc(90vh-4rem)] items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>No articles yet</EmptyTitle>
            <EmptyDescription>
              Create your first article to start publishing and tracking performance.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link
              href={`/${project.slug}/articles/new`}
              className={`${buttonVariants({ variant: "default", size: "sm" })} ${isAtLimit ? "pointer-events-none opacity-50" : ""}`}
              aria-disabled={isAtLimit}
            >
              <Plus />
              New Article
            </Link>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return (
    <PageLayout
      title="Articles"
      description="Manage your blog articles and track their performance."
      actions={
        maxCount === -1 ? (
          <Link href={`/${project.slug}/articles/new`} className={buttonVariants({ variant: "outline" })}>
            <Plus />
            New Article
          </Link>
        ) : (
          <ProgressLink href={`/${project.slug}/articles/new`} value={articleCount} min={0} max={maxCount} variant="outline" as={Link}>
            <Plus />
            New Article ({articleCount}/{maxCount})
          </ProgressLink>
        )
      }
    >
      <ArticlesDataTable columns={columns} data={articles} />
    </PageLayout>
  )
}
