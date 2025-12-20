"use client";

import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import type { MediaItem } from "@/lib/actions/media";
import { formatBytes } from "@/lib/utils";
import { MediaType } from "@simplist/db";
import { Button } from "@simplist/ui/components/button";
import { ButtonGroup } from "@simplist/ui/components/button-group";
import { Checkbox } from "@simplist/ui/components/checkbox";
import { ConfirmDialog } from "@simplist/ui/components/confirm-dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@simplist/ui/components/empty";
import { Input } from "@simplist/ui/components/input";
import { Spinner } from "@simplist/ui/components/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@simplist/ui/components/table";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@simplist/ui/components/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@simplist/ui/components/tooltip";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Grid3X3, List, Search, SearchX, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { MediaCard } from "./media-card";

type ViewMode = "list" | "grid";

type StorageByType = {
  type: MediaType;
  count: number;
  size: number;
};

interface MediaDataTableProps {
  columns: ColumnDef<MediaItem>[];
  data: MediaItem[];
  onDelete: (id: string) => Promise<void>;
  onBulkDelete: (ids: string[]) => Promise<void>;
  isPro?: boolean;
  isLoading?: boolean;
  totalPages?: number;
  currentPage?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onSearch?: (query: string) => void;
  onFilterChange?: (type: MediaType | undefined) => void;
  storageUsed?: number;
  storageLimit?: number;
  storageByType?: StorageByType[];
  projectId: string;
}

const STORAGE_KEY_VIEW = "media-view-mode";
const STORAGE_KEY_VISIBILITY = "media-table-column-visibility";

const TYPE_COLORS: Record<MediaType, string> = {
  CONTENT: "bg-blue-500",
  BANNER: "bg-emerald-500",
  AVATAR: "bg-amber-500",
  OTHER: "bg-purple-500",
};

export const MediaDataTable = ({
  columns,
  data,
  onDelete,
  onBulkDelete,
  isPro = false,
  isLoading = false,
  totalPages = 1,
  currentPage = 1,
  total = 0,
  onPageChange,
  onSearch,
  onFilterChange,
  storageUsed = 0,
  storageLimit = 0,
  storageByType = [],
  projectId,
}: MediaDataTableProps) => {
  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "list";
    return (localStorage.getItem(STORAGE_KEY_VIEW) as ViewMode) || "list";
  });

  // Table state
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      if (typeof window === "undefined") return {};
      const saved = localStorage.getItem(STORAGE_KEY_VISIBILITY);
      return saved ? JSON.parse(saved) : {};
    },
  );
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [searchValue, setSearchValue] = useState("");

  // Bulk delete state
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Persist view mode
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VIEW, viewMode);
  }, [viewMode]);

  // Persist column visibility
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY_VISIBILITY,
      JSON.stringify(columnVisibility),
    );
  }, [columnVisibility]);

  // Type filter options
  const typeOptions = [
    { label: "Content", value: "CONTENT" },
    { label: "Banner", value: "BANNER" },
    { label: "Avatar", value: "AVATAR" },
    { label: "Other", value: "OTHER" },
  ];

  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: isPro,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    pageCount: totalPages,
  });

  const isFiltered =
    table.getState().columnFilters.length > 0 || searchValue !== "";
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  // Get filtered data for grid view (uses TanStack table filtering)
  const filteredData = table
    .getFilteredRowModel()
    .rows.map((row) => row.original);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchValue);
  };

  const handleClearFilters = () => {
    setSearchValue("");
    table.resetColumnFilters();
    onSearch?.("");
    onFilterChange?.(undefined);
  };

  const handleBulkDelete = async () => {
    // Use the appropriate selection based on view mode
    const ids =
      viewMode === "list"
        ? selectedRows.map((row) => row.original.id)
        : Array.from(gridSelectedIds);

    if (ids.length === 0) return;

    setIsDeleting(true);

    try {
      await onBulkDelete(ids);
      setRowSelection({});
      setGridSelectedIds(new Set());
    } finally {
      setIsDeleting(false);
      setShowBulkDeleteDialog(false);
    }
  };

  // Grid selection state
  const [gridSelectedIds, setGridSelectedIds] = useState<Set<string>>(
    new Set(),
  );

  const toggleGridSelection = (id: string) => {
    setGridSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Sync grid selection with row selection when switching views
  useEffect(() => {
    if (viewMode === "list") setGridSelectedIds(new Set());
    else setRowSelection({});
  }, [viewMode]);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search files..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="h-8 w-[150px] pl-8 lg:w-[250px]"
              />
            </div>
          </form>

          {/* Type filter */}
          {table.getColumn("type") && (
            <DataTableFacetedFilter
              column={table.getColumn("type")}
              title="Type"
              options={typeOptions}
            />
          )}

          {/* Clear filters */}
          {isFiltered && (
            <Button variant="ghost" onClick={handleClearFilters}>
              Reset
              <X />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Storage usage - segmented by type */}
          {storageLimit > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-2">
                  <div className="bg-mute flex h-2 w-24 overflow-hidden rounded-full">
                    {storageByType.map((item) => {
                      const percentage = (item.size / storageLimit) * 100;
                      return (
                        <div
                          key={item.type}
                          className={`h-full ${TYPE_COLORS[item.type]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      );
                    })}
                  </div>

                  <span className="text-muted-foreground text-xs whitespace-nowrap">
                    {formatBytes(storageUsed)} / {formatBytes(storageLimit)}
                  </span>
                </div>
              </TooltipTrigger>

              <TooltipContent className="flex flex-col gap-1">
                <span className="font-medium">Storage used</span>
                {storageByType.map((item) => (
                  <div
                    key={item.type}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span
                      className={`size-2 rounded-sm ${TYPE_COLORS[item.type]}`}
                    />

                    <span className="capitalize">
                      {item.type.toLowerCase()}
                    </span>

                    <span className="text-muted-foreground">
                      {formatBytes(item.size)}
                    </span>
                  </div>
                ))}
              </TooltipContent>
            </Tooltip>
          )}

          {viewMode === "list" && <DataTableViewOptions table={table} />}

          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => value && setViewMode(value as ViewMode)}
            className="rounded-md border"
          >
            <ToggleGroupItem aria-label="List view" value="list">
              <List />
            </ToggleGroupItem>

            <ToggleGroupItem aria-label="Grid view" value="grid">
              <Grid3X3 />
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Bulk delete */}
          {isPro && (selectedCount > 0 || gridSelectedIds.size > 0) && (
            <Button
              variant="outline-destructive"
              onClick={() => setShowBulkDeleteDialog(true)}
            >
              <Trash2 />
              Delete{" "}
              {viewMode === "list" ? selectedCount : gridSelectedIds.size}{" "}
              file(s)
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        viewMode === "list" ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="bg-muted aspect-square animate-pulse rounded-lg"
              />
            ))}
          </div>
        )
      ) : viewMode === "list" ? (
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
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
                      <TableCell key={cell.id}>
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
                  <TableCell colSpan={columns.length} className="h-64">
                    <Empty className="border-none">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <SearchX />
                        </EmptyMedia>
                        <EmptyTitle>No files found</EmptyTitle>
                        <EmptyDescription>
                          No files match your current filters.
                        </EmptyDescription>
                      </EmptyHeader>

                      {isFiltered && (
                        <EmptyContent>
                          <Button
                            variant="outline"
                            onClick={handleClearFilters}
                          >
                            Clear filters
                          </Button>
                        </EmptyContent>
                      )}
                    </Empty>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Grid select all */}
          {isPro && filteredData.length > 0 && (
            <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={
                  gridSelectedIds.size === filteredData.length
                    ? true
                    : gridSelectedIds.size > 0
                      ? "indeterminate"
                      : false
                }
                onCheckedChange={(checked) => {
                  if (checked) {
                    setGridSelectedIds(
                      new Set(filteredData.map((item) => item.id)),
                    );
                  } else {
                    setGridSelectedIds(new Set());
                  }
                }}
              />
              Select all
            </label>
          )}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {filteredData.length === 0 ? (
              <div className="col-span-full">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <SearchX />
                    </EmptyMedia>
                    <EmptyTitle>No files found</EmptyTitle>
                    <EmptyDescription>
                      No files match your current filters.
                    </EmptyDescription>
                  </EmptyHeader>

                  {isFiltered && (
                    <EmptyContent>
                      <Button variant="outline" onClick={handleClearFilters}>
                        Clear filters
                      </Button>
                    </EmptyContent>
                  )}
                </Empty>
              </div>
            ) : (
              filteredData.map((item) => (
                <MediaCard
                  key={item.id}
                  media={item}
                  onDelete={onDelete}
                  selected={isPro ? gridSelectedIds.has(item.id) : undefined}
                  onToggleSelect={
                    isPro ? () => toggleGridSelection(item.id) : undefined
                  }
                  projectId={projectId}
                />
              ))
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          {total} {total === 1 ? "file" : "files"}
        </div>

        <ButtonGroup>
          <Button
            variant="outline"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
          >
            Previous
          </Button>

          <Button
            variant="outline"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
          >
            Next
          </Button>
        </ButtonGroup>
      </div>

      {/* Bulk delete dialog */}
      <ConfirmDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
        onConfirm={handleBulkDelete}
        title={`Delete ${viewMode === "list" ? selectedCount : gridSelectedIds.size} file(s)?`}
        description="This will permanently delete the selected files. This action cannot be undone."
        confirmText={isDeleting ? <Spinner /> : "Delete all"}
        disabled={isDeleting}
        variant="destructive"
      />
    </div>
  );
};
