"use client";

import {
  useArticlesColumns,
  type Article,
} from "@/components/articles/columns";
import { ArticlesDataTable } from "@/components/articles/data-table";
import { ImportDialog, type ImportColumn } from "@/components/import-dialog";
import { PageLayout } from "@/components/layout/page-layout";
import {
  bulkImportArticles,
  type ImportArticleInput,
} from "@/lib/actions/articles";
import { buttonVariants } from "@simplist/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@simplist/ui/components/empty";
import { Kbd } from "@simplist/ui/components/kbd";
import { ProgressLink } from "@simplist/ui/components/progress-button";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";

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
  maxVariantsPerArticle: number;
};

export const ArticlesClientPage = ({
  articles,
  project,
  members,
  articleCount,
  maxCount,
  maxVariantsPerArticle,
}: ArticlesClientPageProps) => {
  const router = useRouter();
  const columns = useArticlesColumns({ articles: articles as Article[] });
  const isAtLimit = maxCount !== -1 && articleCount >= maxCount;

  // Keyboard shortcut: N to create new article
  useHotkeys("n", () => router.push(`/${project.slug}/articles/new`), {
    enabled: !isAtLimit,
    enableOnFormTags: false,
  });

  const importColumns: ImportColumn[] = [
    { key: "title", header: "Title", required: true },
    { key: "slug", header: "Slug" },
    { key: "excerpt", header: "Excerpt" },
    { key: "content", header: "Content" },
    { key: "status", header: "Status" },
    { key: "tags", header: "Tags" },
    {
      key: "variants",
      header: "Variants",
      transform: (value: string) => {
        if (!value || value.trim() === "") return [];
        try {
          return JSON.parse(value);
        } catch {
          return [];
        }
      },
    },
  ];

  const handleImport = async (
    importedArticles: ImportArticleInput[],
    variantSelections?: Record<number, number>,
  ) => {
    const result = await bulkImportArticles(
      project.id,
      importedArticles,
      variantSelections,
    );
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
                maxVariantsPerItem={maxVariantsPerArticle}
              />
              <Link
                href={`/${project.slug}/articles/new`}
                className={`${buttonVariants({ variant: "default", size: "sm" })} ${isAtLimit ? "pointer-events-none opacity-50" : ""}`}
                aria-disabled={isAtLimit}
              >
                <Plus />
                New article
                <Kbd>N</Kbd>
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
            className={buttonVariants({ variant: "default" })}
          >
            <Plus />
            New article
            <Kbd>N</Kbd>
          </Link>
        ) : (
          <ProgressLink
            href={`/${project.slug}/articles/new`}
            value={articleCount}
            min={0}
            max={maxCount}
            variant="default"
            as={Link}
          >
            <Plus />
            New article ({articleCount}/{maxCount})<Kbd>N</Kbd>
          </ProgressLink>
        )
      }
    >
      <ArticlesDataTable columns={columns} data={articles} members={members} />
    </PageLayout>
  );
};
