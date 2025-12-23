"use client";

import type { MediaItem } from "@/lib/actions/media";
import { formatBytes } from "@/lib/utils";
import { MediaType } from "@simplist/db";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@simplist/ui/components/alert-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@simplist/ui/components/avatar";
import { Badge } from "@simplist/ui/components/badge";
import { Button } from "@simplist/ui/components/button";
import { Checkbox } from "@simplist/ui/components/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@simplist/ui/components/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@simplist/ui/components/tooltip";
import { ColumnDef } from "@tanstack/react-table";
import {
  Check,
  Copy,
  ExternalLink,
  ImageIcon,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ApplyBannerDialog } from "./apply-banner-dialog";

interface UseMediaColumnsOptions {
  onDelete: (id: string) => Promise<void>;
  isPro?: boolean;
  showUploadedBy?: boolean;
  projectId: string;
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

const TYPE_BADGE_VARIANTS: Record<
  MediaType,
  "default" | "secondary" | "outline"
> = {
  CONTENT: "secondary",
  BANNER: "default",
  AVATAR: "outline",
  OTHER: "outline",
};

// Actions cell component
const ActionsCell = ({
  media,
  onDelete,
  projectId,
}: {
  media: MediaItem;
  onDelete: (id: string) => Promise<void>;
  projectId: string;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showApplyBannerDialog, setShowApplyBannerDialog] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(media.url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(media.id);
      toast.success("Media deleted");
    } catch {
      toast.error("Failed to delete media");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleCopyLink}>
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.open(media.url, "_blank")}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in new tab
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowApplyBannerDialog(true)}>
            <ImageIcon className="mr-2 h-4 w-4" />
            Apply as banner
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete media?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{media.filename}&quot;. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ApplyBannerDialog
        open={showApplyBannerDialog}
        onOpenChange={setShowApplyBannerDialog}
        media={media}
        projectId={projectId}
      />
    </>
  );
};

export const useMediaColumns = ({
  onDelete,
  isPro = false,
  showUploadedBy = false,
  projectId,
}: UseMediaColumnsOptions): ColumnDef<MediaItem>[] => {
  return useMemo(() => {
    const columns: ColumnDef<MediaItem>[] = [];

    // Selection column (PRO only)
    if (isPro) {
      columns.push({
        id: "select",
        header: ({ table }) => (
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
      });
    }

    // Preview column
    columns.push({
      accessorKey: "preview",
      header: "",
      cell: ({ row }) => {
        const media = row.original;
        return (
          <div className="bg-muted relative h-10 w-10 overflow-hidden rounded-md">
            <Image
              src={media.url}
              alt={media.filename}
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    });

    // Filename column
    columns.push({
      accessorKey: "filename",
      header: "Name",
      cell: ({ row }) => {
        const filename = row.original.filename;
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="block max-w-[200px] truncate font-medium">
                {filename}
              </span>
            </TooltipTrigger>
            <TooltipContent>{filename}</TooltipContent>
          </Tooltip>
        );
      },
    });

    // Type column
    columns.push({
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <Badge variant={TYPE_BADGE_VARIANTS[type]} className="capitalize">
            {type.toLowerCase()}
          </Badge>
        );
      },
      filterFn: (row, id, value: string[]) => {
        return value.includes(row.getValue(id));
      },
    });

    // Size column
    columns.push({
      accessorKey: "size",
      header: "Size",
      cell: ({ row }) => formatBytes(row.original.size),
    });

    // Uploaded by column (conditional)
    if (showUploadedBy) {
      columns.push({
        accessorKey: "uploadedBy",
        header: "Uploaded by",
        cell: ({ row }) => {
          const uploadedBy = row.original.uploadedBy;
          if (!uploadedBy)
            return <span className="text-muted-foreground">—</span>;

          return (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={uploadedBy.image || undefined} />
                <AvatarFallback className="text-xs">
                  {uploadedBy.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="max-w-[100px] truncate text-sm">
                {uploadedBy.name || "Unknown"}
              </span>
            </div>
          );
        },
      });
    }

    // Date column
    columns.push({
      accessorKey: "createdAt",
      header: "Uploaded",
      cell: ({ row }) => formatDate(row.original.createdAt),
    });

    // Actions column
    columns.push({
      id: "actions",
      cell: ({ row }) => (
        <ActionsCell
          media={row.original}
          onDelete={onDelete}
          projectId={projectId}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    });

    return columns;
  }, [onDelete, isPro, showUploadedBy, projectId]);
};
