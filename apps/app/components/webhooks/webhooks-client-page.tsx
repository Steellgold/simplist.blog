"use client"

import { PageLayout } from "@/components/layout/page-layout"
import { useWebhooksColumns } from "@/components/webhooks/columns"
import { WebhooksDataTable } from "@/components/webhooks/webhooks-data-table"
import { buttonVariants } from "@simplist/ui/components/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@simplist/ui/components/empty"
import { ProgressLink } from "@simplist/ui/components/progress-button"
import { Plus, Webhook } from "lucide-react"
import Link from "next/link"
import { FC } from "react"
import type { WebhookListItem, WebhookProjectContext } from "./types"

type Props = {
  webhooks: WebhookListItem[]
  project: WebhookProjectContext
  maxWebhooks: number
}

export const WebhooksClientPage: FC<Props> = ({ webhooks, project, maxWebhooks }) => {
  const columns = useWebhooksColumns(project.slug)
  const isAtLimit = maxWebhooks !== -1 && webhooks.length >= maxWebhooks

  if (webhooks.length === 0) {
    return (
      <div className="flex min-h-[calc(90vh-4rem)] items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Webhook />
            </EmptyMedia>
            <EmptyTitle>No webhooks yet</EmptyTitle>
            <EmptyDescription>
              Create a webhook to receive notifications when articles are published or updated.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link className={buttonVariants({ variant: "default", size: "sm" })} href={`/${project.slug}/webhooks/new`}>
              <Plus />
              New webhook
            </Link>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return (
    <PageLayout
      title="Webhooks"
      description="Receive notifications when articles are published, scheduled, updated, or deleted."
      actions={
        <ProgressLink
          as={Link}
          href={`/${project.slug}/webhooks/new`}
          value={webhooks.length}
          max={maxWebhooks}
          variant="outline"
          className={isAtLimit ? "pointer-events-none opacity-50" : ""}
        >
          <Plus />
          New webhook
        </ProgressLink>
      }
    >
      <WebhooksDataTable columns={columns} data={webhooks} />
    </PageLayout>
  )
}