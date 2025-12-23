import { highlightCode } from "@/lib/shiki";
import { Card, CardContent } from "@simplist/ui/components/card";
import { CopyButton } from "@simplist/ui/components/copy-button";
import { TooltipProvider } from "@simplist/ui/components/tooltip";
import { cn } from "@simplist/ui/lib/utils";
import { FC } from "react";

interface CurlCommandProps {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: string;
  className?: string;
}

export const CurlCommand: FC<CurlCommandProps> = async ({
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
  const highlighted = await highlightCode(curlCommand, "bash");

  return (
    <TooltipProvider delayDuration={300}>
      <Card className="rounded-2xl p-[2.5px]">
        <Card className={cn("gap-0 overflow-hidden p-0", className)}>
          <CardContent className="bg-muted/50 flex items-center justify-between border-b px-4 py-2">
            <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              cURL Command
            </span>

            <CopyButton content={curlCommand} />
          </CardContent>

          <CardContent className="p-0">
            <div className="max-w-full overflow-x-auto">
              <div
                className="[&_pre]:m-0 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:bg-transparent [&_pre]:p-4"
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
            </div>
          </CardContent>
        </Card>
      </Card>
    </TooltipProvider>
  );
};
