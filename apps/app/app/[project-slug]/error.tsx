"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react"
import { LayoutDashboardIcon } from "lucide-react"
import { Button, buttonVariants } from "@simplist/ui/components/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@simplist/ui/components/empty"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Props = {
  actions?: React.ReactNode[];
}

export function Error({ actions }: Props) {
  const router = useRouter();

  return (
    <Empty className="flex min-h-[calc(90vh-4rem)] items-center justify-center h-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertTriangle />
        </EmptyMedia>
        <EmptyTitle>An Error Occurred</EmptyTitle>
        <EmptyDescription>
          Something went wrong. Please try again.
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <div className="flex flex-row items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <RefreshCcw className="size-4" />
            Refresh
          </Button>

          <Link href="/" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <LayoutDashboardIcon />
            Go to Dashboard
          </Link>
        </div>
      </EmptyContent>
    </Empty>
  )
}

export default Error;