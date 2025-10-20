"use client"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"
import { Eye } from "lucide-react"
import { useState } from "react"
import { ButtonGroup } from "./ui/button-group"

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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Article</TableHead>
              <TableHead>Location & Device</TableHead>
              <TableHead>Traffic Source</TableHead>
              <TableHead className="text-right">Time on Page</TableHead>
              <TableHead className="text-right">When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((view) => {
                const trafficInfo = []
                if (view.referrerDomain) trafficInfo.push(`from ${view.referrerDomain}`)
                if (view.utmSource) trafficInfo.push(`via ${view.utmSource}`)
                if (view.utmMedium) trafficInfo.push(`(${view.utmMedium})`)
                const trafficSummary = trafficInfo.length > 0 ? trafficInfo.join(' ') : 'Direct'

                return (
                  <TableRow key={view.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Eye className="h-4 w-4 text-primary" />
                        </div>
                        <div className="font-medium">{view.articleTitle}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {view.country} • {view.device}
                      </div>
                    </TableCell>
                    <TableCell>
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

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {data.length > 0 ? (
            <>
              Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} entries
              {totalPages > 1 && (
                <span className="ml-2">• Page {currentPage + 1} of {totalPages}</span>
              )}
            </>
          ) : (
            'No entries'
          )}
        </div>
        <ButtonGroup>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!canGoPrevious}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!canGoNext}
          >
            Next
          </Button>
        </ButtonGroup>
      </div>
    </div>
  )
}
