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
import { formatDistanceToNow } from "date-fns"
import { Eye } from "lucide-react"
import { useState } from "react"

interface RecentView {
  id: string
  articleTitle: string
  country: string
  device: string
  browser: string
  timeOnPage: number
  scrollDepth: number
  timestamp: string
  referrer: string | null
  referrerDomain: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
}

interface RecentActivityTableProps {
  data: RecentView[]
}

const ITEMS_PER_PAGE = 10

export const RecentActivityTable = ({ data }: RecentActivityTableProps) => {
  const [currentPage, setCurrentPage] = useState(0)

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE)
  const startIndex = currentPage * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentData = data.slice(startIndex, endIndex)

  const canGoPrevious = currentPage > 0
  const canGoNext = currentPage < totalPages - 1

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Article</TableHead>
                <TableHead className="whitespace-nowrap hidden sm:table-cell">Location & Device</TableHead>
                <TableHead className="whitespace-nowrap hidden md:table-cell">Traffic Source</TableHead>
                <TableHead className="text-right whitespace-nowrap">Time on Page</TableHead>
                <TableHead className="text-right whitespace-nowrap">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {currentData.length > 0 ? (
              currentData.map((view) => {
                const trafficInfo = []
                if (view.referrerDomain) trafficInfo.push(`from ${view.referrerDomain}`)
                if (view.utmSource) trafficInfo.push(`via ${view.utmSource}`)
                if (view.utmMedium) trafficInfo.push(`(${view.utmMedium})`)
                const trafficSummary = trafficInfo.length > 0 ? trafficInfo.join(" ") : "Direct"

                return (
                  <TableRow key={view.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Eye className="h-4 w-4 text-primary" />
                        </div>
                        <div className="font-medium truncate max-w-[200px] sm:max-w-none" title={view.articleTitle}>
                          {view.articleTitle}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="text-sm">
                        {view.country} • {view.device}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-sm text-muted-foreground max-w-xs truncate" title={trafficSummary}>
                        {trafficSummary}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-sm font-medium">{view.timeOnPage}s</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(view.timestamp), { addSuffix: true })}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No recent activity
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          {data.length > 0 ? (
            <>
              <span className="hidden sm:inline">Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} entries</span>
              <span className="sm:hidden">{Math.min(endIndex, data.length)} of {data.length}</span>
              {totalPages > 1 && (
                <span className="ml-2">• Page {currentPage + 1} of {totalPages}</span>
              )}
            </>
          ) : (
            "No entries"
          )}
        </div>
        <ButtonGroup>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!canGoPrevious}
            className="text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!canGoNext}
            className="text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">Next</span>
          </Button>
        </ButtonGroup>
      </div>
    </div>
  )
}
