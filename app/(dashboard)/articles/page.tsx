"use client"

import { articlesColumns } from "@/components/articles-columns"
import { ArticlesDataTable } from "@/components/articles-data-table"
import { PageHeader } from "@/components/page-header"
import { buttonVariants } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useArticles } from "@/hooks/use-articles"
import { Plus } from "lucide-react"
import Link from "next/link"

const ArticlesPage = () => {
  const { data: articles, isLoading, error } = useArticles()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <PageHeader
        title="Articles"
        description="Failed to load articles. Please try again."
      />
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
      <ArticlesDataTable columns={articlesColumns} data={articles || []} />
    </PageHeader>
  )
}

export default ArticlesPage
