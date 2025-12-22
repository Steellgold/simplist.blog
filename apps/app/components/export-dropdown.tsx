"use client";

import { Button } from "@simplist/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@simplist/ui/components/dropdown-menu";
import { toast } from "@simplist/ui/components/sonner";
import { Upload, FileCode, FileJson, FileSpreadsheet } from "lucide-react";
import { type ReactNode } from "react";

export type ExportFormat = "csv" | "json" | "xml";

export interface ExportColumn {
  key: string;
  header: string;
  getValue?: (
    item: Record<string, unknown>,
  ) => string | number | boolean | null;
}

export interface ExportDropdownProps {
  data: Record<string, unknown>[];
  columns: ExportColumn[];
  filename: string;
  selectedCount?: number;
  children?: ReactNode;
}

const escapeCSV = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const escapeXML = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const ExportDropdown = ({
  data,
  columns,
  filename,
  selectedCount = 0,
  children,
}: ExportDropdownProps) => {
  const getDateSuffix = () => new Date().toISOString().split("T")[0];

  const getValue = (
    item: Record<string, unknown>,
    column: ExportColumn,
  ): unknown => {
    if (column.getValue) {
      return column.getValue(item);
    }
    // Handle nested keys like "_count.articles"
    const keys = column.key.split(".");
    let value: unknown = item;
    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        value = null;
        break;
      }
    }
    return value;
  };

  const handleExportCSV = () => {
    const csvContent = [
      columns.map((col) => escapeCSV(col.header)).join(","),
      ...data.map((item) =>
        columns.map((col) => escapeCSV(getValue(item, col))).join(","),
      ),
    ].join("\n");

    downloadFile(
      csvContent,
      `${filename}-${getDateSuffix()}.csv`,
      "text/csv;charset=utf-8;",
    );
    toast.success(`Exported ${data.length} item(s) to CSV`);
  };

  const handleExportJSON = () => {
    const jsonData = data.map((item) => {
      const obj: Record<string, unknown> = {};
      for (const col of columns) {
        obj[col.key] = getValue(item, col);
      }
      return obj;
    });

    downloadFile(
      JSON.stringify(jsonData, null, 2),
      `${filename}-${getDateSuffix()}.json`,
      "application/json;charset=utf-8;",
    );
    toast.success(`Exported ${data.length} item(s) to JSON`);
  };

  const handleExportXML = () => {
    const xmlItems = data
      .map((item) => {
        const fields = columns
          .map((col) => {
            const value = getValue(item, col);
            const tagName = col.key.replace(/[^a-zA-Z0-9]/g, "_");
            return `    <${tagName}>${escapeXML(value)}</${tagName}>`;
          })
          .join("\n");
        return `  <item>\n${fields}\n  </item>`;
      })
      .join("\n");

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n<data>\n${xmlItems}\n</data>`;

    downloadFile(
      xmlContent,
      `${filename}-${getDateSuffix()}.xml`,
      "application/xml;charset=utf-8;",
    );
    toast.success(`Exported ${data.length} item(s) to XML`);
  };

  const countLabel = selectedCount > 0 ? ` (${selectedCount})` : "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children || (
          <Button variant="outline">
            <Upload />
            Export{countLabel}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileSpreadsheet />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJSON}>
          <FileJson />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportXML}>
          <FileCode />
          Export as XML
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
