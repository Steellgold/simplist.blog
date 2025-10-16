"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Copy, Edit, MoreHorizontal, Trash, TrendingUp } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/sonner"
import { deleteArticle } from "@/lib/actions/articles"
import { Spinner } from "./ui/spinner"

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
}

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const },
  published: { label: "Published", variant: "default" as const },
  archived: { label: "Archived", variant: "outline" as const },
}

export const articlesColumns: ColumnDef<Article>[] = [
  {
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
  },
  {
    accessorKey: "coverImage",
    header: () => null,
    cell: ({ row }) => {
      const coverImage = row.getValue("coverImage") as string | null
      const title = row.getValue("title") as string

      return (
        <div className="w-24 h-16 relative rounded-md overflow-hidden bg-muted">
          {coverImage ? (
            <Image
              src={coverImage}
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
          <div className="font-medium">{title}</div>
          {excerpt && (
            <div className="text-sm text-muted-foreground line-clamp-1 max-w-md">
              {excerpt}
            </div>
          )}
        </>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as keyof typeof statusConfig
      const config = statusConfig[status] || statusConfig.draft

      return <Badge variant={config.variant}>{config.label}</Badge>
    },
  },
  {
    accessorKey: "viewCount",
    header: "Views",
    cell: ({ row }) => {
      const viewCount = row.getValue("viewCount") as number

      return (
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{viewCount.toLocaleString()}</span>
        </div>
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
          <div>{format(new Date(createdAt), "MMM d, yyyy")}</div>
          <div className="text-muted-foreground text-xs">
            Updated: {format(new Date(updatedAt), "MMM d, yyyy")}
          </div>
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const article = row.original
      const router = useRouter()
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
        } catch (error) {
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
                <Link href={`/articles/${article.id}/edit`}>
                  <Edit />
                  Edit article
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

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the article "{article.title}". This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? <Spinner /> : "I'm sure"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )
    },
  },
]
