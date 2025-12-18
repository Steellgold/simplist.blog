"use client";

import { FC } from "react";
import { Card, CardContent } from "@simplist/ui/components/card";
import { TooltipProvider } from "@simplist/ui/components/tooltip";
import { cn } from "@simplist/ui/lib/utils";
import { CopyButton } from "@simplist/ui/components/copy-button";

interface CurlCommandProps {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: string;
  className?: string;
}

export const CurlCommand: FC<CurlCommandProps> = ({
  method,
  url,
  headers = {},
  body,
  className,
}) => {
  const generateCurlCommand = () => {
    const parts: string[] = [`curl -X ${method} "${url}"`];

    Object.entries(headers).forEach(([key, value]) => {
      parts.push(`  -H "${key}: ${value}"`);
    });

    if (body && ["POST", "PUT", "PATCH"].includes(method)) {
      const escapedBody = body.replace(/"/g, '\\"');
      parts.push(`  -d "${escapedBody}"`);
    }

    return parts.join(" \\\n");
  };

  const curlCommand = generateCurlCommand();

  return (
    <TooltipProvider delayDuration={300}>
      <Card className="p-[2.5px] rounded-2xl">
        <Card className={cn("overflow-hidden p-0 gap-0", className)}>
          <CardContent className="flex items-center justify-between bg-muted px-4 py-2 border-b">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              cURL Command
            </span>

            <CopyButton content={curlCommand} />
          </CardContent>

          <CardContent className="p-0">
            <pre className="p-4 overflow-x-auto">
              <code className="text-xs text-foreground whitespace-pre">
                {curlCommand}
              </code>
            </pre>
          </CardContent>
        </Card>
      </Card>
    </TooltipProvider>
  );
};
