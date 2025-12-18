"use client";

import { PageLayout } from "@/components/layout/page-layout";
import { useWebhooksColumns } from "@/components/webhooks/columns";
import { WebhooksDataTable } from "@/components/webhooks/webhooks-data-table";
import { buttonVariants } from "@simplist/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@simplist/ui/components/empty";
import { Kbd } from "@simplist/ui/components/kbd";
import { ProgressLink } from "@simplist/ui/components/progress-button";
import { Plus, Webhook } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import type { WebhookListItem, WebhookProjectContext } from "./types";

type Props = {
  webhooks: WebhookListItem[];
  project: WebhookProjectContext;
  maxWebhooks: number;
};

export const WebhooksClientPage: FC<Props> = ({
  webhooks,
  project,
  maxWebhooks,
}) => {
  const router = useRouter();
  const columns = useWebhooksColumns(project.slug);
  const isAtLimit = maxWebhooks !== -1 && webhooks.length >= maxWebhooks;

  // Keyboard shortcut: N to create new webhook
  useHotkeys("n", () => router.push(`/${project.slug}/webhooks/new`), {
    enabled: !isAtLimit,
    enableOnFormTags: false,
  });

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
              Create a webhook to receive notifications when articles are
              published or updated.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link
              className={buttonVariants({ variant: "default" })}
              href={`/${project.slug}/webhooks/new`}
            >
              <Plus />
              New webhook
              <Kbd>N</Kbd>
            </Link>
          </EmptyContent>
        </Empty>
      </div>
    );
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
          variant="default"
          className={isAtLimit ? "pointer-events-none opacity-50" : ""}
        >
          <Plus />
          New webhook
          <Kbd>N</Kbd>
        </ProgressLink>
      }
    >
      <WebhooksDataTable columns={columns} data={webhooks} />
    </PageLayout>
  );
};
