"use client"

import { useArticlesColumns } from "@/components/articles/columns"
import { ArticlesDataTable } from "@/components/articles/data-table"
import { PageLayout } from "@/components/layout/page-layout"
import type { Article } from "@simplist/db/types"
import { buttonVariants } from "@simplist/ui/components/button"
import { ProgressLink } from "@simplist/ui/components/progress-button"
import { Plus } from "lucide-react"
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

  return (
    <PageLayout
      title="Articles"
      description={`Manage your ${project.name} blog articles and track their performance.`}
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
