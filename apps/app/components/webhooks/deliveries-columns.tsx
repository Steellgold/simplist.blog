"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@simplist/ui/components/badge";
import { Button } from "@simplist/ui/components/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@simplist/ui/components/collapsible";
import { ScrollArea } from "@simplist/ui/components/scroll-area";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, ChevronDown, ExternalLink, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatDate, formatResponse } from "./utils";

type Delivery = {
  id: string;
  status: string;
  statusCode: number | null;
  error: string | null;
  response: unknown;
  attemptedAt: Date;
};

type DeliveryWithProject = Delivery & {
  projectSlug: string;
};

const DeliveryResponseCell = ({ delivery }: { delivery: Delivery }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (typeof delivery.response !== "object" || delivery.response === null) {
    return <span className="text-xs text-muted-foreground">No response</span>;
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm">
          <ChevronDown
            className={`h-3 w-3 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
          View
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="absolute z-50 mt-1">
        <ScrollArea className="max-h-64 w-96 rounded-md border bg-background p-3 shadow-lg">
          <pre className="text-xs font-mono whitespace-pre-wrap break-all">
            {formatResponse(delivery.response)}
          </pre>
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
};

const DeliveryTypeCell = ({ delivery }: { delivery: DeliveryWithProject }) => {
  // Extract event info from response
  const response = delivery.response as any;

  // Check if it's a test delivery (has X-Simplist-Test header info)
  if (response && typeof response === "object" && response.event) {
    const event = response.event;
    const article = response.article;

    if (response.timestamp && response.timestamp.includes("test")) {
      // Test delivery
      return (
        <div className="space-y-1">
          <Badge variant="outline" className="text-xs">
            Test
          </Badge>
          <div className="text-xs text-muted-foreground">
            {event?.replace("article.", "")}
          </div>
        </div>
      );
    }

    // Real event delivery
    return (
      <div className="space-y-1">
        <Badge variant="default" className="text-xs">
          {event?.replace("article.", "") || "Event"}
        </Badge>

        {article?.slug && (
          <Link
            href={`/${delivery.projectSlug}/articles/${article.slug}/edit`}
            className="text-xs text-blue-600 hover:text-blue-800 truncate block max-w-[120px]"
            title={article.title}
          >
            <ExternalLink />
            {article.title}
          </Link>
        )}
      </div>
    );
  }

  // Check if response indicates it was a test (look for test indicators)
  const responseStr = JSON.stringify(delivery.response || {}).toLowerCase();
  if (responseStr.includes("test") || responseStr.includes("sample")) {
    return (
      <Badge variant="outline" className="text-xs">
        Test
      </Badge>
    );
  }

  // Default to unknown event
  return (
    <Badge variant="secondary" className="text-xs">
      Event
    </Badge>
  );
};

export const useDeliveriesColumns = (
  projectSlug: string,
): ColumnDef<Delivery>[] => {
  return [
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const delivery = row.original;
        const isSuccess = delivery.status === "success";

        return (
          <div className="flex items-center gap-2">
            <Badge
              variant={isSuccess ? "default" : "destructive"}
              className="shrink-0"
            >
              {isSuccess ? (
                <>
                  <CheckCircle />
                  Success
                </>
              ) : (
                <>
                  <XCircle />
                  Failed
                </>
              )}
            </Badge>

            {delivery.statusCode && (
              <Badge variant="outline" className="shrink-0 text-xs">
                {delivery.statusCode}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const delivery = { ...row.original, projectSlug };
        return <DeliveryTypeCell delivery={delivery} />;
      },
    },
    {
      accessorKey: "error",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Error" />
      ),
      cell: ({ row }) => {
        const delivery = row.original;

        if (!delivery.error) {
          return <span className="text-xs text-muted-foreground">-</span>;
        }

        return (
          <div className="max-w-[200px]">
            <span
              className="text-xs text-destructive truncate block"
              title={delivery.error}
            >
              {delivery.error}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "attemptedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Attempted At" />
      ),
      cell: ({ row }) => {
        const delivery = row.original;

        return (
          <div className="text-sm">{formatDate(delivery.attemptedAt)}</div>
        );
      },
    },
    {
      id: "response",
      header: "Response",
      cell: ({ row }) => <DeliveryResponseCell delivery={row.original} />,
    },
  ];
};
