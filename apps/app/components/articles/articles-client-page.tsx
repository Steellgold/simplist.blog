"use client";

import { useArticlesColumns } from "@/components/articles/columns";
import { ArticlesDataTable } from "@/components/articles/data-table";
import { PageLayout } from "@/components/layout/page-layout";
import {
  bulkImportArticles,
  type ImportArticleInput,
} from "@/lib/actions/articles";
import type { Article } from "@simplist/db/types";
import { buttonVariants } from "@simplist/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@simplist/ui/components/empty";
import { ImportDialog, type ImportColumn } from "@/components/import-dialog";
import { ProgressLink } from "@simplist/ui/components/progress-button";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ArticlesClientPageProps = {
  articles: Omit<Article, "content">[];
  project: {
    id: string;
    name: string;
    slug: string;
  };
  members: Array<{ id: string; name: string | null }>;
  articleCount: number;
  maxCount: number;
};

export const ArticlesClientPage = ({
  articles,
  project,
  members,
  articleCount,
  maxCount,
}: ArticlesClientPageProps) => {
  const router = useRouter();
  const columns = useArticlesColumns();
  const isAtLimit = maxCount !== -1 && articleCount >= maxCount;

  const importColumns: ImportColumn[] = [
    { key: "title", header: "Title", required: true },
    { key: "slug", header: "Slug" },
    { key: "excerpt", header: "Excerpt" },
    { key: "content", header: "Content" },
    { key: "status", header: "Status" },
    { key: "tags", header: "Tags" },
  ];

  const handleImport = async (importedArticles: ImportArticleInput[]) => {
    const result = await bulkImportArticles(project.id, importedArticles);
    if (result.success) {
      router.refresh();
    }
    return result;
  };

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
              Create your first article to start publishing and tracking
              performance.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex items-center gap-2">
              <ImportDialog<ImportArticleInput>
                columns={importColumns}
                onImport={handleImport}
                title="Import articles"
                description="Upload a CSV, JSON, or XML file to import articles."
                entityName="articles"
              />
              <Link
                href={`/${project.slug}/articles/new`}
                className={`${buttonVariants({ variant: "default", size: "sm" })} ${isAtLimit ? "pointer-events-none opacity-50" : ""}`}
                aria-disabled={isAtLimit}
              >
                <Plus />
                New Article
              </Link>
            </div>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <PageLayout
      title="Articles"
      description="Manage your blog articles and track their performance."
      actions={
        maxCount === -1 ? (
          <Link
            href={`/${project.slug}/articles/new`}
            className={buttonVariants({ variant: "outline" })}
          >
            <Plus />
            New Article
          </Link>
        ) : (
          <ProgressLink
            href={`/${project.slug}/articles/new`}
            value={articleCount}
            min={0}
            max={maxCount}
            variant="outline"
            as={Link}
          >
            <Plus />
            New Article ({articleCount}/{maxCount})
          </ProgressLink>
        )
      }
    >
      <ArticlesDataTable columns={columns} data={articles} members={members} />
    </PageLayout>
  );
};
