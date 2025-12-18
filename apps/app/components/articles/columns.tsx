"use client";

import { useProjectContext } from "@/components/projects/context-provider";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Copy, Edit, MoreVertical, Trash, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { VariantFlags } from "./variant-flags";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { deleteArticle } from "@/lib/actions/articles";
import { getDateFnsLocale, LanguageCode } from "@/lib/types/languages";
import type { Color } from "@simplist/db";
import { Badge } from "@simplist/ui/components/badge";
import { Button } from "@simplist/ui/components/button";
import { Checkbox } from "@simplist/ui/components/checkbox";
import { ConfirmDialog } from "@simplist/ui/components/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemLink,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@simplist/ui/components/dropdown-menu";
import { IconRender } from "@simplist/ui/components/icon-renderer";
import { toast } from "@simplist/ui/components/sonner";
import { Spinner } from "@simplist/ui/components/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@simplist/ui/components/tooltip";
import { getTagColorClasses } from "@simplist/ui/lib/color";
import type { IconsEnumType } from "@simplist/ui/lib/icons.enum";
import { cn } from "@simplist/ui/lib/utils";

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  status: string;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  scheduledPublishAt?: Date | null;
  variants?: Array<{ id: string; lang: LanguageCode }>;
  author?: { id: string; name: string | null } | null;
  tags?: Array<{ name: string; icon: string | null; color: Color | null }>;
};

const ArticleActionsCell = ({ article }: { article: Article }) => {
  const router = useRouter();
  const { currentProject } = useProjectContext();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset isDeleting when dialog closes
  useEffect(() => {
    if (!showDeleteDialog) {
      setIsDeleting(false);
    }
  }, [showDeleteDialog]);

  const copyId = () => {
    navigator.clipboard.writeText(article.id);
    toast.success("Article ID copied to clipboard");
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      toast.promise(deleteArticle(article.id), {
        loading: "Deleting article...",
        success: "Article deleted successfully",
        error: "Failed to delete article",
      });
      setShowDeleteDialog(false);
      router.refresh();
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <span className="sr-only">Open menu</span>
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem onClick={copyId}>
            <Copy />
            Copy ID
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItemLink
            as={Link}
            href={`/${currentProject?.slug}/articles/${article.slug}/edit`}
          >
            <Edit />
            Edit article
          </DropdownMenuItemLink>

          <DropdownMenuItemLink
            as={Link}
            href={`/${currentProject?.slug}/analytics?articles=${article.id}`}
          >
            <TrendingUp />
            Analytics
          </DropdownMenuItemLink>

          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash className="text-destructive" />
            Delete article
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete article?"
        description={`This will permanently delete the article "${article.title}". This action cannot be undone.`}
        confirmText={isDeleting ? <Spinner /> : "Delete"}
        disabled={isDeleting}
        variant="destructive"
      />
    </>
  );
};

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const },
  published: { label: "Published", variant: "default" as const },
  scheduled: { label: "Scheduled", variant: "outline" as const },
  archived: { label: "Archived", variant: "outline" as const },
};

type UseArticlesColumnsOptions = {
  articles: Article[];
};

export const useArticlesColumns = ({
  articles,
}: UseArticlesColumnsOptions): ColumnDef<Article>[] => {
  const { currentProject } = useProjectContext();

  // Check if user has pro access for bulk operations
  const isPro = Boolean(
    currentProject?.subscriptionTier === "PRO" &&
    currentProject?.subscriptionExpiresAt &&
    new Date(currentProject.subscriptionExpiresAt) > new Date(),
  );

  // Check if any article on current page has variants or tags
  const hasAnyVariants = articles.some(
    (article) => article.variants && article.variants.length > 0,
  );
  const hasAnyTags = articles.some(
    (article) => article.tags && article.tags.length > 0,
  );

  const columns: ColumnDef<Article>[] = [];

  // Only add select column for Pro users
  if (isPro) {
    columns.push({
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center pl-2">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center pl-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    });
  }

  return [
    ...columns,
    {
      accessorKey: "coverImage",
      header: () => null,
      cell: ({ row }) => {
        const coverImage = row.getValue("coverImage") as string | null;
        const title = row.getValue("title") as string;
        const variants = row.original.variants as
          | Array<{ lang: string; coverImage?: string | null }>
          | undefined;

        const displayImage =
          coverImage || variants?.find((v) => v.coverImage)?.coverImage || null;

        return (
          <div className="w-24 h-16 relative rounded-md overflow-hidden bg-muted">
            {displayImage ? (
              <Image
                src={displayImage}
                alt={title}
                fill
                sizes="128px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                No image
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => {
        const title = row.getValue("title") as string;
        const excerpt = row.original.excerpt;

        return (
          <>
            <div
              className="font-medium truncate max-w-[200px] sm:max-w-md"
              title={title}
            >
              {title}
            </div>
            {excerpt && (
              <div className="text-sm text-muted-foreground line-clamp-1 max-w-[200px] sm:max-w-md hidden sm:block">
                {excerpt}
              </div>
            )}
          </>
        );
      },
    },
    // Only show variants column if any article has variants
    ...(hasAnyVariants
      ? [
          {
            id: "variants",
            header: "Variants",
            cell: ({ row }: { row: { original: Article } }) => {
              const article = row.original;
              const variants = article.variants || [];

              if (variants.length === 0) {
                return null;
              }

              return (
                <div className="flex justify-center">
                  <VariantFlags variants={variants} maxVisible={4} />
                </div>
              );
            },
          } as ColumnDef<Article>,
        ]
      : []),
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as keyof typeof statusConfig;
        const config = statusConfig[status] || statusConfig.draft;
        const article = row.original;

        if (status === "scheduled" && article.scheduledPublishAt) {
          return (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant={config.variant} className="rounded">
                    {config.label}
                  </Badge>
                </TooltipTrigger>

                <TooltipContent>
                  {format(
                    new Date(article.scheduledPublishAt),
                    "PPP 'at' HH:mm",
                    {
                      locale: getDateFnsLocale(
                        currentProject?.defaultLanguage || "en",
                      ),
                    },
                  )}
                  <br />
                  Timezone: {currentProject?.timezone}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return (
          <div className="space-y-1">
            <Badge variant={config.variant} className="rounded">
              {config.label}
            </Badge>
          </div>
        );
      },
    },
    // Only show tags column if any article has tags
    ...(hasAnyTags
      ? [
          {
            accessorKey: "tags",
            header: "Tags",
            cell: ({ row }: { row: { original: Article } }) => {
              const tags = row.original.tags || [];

              if (tags.length === 0) {
                return null;
              }

              const visibleTags = tags.slice(0, 2);
              const remainingCount = tags.length - 2;

              return (
                <div className="flex flex-wrap gap-1">
                  {visibleTags.map((tag) => {
                    const colorClass =
                      getTagColorClasses(tag.color) ||
                      getTagColorClasses("GRAY");

                    return (
                      <span
                        key={tag.name}
                        className={cn(
                          "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-medium",
                          colorClass,
                        )}
                      >
                        <IconRender
                          name={(tag.icon as IconsEnumType) || "tag"}
                          size={12}
                        />
                        <span>{tag.name}</span>
                      </span>
                    );
                  })}
                  {remainingCount > 0 && (
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
                            +{remainingCount}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {tags
                            .slice(2)
                            .map((tag) => tag.name)
                            .join(", ")}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              );
            },
            filterFn: (
              row: { getValue: (id: string) => unknown },
              columnId: string,
              filterValue: string[] | undefined,
            ) => {
              if (!filterValue || filterValue.length === 0) return true;
              const tags = row.getValue(columnId) as
                | Array<{
                    name: string;
                    icon: string | null;
                    color: Color | null;
                  }>
                | undefined;
              if (!tags || tags.length === 0) return false;
              return filterValue.some((selectedTag) =>
                tags.some((tag) => tag.name === selectedTag),
              );
            },
          } as ColumnDef<Article>,
        ]
      : []),
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as Date;

        return (
          <div className="text-sm truncate">
            {format(new Date(createdAt), "MMM d, yyyy")}
          </div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated" />
      ),
      cell: ({ row }) => {
        const updatedAt = row.getValue("updatedAt") as Date;

        return (
          <div className="text-sm truncate">
            {format(new Date(updatedAt), "MMM d, yyyy")}
          </div>
        );
      },
    },
    // Hidden columns for filtering/sorting only
    {
      accessorKey: "viewCount",
      header: () => null,
      cell: () => null,
      enableHiding: true,
    },
    {
      id: "variantCount",
      accessorFn: (row) => row.variants?.length ?? 0,
      header: () => null,
      cell: () => null,
      enableHiding: true,
    },
    {
      id: "author",
      accessorFn: (row) => row.author?.id,
      header: () => null,
      cell: () => null,
      enableHiding: true,
      filterFn: (row, columnId, filterValue: string[] | undefined) => {
        if (!filterValue || filterValue.length === 0) return true;
        const authorId = row.getValue(columnId) as string | undefined;
        if (!authorId) return false;
        return filterValue.includes(authorId);
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <ArticleActionsCell article={row.original} />,
    },
  ];
};
