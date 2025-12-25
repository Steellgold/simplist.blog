"use client";

import { PageLayout } from "@/components/layout/page-layout";
import { useDeliveriesColumns } from "@/components/webhooks/deliveries-columns";
import { DeliveriesDataTable } from "@/components/webhooks/deliveries-data-table";
import {
  deleteWebhook,
  getWebhookDeliveries,
  testWebhook,
  updateWebhook,
} from "@/lib/actions/webhooks";
import {
  ArrowUpRightFromSquare,
  ChevronLeft, CircleCheck, CircleCheckFill, CircleXmarkFill, Copy,
  EllipsisVertical,
  Pencil,
  Play,
  TrashBin,
  TriangleExclamationFill
} from "@gravity-ui/icons";
import { Badge } from "@simplist/ui/components/badge";
import { Button, buttonVariants } from "@simplist/ui/components/button";
import { ButtonGroup } from "@simplist/ui/components/button-group";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@simplist/ui/components/card";
import { ConfirmDialog } from "@simplist/ui/components/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemLink,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@simplist/ui/components/dropdown-menu";
import { Webhook, WebhookOff } from "@simplist/ui/components/icons";
import { toast } from "@simplist/ui/components/sonner";
import Link from "next/link";
import type { ComponentType } from "react";
import { FC, useState, useTransition } from "react";
import type { WebhookFormData } from "./types";
import { formatDate } from "./utils";

type Delivery = {
  id: string;
  status: string;
  statusCode: number | null;
  error: string | null;
  response: unknown;
  attemptedAt: Date;
};

type Props = {
  webhook: WebhookFormData & {
    url: string;
    failureCount: number;
    lastSentAt?: Date | null;
    createdAt: Date;
    projectId: string;
  };
  projectSlug: string;
  initialDeliveries: Delivery[];
  initialTotal: number;
};

const ITEMS_PER_PAGE = 10;

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  suffix = "",
  variant = "default",
}: {
  title: string;
  value: number | string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  suffix?: string;
  variant?: "default" | "destructive";
}) => (
  <Card>
    <CardHeader className="-mb-6">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <CardAction>
        <Icon
          className={`h-4 w-4 ${variant === "destructive" ? "text-destructive" : "text-muted-foreground"}`}
        />
      </CardAction>
    </CardHeader>

    <CardContent>
      <div
        className={`text-2xl font-bold ${variant === "destructive" ? "text-destructive" : ""}`}
      >
        {value}
        {suffix}
      </div>
      <p className="text-muted-foreground text-xs">{description}</p>
    </CardContent>
  </Card>
);

export const WebhookDashboardPage: FC<Props> = ({
  webhook,
  projectSlug,
  initialDeliveries,
  initialTotal,
}) => {
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const [total, setTotal] = useState(initialTotal);
  const [offset, setOffset] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns = useDeliveriesColumns(projectSlug);

  const loadMore = async () => {
    setIsLoadingMore(true);
    try {
      const newOffset = offset + ITEMS_PER_PAGE;
      const result = await getWebhookDeliveries(webhook.id, {
        limit: ITEMS_PER_PAGE,
        offset: newOffset,
      });
      setDeliveries([...deliveries, ...result.deliveries]);
      setTotal(result.total);
      setOffset(newOffset);
    } catch (error) {
      toast.error("Failed to load more deliveries");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleToggleStatus = () => {
    const newStatus = webhook.status === "active" ? "disabled" : "active";

    startTransition(() => {
      toast.promise(
        updateWebhook(webhook.id, webhook.projectId, { status: newStatus }),
        {
          loading: newStatus === "active" ? "Enabling..." : "Disabling...",
          success: () => {
            return newStatus === "active"
              ? "Webhook enabled"
              : "Webhook disabled";
          },
          error: (err) =>
            err instanceof Error ? err.message : "Failed to update",
        },
      );
    });
  };

  const handleTest = () => {
    startTransition(() => {
      toast.promise(testWebhook(webhook.id), {
        loading: "Sending test...",
        success: (result) => {
          if (result.success) {
            return `Test sent successfully (HTTP ${result.statusCode})`;
          }
          throw new Error(result.error);
        },
        error: (err) => (err instanceof Error ? err.message : "Test failed"),
      });
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    toast.promise(deleteWebhook(webhook.id), {
      loading: "Deleting webhook...",
      success: () => {
        setDeleteDialog(false);
        setIsDeleting(false);
        return `Webhook "${webhook.name}" deleted`;
      },
      error: (err) => {
        setIsDeleting(false);
        return err instanceof Error ? err.message : "Failed to delete webhook";
      },
    });
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(webhook.url);
    toast.success("URL copied to clipboard");
  };

  const hasMore = deliveries.length < total;

  return (
    <>
      <PageLayout
        title={webhook.name}
        description="Webhook configuration and delivery history"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/${projectSlug}/webhooks`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ChevronLeft />
              Back to webhooks
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isPending}>
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItemLink
                  as={Link}
                  href={`/${projectSlug}/webhooks/${webhook.id}/edit`}
                >
                  <Pencil />
                  Edit configuration
                </DropdownMenuItemLink>

                <DropdownMenuItem onClick={handleTest}>
                  <Play />
                  Send test
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleToggleStatus}>
                  {webhook.status === "active" ? (
                    <>
                      <WebhookOff />
                      Disable
                    </>
                  ) : (
                    <>
                      <Webhook />
                      Enable
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => setDeleteDialog(true)}>
                  <TrashBin />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      >
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Status"
            value={webhook.status === "active" ? "Active" : "Disabled"}
            description={`Webhook is ${webhook.status === "active" ? "receiving" : "not receiving"} events`}
            icon={webhook.status === "active" ? CircleCheckFill : CircleXmarkFill}
            variant={webhook.status === "active" ? "default" : "destructive"}
          />

          <StatCard
            title="Total Deliveries"
            value={total.toLocaleString()}
            description="All-time delivery attempts"
            icon={Webhook}
          />

          <StatCard
            title="Failure Count"
            value={webhook.failureCount}
            description="Recent consecutive failures"
            icon={TriangleExclamationFill}
            variant={webhook.failureCount > 0 ? "destructive" : "default"}
          />

          <StatCard
            title="Last Sent"
            value={
              webhook.lastSentAt
                ? formatDate(webhook.lastSentAt) || "Never"
                : "Never"
            }
            description="Most recent delivery attempt"
            icon={CircleCheck}
          />
        </div>

        {/* Configuration Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Webhook URL</p>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={copyUrl}>
                      <Copy />
                    </Button>

                    <Link
                      href={webhook.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({ variant: "ghost" })}
                    >
                      <ArrowUpRightFromSquare />
                    </Link>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm break-all">
                  {webhook.url}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Events</p>
                <div className="flex flex-wrap gap-1">
                  {webhook.events.map((event) => (
                    <Badge key={event} variant="outline" className="text-xs">
                      {event.replace("article.", "")}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Secret</p>
                <p className="text-muted-foreground text-sm">
                  {webhook.secret ? "Configured" : "Not configured"}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Custom Headers</p>
                <p className="text-muted-foreground text-sm">
                  {webhook.headers && Object.keys(webhook.headers).length > 0
                    ? `${Object.keys(webhook.headers).length} header${
                        Object.keys(webhook.headers).length === 1 ? "" : "s"
                      }`
                    : "None"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Custom Payload</p>
              <p className="text-muted-foreground text-sm">
                {webhook.customPayload
                  ? "Custom payload configured"
                  : "Using default payload"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Deliveries Table */}
        <Card>
          <CardHeader>
            <CardTitle>Deliveries</CardTitle>
            <CardAction>
              <ButtonGroup>
                <Button
                  variant="outline"
                  onClick={handleTest}
                  disabled={isPending}
                >
                  <Play />
                  Send test
                </Button>
              </ButtonGroup>
            </CardAction>
          </CardHeader>
          <CardContent>
            <DeliveriesDataTable
              columns={columns}
              data={deliveries}
              onLoadMore={loadMore}
              hasMore={hasMore}
              isLoading={isLoadingMore}
            />
          </CardContent>
        </Card>
      </PageLayout>

      <ConfirmDialog
        open={deleteDialog}
        onOpenChange={(open) => !open && setDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete webhook"
        description={`Are you sure you want to delete "${webhook.name}"? This will also delete all delivery history.`}
        confirmText="Delete"
        variant="destructive"
        disabled={isDeleting}
      />
    </>
  );
};
