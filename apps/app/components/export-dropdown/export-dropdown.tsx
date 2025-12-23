"use client";

import { Button } from "@simplist/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@simplist/ui/components/dropdown-menu";
import { Upload, FileCode, FileJson, FileSpreadsheet } from "lucide-react";
import { useExport } from "./use-export";
import type { ExportDropdownProps } from "./types";

export const ExportDropdown = ({
  selectedCount = 0,
  children,
  ...props
}: ExportDropdownProps) => {
  const { run } = useExport(props);

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
        <DropdownMenuItem onClick={() => run("csv")}>
          <FileSpreadsheet />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run("json")}>
          <FileJson />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run("xml")}>
          <FileCode />
          Export as XML
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
