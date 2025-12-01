"use client"

import { useProjectContext } from "@/components/projects/context-provider"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { Trash, TrendingUp, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { bulkDeleteArticles } from "@/lib/actions/articles"
import { ConfirmDialog } from "@simplist/ui/components/confirm-dialog"
import { Button, buttonVariants } from "@simplist/ui/components/button"
import { ButtonGroup } from "@simplist/ui/components/button-group"
import { Input } from "@simplist/ui/components/input"
import { toast } from "@simplist/ui/components/sonner"
import { Spinner } from "@simplist/ui/components/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@simplist/ui/components/table"
import Link from "next/link"

interface DataTableProps<TData extends { id: string }, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export const ArticlesDataTable = <TData extends { id: string }, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) => {
  const router = useRouter()
  const { currentProject } = useProjectContext()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Check if user has pro access for bulk operations
  const isPro = Boolean(currentProject?.subscriptionTier === "PRO" &&
    currentProject?.subscriptionExpiresAt &&
    new Date(currentProject.subscriptionExpiresAt) > new Date())

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
    enableRowSelection: isPro, // Only enable row selection for Pro users
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length

  const handleBulkDelete = async () => {
    const ids = selectedRows.map((row) => row.original.id)

    setIsDeleting(true)

    toast.promise(
      bulkDeleteArticles(ids),
      {
        loading: `Deleting ${selectedCount} article(s)...`,
        success: () => {
          setShowBulkDeleteDialog(false)
          setRowSelection({})
          setIsDeleting(false)
          router.refresh()
          return `Successfully deleted ${selectedCount} article(s)`
        },
        error: (error) => {
          setIsDeleting(false)
          // Show the specific error message from the server
          return error.message || "Failed to delete articles"
        },
      }
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <Input
          placeholder="Search articles by title..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="w-full sm:max-w-sm"
        />

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
              size="sm"
              onClick={() => setShowBulkDeleteDialog(true)}
            >
              <Trash />
              Delete
            </Button>
          </ButtonGroup>
        )}
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
                              header.getContext()
                            )}
                      </TableHead>
                    )
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
                          cell.getContext()
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
                    No articles found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          {isPro && selectedCount > 0 ? (
            <span>{selectedCount} of {table.getFilteredRowModel().rows.length} row(s) selected</span>
          ) : (
            <span>{table.getFilteredRowModel().rows.length} article(s) total</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <ButtonGroup>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
            </Button>
          </ButtonGroup>
        </div>
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
  )
}
