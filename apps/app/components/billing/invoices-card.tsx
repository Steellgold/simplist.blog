"use client"

import { BillingItem } from "@/components/billing/billing-item"
import type { BillingEntry } from "@/lib/stripe/types"
import { Button } from "@simplist/ui/components/button"
import { ButtonGroup } from "@simplist/ui/components/button-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@simplist/ui/components/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@simplist/ui/components/empty"
import { ItemGroup, ItemSeparator } from "@simplist/ui/components/item"
import { PiggyBank } from "lucide-react"
import React, { useState } from "react"

type InvoicesCardProps = {
  billingEntries: BillingEntry[]
}

export const InvoicesCard = ({ billingEntries }: InvoicesCardProps) => {
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 5

  if (billingEntries.length === 0) {
    return (
      <Card>
        <CardContent>
          <Empty>
            <EmptyHeader className="max-w-md">
              <EmptyMedia variant="icon">
                <PiggyBank />
              </EmptyMedia>

              <EmptyTitle>No billing history</EmptyTitle>
              <EmptyDescription>
                No invoices or payments have been generated yet.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  const totalPages = Math.ceil(billingEntries.length / itemsPerPage)
  const startIndex = currentPage * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentEntries = billingEntries.slice(startIndex, endIndex)

  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 0))
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>
          View your billing history and manage your subscriptions.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ItemGroup>
          {[...currentEntries].map((entry, index) => (
            <React.Fragment key={entry.id}>
              <BillingItem entry={entry} />
              {index !== currentEntries.length - 1 && <ItemSeparator />}
            </React.Fragment>
          ))}
        </ItemGroup>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, billingEntries.length)} of {billingEntries.length} entries
            </div>

            <div className="flex items-center space-x-2">
              <ButtonGroup>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 0}
                  className="text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages - 1}
                  className="text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Next</span>
                </Button>
              </ButtonGroup>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
