"use client"

import {
  AlertDialog, AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/sonner"
import { useDeleteApiKey } from "@/hooks/use-api-keys"
import { useState } from "react"
import { columns, type ApiKey } from "./api-keys-columns"
import { ApiKeysDataTable } from "./api-keys-data-table"
import { Button } from "./ui/button"
import { Spinner } from "./ui/spinner"

interface ApiKeysListProps {
  apiKeys: ApiKey[]
}

export const ApiKeysList = ({ apiKeys }: ApiKeysListProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null)

  const deleteApiKeyMutation = useDeleteApiKey()

  const handleDelete = async () => {
    if (!keyToDelete) return

    toast.promise(
      deleteApiKeyMutation.mutateAsync(keyToDelete),
      {
        loading: "Deleting API key...",
        success: () => {
          setDeleteDialogOpen(false)
          setKeyToDelete(null)
          return "API key deleted successfully"
        },
        error: (err: unknown) => err instanceof Error ? err.message : "Failed to delete API key",
      }
    )
  }

  const onDeleteClick = (id: string) => {
    setKeyToDelete(id)
    setDeleteDialogOpen(true)
  }

  return (
    <>
      <ApiKeysDataTable columns={columns} data={apiKeys} onDelete={onDeleteClick} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete API Key
            </AlertDialogTitle>
            
            <AlertDialogDescription>
              Are you sure you want to delete this API key? This action cannot be
              undone and any applications using this key will lose access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteApiKeyMutation.isPending}>
              Cancel
            </AlertDialogCancel>

            <Button
              onClick={handleDelete}
              disabled={deleteApiKeyMutation.isPending}
              variant="destructive"
            >
              {deleteApiKeyMutation.isPending ? <Spinner /> : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
