"use client";

import type { MediaItem } from "@/lib/actions/media";
import { formatBytes } from "@/lib/utils";
import {
  ArrowUpRightFromSquare,
  Check,
  Copy,
  EllipsisVertical,
  Picture,
  TrashBin,
} from "@gravity-ui/icons";
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
import { cn } from "@simplist/ui/lib/utils";
import type { MouseEvent } from "react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { ApplyBannerDialog } from "./apply-banner-dialog";

interface MediaCardProps {
  media: MediaItem;
  onDelete: (id: string) => Promise<void>;
  selected?: boolean;
  onToggleSelect?: () => void;
  projectId: string;
}

export const MediaCard = ({
  media,
  selected = false,
  projectId,
  onDelete,
  onToggleSelect,
}: MediaCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showApplyBannerDialog, setShowApplyBannerDialog] = useState(false);

  const handleCopyLink = async (e?: MouseEvent) => {
    e?.stopPropagation();
    toast.promise(navigator.clipboard.writeText(media.url), {
      loading: "Copying link...",
      success: "Link copied to clipboard",
      error: "Failed to copy link",
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    toast.promise(onDelete(media.id), {
      loading: "Deleting media...",
      success: "Media deleted",
      error: "Failed to delete media",
    });
  };

  return (
    <>
      <div
        className={cn(
          "group bg-card relative overflow-hidden rounded-lg border transition-all",
          selected && "ring-primary ring-2",
        )}
      >
        {/* Selection checkbox */}
        {onToggleSelect && (
          <div className="absolute top-2 left-2 z-10">
            <div className="bg-background/10 flex items-center justify-center rounded-md px-1 py-1 backdrop-blur-sm">
              <Checkbox
                checked={selected}
                onCheckedChange={onToggleSelect}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

        {/* Image */}
        <div className="bg-muted relative aspect-square">
          <Image
            src={media.url}
            alt={media.filename}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
          />

          {/* Hover overlay with quick actions */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
            <Button size="icon-sm" variant="outline" onClick={handleCopyLink}>
              {copied ? <Check /> : <Copy />}
            </Button>

            <Button
              size="icon-sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                window.open(media.url, "_blank");
              }}
            >
              <ArrowUpRightFromSquare />
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="p-2">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0 flex-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="truncate text-sm font-medium">
                    {media.filename}
                  </p>
                </TooltipTrigger>

                <TooltipContent>{media.filename}</TooltipContent>
              </Tooltip>

              <p className="text-muted-foreground text-xs">
                {formatBytes(media.size)}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleCopyLink()}>
                  <Copy />
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => window.open(media.url, "_blank")}
                >
                  <ArrowUpRightFromSquare />
                  Open in new tab
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowApplyBannerDialog(true)}
                >
                  <Picture />
                  Apply as banner
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <TrashBin className="text-destructive" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
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

      {/* Apply as banner dialog */}
      <ApplyBannerDialog
        open={showApplyBannerDialog}
        onOpenChange={setShowApplyBannerDialog}
        media={media}
        projectId={projectId}
      />
    </>
  );
};
