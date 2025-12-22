"use client";

import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { useProjectContext } from "@/components/projects/context-provider";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
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
import { SearchX, Trash, TrendingUp, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  ExportDropdown,
  type ExportColumn,
} from "@/components/export-dropdown";
import { bulkDeleteArticles } from "@/lib/actions/articles";
import { Button, buttonVariants } from "@simplist/ui/components/button";
import { ButtonGroup } from "@simplist/ui/components/button-group";
import { ConfirmDialog } from "@simplist/ui/components/confirm-dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@simplist/ui/components/empty";
import { IconRender } from "@simplist/ui/components/icon-renderer";
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
import type { IconsEnumType } from "@simplist/ui/lib/icons.enum";
import Link from "next/link";

type Member = {
  id: string;
  name: string | null;
};

interface DataTableProps<
  TData extends {
    id: string;
    tags?: Array<{ name: string; icon?: string | null }>;
    author?: { id: string; name: string | null } | null;
  },
  TValue,
> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  members: Member[];
  importDialog?: React.ReactNode;
}

export const ArticlesDataTable = <
  TData extends {
    id: string;
    tags?: Array<{ name: string; icon?: string | null }>;
    author?: { id: string; name: string | null } | null;
  },
  TValue,
>({
  columns,
  data,
  members,
  importDialog,
}: DataTableProps<TData, TValue>) => {
  const router = useRouter();
  const { currentProject } = useProjectContext();

  const STORAGE_KEY = "articles-table-column-visibility";

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      if (typeof window === "undefined") return {};
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    },
  );

  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Persist column visibility to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility));
  }, [columnVisibility]);

  // Build filter options
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((item) => {
      const status = (item as any).status as string;
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  }, [data]);

  const statusOptions = [
    { label: "Draft", value: "draft", count: statusCounts["draft"] || 0 },
    {
      label: "Published",
      value: "published",
      count: statusCounts["published"] || 0,
    },
    {
      label: "Scheduled",
      value: "scheduled",
      count: statusCounts["scheduled"] || 0,
    },
    { label: "Deleted", value: "deleted", count: statusCounts["deleted"] || 0 },
  ];

  const tagOptions = useMemo(() => {
    const tagMap = new Map<string, string | null>();
    data.forEach((item) => {
      item.tags?.forEach((tag) => {
        if (!tagMap.has(tag.name)) {
          tagMap.set(tag.name, tag.icon ?? null);
        }
      });
    });
    return Array.from(tagMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, icon]) => ({
        label: name,
        value: name,
        iconNode: icon ? (
          <IconRender
            name={icon as IconsEnumType}
            className="text-muted-foreground size-4"
          />
        ) : undefined,
      }));
  }, [data]);

  const authorOptions = useMemo(() => {
    return members.map((member) => ({
      label: member.name || "Unknown",
      value: member.id,
    }));
  }, [members]);

  // Check if user has pro access for bulk operations
  const isPro = Boolean(
    currentProject?.subscriptionTier === "PRO" &&
    currentProject?.subscriptionExpiresAt &&
    new Date(currentProject.subscriptionExpiresAt) > new Date(),
  );

  // Filter out deleted articles unless explicitly selected in status filter
  const statusFilter = columnFilters.find((f) => f.id === "status");
  const statusValues = statusFilter?.value as string[] | undefined;
  const showDeleted = statusValues?.includes("deleted") ?? false;

  const filteredData = useMemo(() => {
    if (showDeleted) {
      return data;
    }
    return data.filter((item) => (item as any).status !== "deleted");
  }, [data, showDeleted]);

  const table = useReactTable({
    data: filteredData,
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
  });

  const isFiltered = table.getState().columnFilters.length > 0;
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  const handleBulkDelete = async () => {
    if (!currentProject?.id) return;

    const ids = selectedRows.map((row) => row.original.id);

    setIsDeleting(true);

    toast.promise(bulkDeleteArticles(ids, currentProject.id), {
      loading: `Deleting ${selectedCount} article(s)...`,
      success: () => {
        setShowBulkDeleteDialog(false);
        setRowSelection({});
        setIsDeleting(false);
        router.refresh();
        return `Successfully deleted ${selectedCount} article(s)`;
      },
      error: (error) => {
        setIsDeleting(false);
        return error.message || "Failed to delete articles";
      },
    });
  };

  const exportColumns: ExportColumn[] = [
    { key: "title", header: "Title" },
    { key: "slug", header: "Slug" },
    { key: "excerpt", header: "Excerpt" },
    { key: "content", header: "Content" },
    { key: "status", header: "Status" },
    {
      key: "variants",
      header: "Variants",
      getValue: (item) => {
        const variants = item.variants as
          | Array<{
              lang: string;
              title: string;
              excerpt: string | null;
              content: string;
            }>
          | undefined;
        return variants && variants.length > 0
          ? JSON.stringify(
              variants.map((v) => ({
                lang: v.lang,
                title: v.title,
                excerpt: v.excerpt || "",
                content: v.content,
              })),
            )
          : "";
      },
    },
    { key: "coverImage", header: "Cover Image" },
    { key: "viewCount", header: "Views" },
    { key: "wordCount", header: "Word Count" },
    { key: "readTimeMinutes", header: "Read Time (min)" },
    {
      key: "publishedAt",
      header: "Published At",
      getValue: (item) =>
        item.publishedAt
          ? new Date(item.publishedAt as string).toISOString()
          : "",
    },
    {
      key: "createdAt",
      header: "Created At",
      getValue: (item) => new Date(item.createdAt as string).toISOString(),
    },
  ];

  const articlesToExport =
    selectedCount > 0
      ? selectedRows.map(
          (row) => row.original as unknown as Record<string, unknown>,
        )
      : (data as unknown as Record<string, unknown>[]);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Input
            placeholder="Filter articles..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />

          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Status"
              options={statusOptions}
            />
          )}

          {tagOptions.length > 0 && table.getColumn("tags") && (
            <DataTableFacetedFilter
              column={table.getColumn("tags")}
              title="Tags"
              options={tagOptions}
            />
          )}

          {members.length > 1 && table.getColumn("author") && (
            <DataTableFacetedFilter
              column={table.getColumn("author")}
              title="Author"
              options={authorOptions}
            />
          )}

          {isFiltered && (
            <Button variant="ghost" onClick={() => table.resetColumnFilters()}>
              Reset
              <X />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isPro && selectedCount > 0 && (
            <ButtonGroup>
              <Link
                href={`/${currentProject?.slug}/analytics?articles=${selectedRows.map((row) => row.original.id).join(",")}`}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                })}
              >
                <TrendingUp />
                Analytics
              </Link>

              <Button
                variant="outline-destructive"
                onClick={() => setShowBulkDeleteDialog(true)}
              >
                <Trash />
                Delete
              </Button>
            </ButtonGroup>
          )}

          <DataTableViewOptions table={table} />

          <ButtonGroup>
            <ExportDropdown
              data={articlesToExport}
              columns={exportColumns}
              filename="articles-export"
              selectedCount={selectedCount}
            />

            {importDialog}
          </ButtonGroup>
        </div>
      </div>

      {/* Table */}
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
                      <EmptyTitle>No articles found</EmptyTitle>
                      <EmptyDescription>
                        No articles match your current filters.
                      </EmptyDescription>
                    </EmptyHeader>
                    {isFiltered && (
                      <EmptyContent>
                        <Button
                          variant="outline"
                          onClick={() => table.resetColumnFilters()}
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

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          {table.getFilteredRowModel().rows.length} article(s)
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
        title="Delete multiple articles?"
        description={`This will permanently delete ${selectedCount} ${selectedCount === 1 ? "article" : "articles"}. This action cannot be undone.`}
        confirmText={isDeleting ? <Spinner /> : "Delete all"}
        disabled={isDeleting}
        variant="destructive"
      />
    </div>
  );
};
