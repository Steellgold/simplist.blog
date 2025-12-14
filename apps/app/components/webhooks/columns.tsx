"use client"

import { deleteWebhook, testWebhook, updateWebhook } from "@/lib/actions/webhooks"
import { Badge } from "@simplist/ui/components/badge"
import { Button } from "@simplist/ui/components/button"
import { ConfirmDialog } from "@simplist/ui/components/confirm-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemLink,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@simplist/ui/components/dropdown-menu"
import { toast } from "@simplist/ui/components/sonner"
import { Spinner } from "@simplist/ui/components/spinner"
import { ColumnDef } from "@tanstack/react-table"
import {
  AlertTriangle,
  CheckCircle,
  Copy,
  ExternalLink,
  History,
  MoreVertical,
  Pencil,
  Play,
  Trash2,
  Webhook,
  WebhookOff,
  XCircle
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import type { WebhookListItem } from "./types"
import { formatDate } from "./utils"

type WebhookWithProject = WebhookListItem & {
  projectSlug: string
}

const WebhookActionsCell = ({ webhook }: { webhook: WebhookWithProject }) => {
  const router = useRouter()
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!deleteDialog) {
      setIsDeleting(false)
    }
  }, [deleteDialog])

  const copyUrl = () => {
    navigator.clipboard.writeText(webhook.url)
    toast.success("URL copied to clipboard")
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    toast.promise(deleteWebhook(webhook.id), {
      loading: "Deleting webhook...",
      success: () => {
        setDeleteDialog(false)
        setIsDeleting(false)
        router.refresh()
        return `Webhook "${webhook.name}" deleted`
      },
      error: (err) => {
        setIsDeleting(false)
        return err instanceof Error ? err.message : "Failed to delete webhook"
      },
    })
  }

  const handleToggleStatus = () => {
    const newStatus = webhook.status === "active" ? "disabled" : "active"

    startTransition(() => {
      toast.promise(
        updateWebhook(webhook.id, webhook.projectId || "", { status: newStatus }), {
          loading: newStatus === "active" ? "Enabling..." : "Disabling...",
          success: () => {
            router.refresh()
            return newStatus === "active" ? "Webhook enabled" : "Webhook disabled"
          },
          error: (err) => (err instanceof Error ? err.message : "Failed to update"),
        }
      )
    })
  }

  const handleTest = () => {
    startTransition(() => {
      toast.promise(testWebhook(webhook.id), {
        loading: "Sending test...",
        success: (result) => {
          if (result.success) {
            return `Test sent successfully (HTTP ${result.statusCode})`
          }
          throw new Error(result.error)
        },
        error: (err) => (err instanceof Error ? err.message : "Test failed"),
      })
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" disabled={isPending}>
            <span className="sr-only">Open menu</span>
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem onClick={copyUrl}>
            <Copy />
            Copy URL
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItemLink as={Link} href={`/${webhook.projectSlug}/webhooks/${webhook.id}`}>
            <History />
            View dashboard
          </DropdownMenuItemLink>

          <DropdownMenuItemLink as={Link} href={`/${webhook.projectSlug}/webhooks/${webhook.id}/edit`}>
            <Pencil />
            Edit configuration
          </DropdownMenuItemLink>

          <DropdownMenuItem onClick={handleTest}>
            <Play />
            Send test
          </DropdownMenuItem>

          <DropdownMenuItemLink as={Link} href={webhook.url} rel="noopener noreferrer">
            <ExternalLink />
            Open URL
          </DropdownMenuItemLink>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleToggleStatus}>
            {webhook.status === "active" ? (
              <>
                <WebhookOff />
                Disable
              </>
            ) : (
              <>
                <Webhook />
                Enable
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="text-destructive" />
            Delete webhook
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={deleteDialog}
        onOpenChange={setDeleteDialog}
        onConfirm={handleDelete}
        title="Delete webhook?"
        description={`This will permanently delete the webhook "${webhook.name}". This will also delete all delivery history.`}
        confirmText={isDeleting ? <Spinner /> : "Delete"}
        disabled={isDeleting}
        variant="destructive"
      />
    </>
  )
}

export const useWebhooksColumns = (projectSlug: string): ColumnDef<WebhookListItem>[] => {
  return [
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const webhook = row.original
        const isActive = webhook.status === "active"
        
        return (
          <div className="flex items-center gap-2">
            <Badge
              variant={isActive ? "default" : "secondary"}
              className="shrink-0"
            >
              {isActive ? (
                <>
                  <CheckCircle />
                  Active
                </>
              ) : (
                <>
                  <XCircle />
                  Disabled
                </>
              )}
            </Badge>
            
            {webhook.failureCount > 0 && (
              <Badge variant="destructive" className="shrink-0">
                <AlertTriangle />
                {webhook.failureCount}
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const webhook = row.original
        
        return (
          <div className="space-y-1">
            <div className="font-medium truncate max-w-[200px]" title={webhook.name}>
              {webhook.name}
            </div>
            <div className="text-sm text-muted-foreground truncate max-w-[200px] hidden sm:block" title={webhook.url}>
              {webhook.url}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "events",
      header: "Events",
      cell: ({ row }) => {
        const webhook = row.original
        
        return (
          <div className="flex flex-wrap gap-1">
            {webhook.events.slice(0, 2).map((event) => (
              <Badge key={event} variant="outline" className="text-xs">
                {event.replace("article.", "")}
              </Badge>
            ))}
            {webhook.events.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{webhook.events.length - 2}
              </span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "lastSentAt",
      header: "Last Sent",
      cell: ({ row }) => {
        const webhook = row.original
        
        return (
          <div className="text-sm">
            {webhook.lastSentAt ? formatDate(webhook.lastSentAt) : "Never"}
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const webhook = row.original
        
        return (
          <div className="text-sm">
            {formatDate(webhook.createdAt)}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <WebhookActionsCell 
          webhook={{ ...row.original, projectSlug, projectId: row.original.projectId || "" }} 
        />
      ),
    },
  ]
}