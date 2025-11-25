"use client"

import { useProjectContext } from "@/components/projects/context-provider"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Clock, Copy, Edit, MoreHorizontal, Trash, TrendingUp } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { VariantFlags } from "./variant-flags"

import { deleteArticle } from "@/lib/actions/articles"
import { LanguageCode } from "@/lib/types/languages"
import { ConfirmDialog } from "@simplist/ui/components/confirm-dialog"
import { Badge } from "@simplist/ui/components/badge"
import { Button } from "@simplist/ui/components/button"
import { Checkbox } from "@simplist/ui/components/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@simplist/ui/components/dropdown-menu"
import { toast } from "@simplist/ui/components/sonner"
import { Spinner } from "@simplist/ui/components/spinner"

type Article = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  status: string
  viewCount: number
  createdAt: Date
  updatedAt: Date
  scheduledPublishAt?: Date | null
  variants?: Array<{ lang: LanguageCode }>
}

const ArticleActionsCell = ({ article }: { article: Article }) => {
  const router = useRouter()
  const { currentProject } = useProjectContext()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Reset isDeleting when dialog closes
  useEffect(() => {
    if (!showDeleteDialog) {
      setIsDeleting(false)
    }
  }, [showDeleteDialog])

  const copyId = () => {
    navigator.clipboard.writeText(article.id)
    toast.success("Article ID copied to clipboard")
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await toast.promise(
        deleteArticle(article.id),
        {
          loading: "Deleting article...",
          success: "Article deleted successfully",
          error: "Failed to delete article",
        }
      )
      setShowDeleteDialog(false)
      router.refresh()
    } catch {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={copyId}>
            <Copy />
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/${currentProject?.slug}/articles/${article.slug}/edit`}>
              <Edit />
              Edit article
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/${currentProject?.slug}/analytics?articles=${article.id}`}>
              <TrendingUp />
              Analytics
            </Link>
          </DropdownMenuItem>
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
  )
}

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const },
  published: { label: "Published", variant: "default" as const },
  scheduled: { label: "Scheduled", variant: "outline" as const },
  archived: { label: "Archived", variant: "outline" as const },
}

export const useArticlesColumns = (): ColumnDef<Article>[] => {
  const { currentProject } = useProjectContext()

  // Check if user has pro access for bulk operations
  const isPro = Boolean(currentProject?.subscriptionTier === "PRO" &&
    currentProject?.subscriptionExpiresAt &&
    new Date(currentProject.subscriptionExpiresAt) > new Date())

  const columns: ColumnDef<Article>[] = []

  // Only add select column for Pro users
  if (isPro) {
    columns.push({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    })
  }

  return [
    ...columns,
  {
    accessorKey: "coverImage",
    header: () => null,
    cell: ({ row }) => {
      const coverImage = row.getValue("coverImage") as string | null
      const title = row.getValue("title") as string
      const variants = row.original.variants as Array<{ lang: string; coverImage?: string | null }> | undefined

      const displayImage = coverImage || variants?.find(v => v.coverImage)?.coverImage || null

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
      )
    },
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const title = row.getValue("title") as string
      const excerpt = row.original.excerpt

      return (
        <>
          <div className="font-medium truncate max-w-[200px] sm:max-w-md" title={title}>
            {title}
          </div>
          {excerpt && (
            <div className="text-sm text-muted-foreground line-clamp-1 max-w-[200px] sm:max-w-md hidden sm:block">
              {excerpt}
            </div>
          )}
        </>
      )
    },
  },
  {
    id: "variants",
    header: "Variants",
    cell: ({ row }) => {
      const article = row.original
      const variants = article.variants || []

      if (variants.length === 0) {
        return (
          <div className="text-xs text-muted-foreground italic flex justify-center select-none">
            X
          </div>
        )
      }

      return <VariantFlags variants={variants} maxVisible={4} />
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as keyof typeof statusConfig
      const config = statusConfig[status] || statusConfig.draft
      const article = row.original

      return (
        <div className="space-y-1">
          <Badge variant={config.variant}>{config.label}</Badge>
          {status === "scheduled" && article.scheduledPublishAt && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {format(new Date(article.scheduledPublishAt), "MMM d, yyyy \"at\" h:mm a")}
            </div>
          )}
        </div>
      )
    },
  },
  {
    id: "analytics",
    header: "Analytics",
    cell: ({ row }) => {
      const article = row.original

      return (
        <Button
          variant="outline"
          size="sm"
          asChild
          className="h-8"
        >
          <Link href={`/${currentProject?.slug}/analytics?articles=${article.id}`}>
            <TrendingUp className="h-3 w-3 sm:mr-1" />
            <span className="hidden sm:inline">Analytics</span>
          </Link>
        </Button>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as Date
      const updatedAt = row.original.updatedAt

      return (
        <div className="space-y-1 text-sm">
          <div className="truncate">{format(new Date(createdAt), "MMM d, yyyy")}</div>
          <div className="text-muted-foreground text-xs hidden sm:block">
            Updated: {format(new Date(updatedAt), "MMM d, yyyy")}
          </div>
        </div>
      )
    },
  },
    {
      id: "actions",
      cell: ({ row }) => <ArticleActionsCell article={row.original} />,
    },
  ]
}
