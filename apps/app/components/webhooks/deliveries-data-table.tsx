"use client"

import { Button } from "@simplist/ui/components/button"
import { ButtonGroup } from "@simplist/ui/components/button-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@simplist/ui/components/table"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { useState } from "react"

type Delivery = {
  id: string
  status: string
  statusCode: number | null
  error: string | null
  response: unknown
  attemptedAt: Date
}

interface DeliveriesDataTableProps {
  columns: ColumnDef<Delivery, any>[]
  data: Delivery[]
  onLoadMore?: () => void
  hasMore?: boolean
  isLoading?: boolean
}

export const DeliveriesDataTable = ({ 
  columns, 
  data, 
  onLoadMore, 
  hasMore, 
  isLoading 
}: DeliveriesDataTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 50, // Show more items per page for deliveries
      },
    },
  })

  return (
    <div className="space-y-4">
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
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="whitespace-nowrap relative">
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
                    <div className="text-muted-foreground">
                      <p className="text-sm">No deliveries yet</p>
                      <p className="text-xs">Deliveries will appear here once the webhook is triggered</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          <span>{table.getFilteredRowModel().rows.length} delivery(s) shown</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <ButtonGroup>
            {/* Standard table pagination */}
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
            
            {/* Load more from server */}
            {hasMore && onLoadMore && (
              <Button
                variant="outline"
                size="sm"
                onClick={onLoadMore}
                disabled={isLoading}
                className="text-xs sm:text-sm"
              >
                {isLoading ? "Loading..." : "Load More"}
              </Button>
            )}
          </ButtonGroup>
        </div>
      </div>
    </div>
  )
}