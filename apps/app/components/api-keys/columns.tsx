"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Check, Copy, TrashBin } from "@gravity-ui/icons";
import { Badge } from "@simplist/ui/components/badge";
import { Button } from "@simplist/ui/components/button";
import { toast } from "@simplist/ui/components/sonner";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

export type ApiKey = {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  status: string;
  createdAt: Date;
};

const maskKey = (key: string) => {
  if (key.length <= 12) return key;
  return `${key.substring(0, 10)}...${key.substring(key.length - 6)}`;
};

const formatDate = (date: Date | null) => {
  if (!date) return "Never";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const CopyKeyButton = ({ apiKey }: { apiKey: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast.success("API key copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleCopy}
      className="text-muted-foreground hover:text-foreground"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </Button>
  );
};

export const columns: ColumnDef<ApiKey>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const apiKey = row.original;
      return (
        <div className="space-y-1">
          <div className="font-medium">{row.getValue("name")}</div>
          <div className="flex items-center gap-1">
            <code className="text-muted-foreground font-mono text-xs">
              {maskKey(apiKey.key)}
            </code>
            <CopyKeyButton apiKey={apiKey.key} />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "permissions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Permissions" />
    ),
    cell: ({ row }) => {
      const permissions = row.getValue("permissions") as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {permissions.map((permission) => (
            <Badge key={permission} variant="secondary" className="text-xs">
              {permission}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground text-sm">
          {formatDate(row.getValue("createdAt"))}
        </div>
      );
    },
  },
  {
    accessorKey: "expiresAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Expires" />
    ),
    cell: ({ row }) => {
      const expiresAt = row.getValue("expiresAt") as Date | null;
      if (!expiresAt) {
        return <div className="text-muted-foreground text-sm">Never</div>;
      }

      const now = new Date();
      const expDate = new Date(expiresAt);
      const isExpired = expDate < now;
      const isExpiringSoon =
        !isExpired &&
        expDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days

      return (
        <div
          className={`text-sm ${isExpired ? "text-destructive font-medium" : isExpiringSoon ? "text-orange-500" : "text-muted-foreground"}`}
        >
          {formatDate(expiresAt)}
          {isExpired && " (Expired)"}
        </div>
      );
    },
  },
  {
    accessorKey: "lastUsedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Used" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground text-sm">
          {formatDate(row.getValue("lastUsedAt"))}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="sr-only">Actions</div>,
    cell: ({ row, table }) => {
      const apiKey = row.original;
      const meta = table.options.meta as { onDelete?: (id: string) => void };

      return (
        <div className="text-right">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => meta.onDelete?.(apiKey.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <span className="sr-only">Delete API key</span>
            <TrashBin />
          </Button>
        </div>
      );
    },
  },
];
