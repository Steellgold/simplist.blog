"use client";

import { ShieldAlert } from "lucide-react"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@simplist/ui/components/empty"

type Props = {
  actions?: React.ReactNode[];
}

export function Unauthorized({ actions }: Props) {
  return (
    <Empty className="flex min-h-[calc(90vh-4rem)] items-center justify-center h-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShieldAlert />
        </EmptyMedia>
        <EmptyTitle>Unauthorized Access</EmptyTitle>
        <EmptyDescription>
          You must be logged in to access this page.
        </EmptyDescription>
      </EmptyHeader>

      {actions && actions.length > 0 && (
        <EmptyContent>
          <div className="flex flex-row items-center gap-2">
            {actions.map((action, index) => (
              <div key={index}>{action}</div>
            ))}
          </div>
        </EmptyContent>
      )}
    </Empty>
  )
}

export default Unauthorized;