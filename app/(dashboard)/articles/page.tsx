"use client"

import { articlesColumns } from "@/components/articles-columns"
import { ArticlesDataTable } from "@/components/articles-data-table"
import { PageHeader } from "@/components/page-header"
import { buttonVariants } from "@/components/ui/button"
import { useArticles } from "@/hooks/use-articles"
import { Plus } from "lucide-react"
import Link from "next/link"

const ArticlesPage = () => {
  const { data: articles, error } = useArticles()

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto">
        <PageHeader
          title="Articles"
          description="Failed to load articles. Please try again."
        />
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto">
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
    </div>
  )
}

export default ArticlesPage
