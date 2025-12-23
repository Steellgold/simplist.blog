"use client";

import { deleteApiKey } from "@/lib/actions/api-keys";
import { ConfirmDialog } from "@simplist/ui/components/confirm-dialog";
import { Button } from "@simplist/ui/components/button";
import { toast } from "@simplist/ui/components/sonner";
import { Spinner } from "@simplist/ui/components/spinner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { columns, type ApiKey } from "./columns";
import { ApiKeysDataTable } from "./data-table";

interface ApiKeysListProps {
  apiKeys: ApiKey[];
}

export const ApiKeysList = ({ apiKeys }: ApiKeysListProps) => {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!keyToDelete) return;

    setIsDeleting(true);

    toast.promise(deleteApiKey(keyToDelete), {
      loading: "Deleting API key...",
      success: () => {
        setDeleteDialogOpen(false);
        setKeyToDelete(null);
        setIsDeleting(false);
        router.refresh();
        return "API key deleted successfully";
      },
      error: (err: unknown) => {
        setIsDeleting(false);
        return err instanceof Error ? err.message : "Failed to delete API key";
      },
    });
  };

  const onDeleteClick = (id: string) => {
    setKeyToDelete(id);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <ApiKeysDataTable
        columns={columns}
        data={apiKeys}
        onDelete={onDeleteClick}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete API Key"
        description="Are you sure you want to delete this API key? This action cannot be undone and any applications using this key will lose access."
        confirmText={isDeleting ? <Spinner /> : "Delete"}
        disabled={isDeleting}
        variant="destructive"
      />
    </>
  );
};
