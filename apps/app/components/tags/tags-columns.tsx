"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { useProjectContext } from "@/components/projects/context-provider";
import { TagApplyDialog } from "@/components/tags/tag-apply-dialog";
import { TagEditDialog } from "@/components/tags/tag-edit-dialog";
import { deleteTag, type TagWithMetadata } from "@/lib/actions/tags";
import {
  Copy,
  EllipsisVertical,
  FileText,
  PencilToSquare,
  Tags,
  TrashBin,
} from "@gravity-ui/icons";
import { Badge } from "@simplist/ui/components/badge";
import { Button } from "@simplist/ui/components/button";
import { Checkbox } from "@simplist/ui/components/checkbox";
import { ConfirmDialog } from "@simplist/ui/components/confirm-dialog";
import { CopyButton } from "@simplist/ui/components/copy-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@simplist/ui/components/dropdown-menu";
import { IconRender } from "@simplist/ui/components/icon-renderer";
import { Kbd } from "@simplist/ui/components/kbd";
import { toast } from "@simplist/ui/components/sonner";
import { Spinner } from "@simplist/ui/components/spinner";
import { getTagColorClasses } from "@simplist/ui/lib/color";
import type { IconsEnumType } from "@simplist/ui/lib/icons.enum";
import { cn } from "@simplist/ui/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const TagActionsCell = ({
  tag,
  canManageTags,
}: {
  tag: TagWithMetadata;
  canManageTags: boolean;
}) => {
  const router = useRouter();
  const { currentProject } = useProjectContext();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset isDeleting when dialog closes
  useEffect(() => {
    if (!showDeleteDialog) {
      setIsDeleting(false);
    }
  }, [showDeleteDialog]);

  const copyId = () => {
    navigator.clipboard.writeText(tag.id);
    toast.success("Tag ID copied to clipboard");
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteTag(tag.id, currentProject?.id || "");

      if (result.success) {
        toast.success(
          result.articlesAffected && result.articlesAffected > 0
            ? `Tag deleted. Removed from ${result.articlesAffected} article(s).`
            : "Tag deleted successfully",
        );
        setShowDeleteDialog(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete tag");
        setIsDeleting(false);
      }
    } catch {
      toast.error("Failed to delete tag");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <span className="sr-only">Open menu</span>
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem onClick={copyId}>
            <Copy />
            Copy ID
          </DropdownMenuItem>

          {tag._count.articles > 0 && (
            <DropdownMenuItem asChild>
              <Link
                href={`/${currentProject?.slug}/articles?tags=${encodeURIComponent(tag.name)}`}
              >
                <FileText />
                View articles ({tag._count.articles})
              </Link>
            </DropdownMenuItem>
          )}

          {canManageTags && (
            <>
              <DropdownMenuItem onClick={() => setShowApplyDialog(true)}>
                <Tags />
                Apply to articles
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <PencilToSquare />
                Edit tag
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <TrashBin className="text-destructive" />
                Delete tag
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete tag?"
        description={
          tag._count.articles > 0
            ? `This will permanently delete the tag "${tag.name}" and remove it from ${tag._count.articles} article(s). This action cannot be undone.`
            : `This will permanently delete the tag "${tag.name}". This action cannot be undone.`
        }
        confirmText={isDeleting ? <Spinner /> : "Delete"}
        disabled={isDeleting}
        variant="destructive"
      />

      {canManageTags && (
        <TagEditDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          tag={tag}
          projectId={currentProject?.id || ""}
        />
      )}

      {canManageTags && (
        <TagApplyDialog
          open={showApplyDialog}
          onOpenChange={setShowApplyDialog}
          tag={tag}
          projectId={currentProject?.id || ""}
        />
      )}
    </>
  );
};

type UseTagsColumnsOptions = {
  canManageTags: boolean;
};

export const useTagsColumns = ({
  canManageTags,
}: UseTagsColumnsOptions): ColumnDef<TagWithMetadata>[] => {
  const { currentProject } = useProjectContext();

  // Check if user has pro access for bulk operations
  const isPro = Boolean(
    currentProject?.subscriptionTier === "PRO" &&
    currentProject?.subscriptionExpiresAt &&
    new Date(currentProject.subscriptionExpiresAt) > new Date(),
  );

  const columns: ColumnDef<TagWithMetadata>[] = [];

  // Only add select column for Pro Persons
  if (isPro) {
    columns.push({
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center pl-2">
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
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center pl-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    });
  }

  return [
    ...columns,
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tag" />
      ),
      cell: ({ row }) => {
        const tag = row.original;
        const colorClass =
          getTagColorClasses(tag.color) || getTagColorClasses("GRAY");

        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-medium",
              colorClass,
            )}
          >
            <IconRender name={(tag.icon as IconsEnumType) || "tag"} size={12} />
            <span>{tag.name}</span>
          </span>
        );
      },
    },
    {
      accessorKey: "slug",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Slug" />
      ),
      cell: ({ row }) => {
        const slug = row.original.slug;
        if (!slug) {
          return <span className="text-muted-foreground">-</span>;
        }
        return (
          <CopyButton content={slug}>
            <Kbd>{slug}</Kbd>
          </CopyButton>
        );
      },
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => {
        const description = row.original.description;
        return (
          <div className="text-muted-foreground max-w-[200px] truncate text-sm">
            {description || "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "_count.articles",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Articles" />
      ),
      cell: ({ row }) => {
        const count = row.original._count.articles;
        return (
          <Badge variant={count > 0 ? "secondary" : "outline"}>
            {count} {count === 1 ? "article" : "articles"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated" />
      ),
      cell: ({ row }) => {
        const updatedAt = row.getValue("updatedAt") as Date;
        return (
          <div className="text-muted-foreground text-sm">
            {format(new Date(updatedAt), "MMM d, yyyy")}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <TagActionsCell tag={row.original} canManageTags={canManageTags} />
      ),
    },
  ];
};
