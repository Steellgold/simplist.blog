"use client";

import { FileArrowDown } from "@gravity-ui/icons";
import { Button } from "@simplist/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@simplist/ui/components/dropdown-menu";
import { Kbd } from "@simplist/ui/components/kbd";
import type { ExportDropdownProps } from "./types";
import { useExport } from "./use-export";

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
            <FileArrowDown />
            <span className="hidden sm:inline">Export{countLabel}</span>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => run("csv")}>
          <Kbd>CSV</Kbd>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run("json")}>
          <Kbd>JSON</Kbd>
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run("xml")}>
          <Kbd>XML</Kbd>
          Export as XML
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
