"use client";

import { FC, useState } from "react";
import { Card, CardContent } from "@simplist/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@simplist/ui/components/table";
import { TooltipProvider } from "@simplist/ui/components/tooltip";
import { CopyButton } from "@simplist/ui/components/copy-button";
import { cn } from "@/lib/utils";

type EnvVar = {
  name: string;
  required?: boolean;
  default?: string;
  description?: string;
};

type EnvVarsProps = {
  variables: EnvVar[];
  title?: string;
  className?: string;
};

const EnvVarsTable: FC<Pick<EnvVarsProps, "variables">> = ({
  variables,
}: Pick<EnvVarsProps, "variables">) => {
  return (
    <div className="w-full rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-medium whitespace-nowrap">
              Variable
            </TableHead>
            <TableHead className="font-medium whitespace-nowrap">
              Required
            </TableHead>
            <TableHead className="font-medium whitespace-nowrap">
              Default
            </TableHead>
            <TableHead className="font-medium whitespace-nowrap">
              Description
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {variables.map((variable) => (
            <TableRow key={variable.name}>
              <TableCell className="font-mono font-medium whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <span>{variable.name}</span>

                  <CopyButton content={variable.name} />
                </div>
              </TableCell>

              <TableCell className="whitespace-nowrap">
                {variable.required ? (
                  <span className="text-destructive text-xs font-medium">
                    Required
                  </span>
                ) : (
                  <span className="text-muted-foreground text-xs font-medium">
                    Optional
                  </span>
                )}
              </TableCell>

              <TableCell className="font-mono text-sm whitespace-nowrap">
                {variable.default ? (
                  <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
                    {variable.default}
                  </code>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>

              <TableCell className="text-muted-foreground min-w-[200px]">
                {variable.description || "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export const EnvVars: FC<EnvVarsProps> = ({ variables, title, className }) => {
  if (!title) {
    return (
      <TooltipProvider delayDuration={300}>
        <Card className="rounded-2xl p-[2.5px]">
          <Card className={cn("overflow-hidden p-0", className)}>
            <CardContent className="p-0">
              <EnvVarsTable variables={variables} />
            </CardContent>
          </Card>
        </Card>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Card className="rounded-2xl p-[2.5px]">
        <Card className={cn("overflow-hidden p-0", className)}>
          <CardContent className="space-y-4 p-4">
            {title && (
              <h4 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                {title}
              </h4>
            )}

            <EnvVarsTable variables={variables} />
          </CardContent>
        </Card>
      </Card>
    </TooltipProvider>
  );
};
