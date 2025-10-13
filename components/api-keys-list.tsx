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
import { useRouter } from "next/navigation"
import { useState } from "react"
import { columns, type ApiKey } from "./api-keys-columns"
import { ApiKeysDataTable } from "./api-keys-data-table"
import { Button } from "./ui/button"

interface ApiKeysListProps {
  apiKeys: ApiKey[]
}

export function ApiKeysList({ apiKeys }: ApiKeysListProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!keyToDelete) return

    setIsDeleting(true)
    try {
      await deleteApiKey(keyToDelete)
      toast.success("API key deleted successfully")
      setDeleteDialogOpen(false)
      setKeyToDelete(null)
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete API key")
    } finally {
      setIsDeleting(false)
    }
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
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
