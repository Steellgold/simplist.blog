"use client";

import { FC } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@simplist/ui/components/table";
import { Card, CardContent } from "@simplist/ui/components/card";

export interface ComparisonRow {
  label: string;
  values: string[];
}

export interface ComparisonTableProps {
  headers: string[];
  rows: ComparisonRow[];
  className?: string;
}

export const ComparisonTable: FC<ComparisonTableProps> = ({
  headers,
  rows,
  className,
}) => {
  return (
    <Card className="p-[2.5px] rounded-2xl">
      <Card className={cn("overflow-hidden p-0", className)}>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                {headers.map((header) => (
                  <TableHead key={header} className="font-medium">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.label}>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  {row.values.map((value, i) => (
                    <TableCell key={i} className="text-muted-foreground">
                      {value}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Card>
  );
};
