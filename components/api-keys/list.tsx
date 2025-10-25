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
import { deleteApiKey } from "@/lib/actions/api-keys"
import { useState } from "react"
import { columns, type ApiKey } from "./columns"
import { ApiKeysDataTable } from "./data-table"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useRouter } from "next/navigation"

interface ApiKeysListProps {
  apiKeys: ApiKey[]
}

export const ApiKeysList = ({ apiKeys }: ApiKeysListProps) => {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!keyToDelete) return

    setIsDeleting(true)

    toast.promise(
      deleteApiKey(keyToDelete),
      {
        loading: "Deleting API key...",
        success: () => {
          setDeleteDialogOpen(false)
          setKeyToDelete(null)
          setIsDeleting(false)
          router.refresh()
          return "API key deleted successfully"
        },
        error: (err: unknown) => {
          setIsDeleting(false)
          return err instanceof Error ? err.message : "Failed to delete API key"
        },
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
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>

            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              variant="destructive"
            >
              {isDeleting ? <Spinner /> : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
