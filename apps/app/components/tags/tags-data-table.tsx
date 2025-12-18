"use client";

import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  ExportDropdown,
  type ExportColumn,
} from "@/components/export-dropdown";
import { ImportDialog, type ImportColumn } from "@/components/import-dialog";
import {
  bulkDeleteTags,
  bulkImportTags,
  type ImportTagInput,
  type TagWithMetadata,
} from "@/lib/actions/tags";
import { Button } from "@simplist/ui/components/button";
import { ButtonGroup } from "@simplist/ui/components/button-group";
import { ConfirmDialog } from "@simplist/ui/components/confirm-dialog";
import { Input } from "@simplist/ui/components/input";
import { toast } from "@simplist/ui/components/sonner";
import { Spinner } from "@simplist/ui/components/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@simplist/ui/components/table";

interface TagsDataTableProps {
  columns: ColumnDef<TagWithMetadata, unknown>[];
  data: TagWithMetadata[];
  projectId: string;
  canManageTags: boolean;
  isPro: boolean;
}

export const TagsDataTable = ({
  columns,
  data,
  projectId,
  canManageTags,
  isPro,
}: TagsDataTableProps) => {
  const router = useRouter();

  const STORAGE_KEY = "tags-table-column-visibility";

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      if (typeof window === "undefined") return {};
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    },
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Persist column visibility to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility));
  }, [columnVisibility]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    enableRowSelection: isPro && canManageTags,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  const handleBulkDelete = async () => {
    const ids = selectedRows.map((row) => row.original.id);

    setIsDeleting(true);

    try {
      const result = await bulkDeleteTags(ids, projectId);

      if (result.success) {
        toast.success(`Successfully deleted ${result.deletedCount} tag(s)`);
        setShowBulkDeleteDialog(false);
        setRowSelection({});
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete tags");
      }
    } catch {
      toast.error("Failed to delete tags");
    } finally {
      setIsDeleting(false);
    }
  };

  const exportColumns: ExportColumn[] = [
    { key: "name", header: "Name" },
    { key: "slug", header: "Slug" },
    { key: "description", header: "Description" },
    {
      key: "icon",
      header: "Icon",
      getValue: (item) => (item.icon as string) || "tag",
    },
    {
      key: "color",
      header: "Color",
      getValue: (item) => (item.color as string) || "",
    },
    {
      key: "articles",
      header: "Articles",
      getValue: (item) => (item._count as { articles: number })?.articles || 0,
    },
    {
      key: "createdAt",
      header: "Created At",
      getValue: (item) => new Date(item.createdAt as string).toISOString(),
    },
  ];

  const importColumns: ImportColumn[] = [
    { key: "name", header: "Name", required: true },
    { key: "icon", header: "Icon" },
    { key: "color", header: "Color" },
    { key: "description", header: "Description" },
  ];

  const handleImport = async (tags: ImportTagInput[]) => {
    const result = await bulkImportTags(projectId, tags);
    if (result.success) {
      router.refresh();
    }
    return result;
  };

  const tagsToExport =
    selectedCount > 0
      ? selectedRows.map(
          (row) => row.original as unknown as Record<string, unknown>,
        )
      : (data as unknown as Record<string, unknown>[]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <Input
          placeholder="Search tags by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-full sm:max-w-sm"
        />

        <div className="flex items-center gap-2">
          {isPro && selectedCount > 0 && canManageTags && (
            <ButtonGroup>
              <Button
                variant="outline-destructive"
                onClick={() => setShowBulkDeleteDialog(true)}
              >
                <Trash />
                Delete ({selectedCount})
              </Button>
            </ButtonGroup>
          )}

          <DataTableViewOptions table={table} />

          <ButtonGroup>
            <ExportDropdown
              data={tagsToExport}
              columns={exportColumns}
              filename="tags-export"
              selectedCount={selectedCount}
            />

            {canManageTags && (
              <ImportDialog<ImportTagInput>
                columns={importColumns}
                onImport={handleImport}
                title="Import tags"
                description="Upload a CSV, JSON, or XML file to import tags."
                entityName="tags"
              />
            )}
          </ButtonGroup>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="whitespace-nowrap">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="whitespace-nowrap">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No tags found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} tag(s)
        </div>
        <ButtonGroup>
          <Button
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </ButtonGroup>
      </div>

      <ConfirmDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
        onConfirm={handleBulkDelete}
        title="Delete multiple tags?"
        description={`This will permanently delete ${selectedCount} ${selectedCount === 1 ? "tag" : "tags"} and remove them from all associated articles. This action cannot be undone.`}
        confirmText={isDeleting ? <Spinner /> : "Delete all"}
        disabled={isDeleting}
        variant="destructive"
      />
    </div>
  );
};
