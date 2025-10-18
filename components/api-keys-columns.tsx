"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ColumnDef } from "@tanstack/react-table"
import { Trash2 } from "lucide-react"

export type ApiKey = {
  id: string
  name: string
  key: string
  type: string
  permissions: string[]
  lastUsedAt: Date | null
  expiresAt: Date | null
  status: string
  createdAt: Date
}

const maskKey = (key: string) => {
  if (key.length <= 12) return key
  return `${key.substring(0, 10)}...${key.substring(key.length - 6)}`
}

const formatDate = (date: Date | null) => {
  if (!date) return "Never"
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const columns: ColumnDef<ApiKey>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("name")}</div>
    },
  },
  {
    accessorKey: "key",
    header: "API Key",
    cell: ({ row }) => {
      const key = row.getValue("key") as string
      const type = row.getValue("type") as string
      return (
        <div className="flex items-center gap-2">
          <code className="text-sm font-mono">
            {maskKey(key)}
          </code>
          <Badge variant={type === "public" ? "secondary" : "default"} className="text-xs">
            {type === "public" ? "PK" : "SK"}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return (
        <Badge variant={type === "public" ? "outline" : "default"}>
          {type === "public" ? "Public" : "Secret"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "permissions",
    header: "Permissions",
    cell: ({ row }) => {
      const permissions = row.getValue("permissions") as string[]
      return (
        <div className="flex flex-wrap gap-1">
          {permissions.map((permission) => (
            <Badge key={permission} variant="secondary" className="text-xs">
              {permission}
            </Badge>
          ))}
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground">
          {formatDate(row.getValue("createdAt"))}
        </div>
      )
    },
  },
  {
    accessorKey: "expiresAt",
    header: "Expires",
    cell: ({ row }) => {
      const expiresAt = row.getValue("expiresAt") as Date | null
      if (!expiresAt) {
        return <div className="text-sm text-muted-foreground">Never</div>
      }

      const now = new Date()
      const expDate = new Date(expiresAt)
      const isExpired = expDate < now
      const isExpiringSoon = !isExpired && expDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000 // 7 days

      return (
        <div className={`text-sm ${isExpired ? "text-destructive font-medium" : isExpiringSoon ? "text-orange-500" : "text-muted-foreground"}`}>
          {formatDate(expiresAt)}
          {isExpired && " (Expired)"}
          {/* {isExpiringSoon && !isExpired && " (Soon)"} */}
        </div>
      )
    },
  },
  {
    accessorKey: "lastUsedAt",
    header: "Last Used",
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground">
          {formatDate(row.getValue("lastUsedAt"))}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: () => <div className="sr-only">Actions</div>,
    cell: ({ row, table }) => {
      const apiKey = row.original
      const meta = table.options.meta as { onDelete?: (id: string) => void }

      return (
        <div className="text-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => meta.onDelete?.(apiKey.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <span className="sr-only">Delete API key</span>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]
