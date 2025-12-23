"use client";

import { FC } from "react";
import { Card, CardContent } from "@simplist/ui/components/card";
import { TooltipProvider } from "@simplist/ui/components/tooltip";
import { cn } from "@simplist/ui/lib/utils";
import { CopyButton } from "@simplist/ui/components/copy-button";

export type MethodParameter = {
  name: string;
  type: string;
  optional?: boolean;
  defaultValue?: string;
};

interface MethodSignatureProps {
  name: string;
  parameters: MethodParameter[];
  returnType: string;
  async?: boolean;
  className?: string;
}

export const MethodSignature: FC<MethodSignatureProps> = ({
  name,
  parameters,
  returnType,
  async: isAsync = false,
  className,
}) => {
  const generateSignature = () => {
    const params = parameters
      .map((p) => {
        const optional = p.optional ? "?" : "";
        const defaultVal = p.defaultValue ? ` = ${p.defaultValue}` : "";
        return `${p.name}${optional}: ${p.type}${defaultVal}`;
      })
      .join(", ");

    const asyncKeyword = isAsync ? "async " : "";
    return `${asyncKeyword}${name}(${params}): ${returnType}`;
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Card className="mb-4 rounded-2xl p-[2.5px]">
        <Card className={cn("gap-0 overflow-hidden p-0", className)}>
          <CardContent className="bg-muted flex items-center justify-between border-b px-4 py-2">
            <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Method Signature
            </span>

            <CopyButton content={generateSignature()} />
          </CardContent>

          <CardContent className="p-0">
            <pre className="overflow-x-auto p-4">
              <code className="font-mono text-sm">
                <span
                  className={cn(
                    isAsync && "text-purple-600 dark:text-purple-400",
                  )}
                >
                  {isAsync && "async "}
                </span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {name}
                </span>
                <span className="text-foreground">(</span>
                {parameters.map((param, index) => (
                  <span key={param.name}>
                    <span className="text-foreground">{param.name}</span>
                    <span className="text-muted-foreground">
                      {param.optional ? "?" : ""}
                    </span>
                    <span className="text-muted-foreground">: </span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {param.type}
                    </span>
                    {param.defaultValue && (
                      <>
                        <span className="text-muted-foreground"> = </span>
                        <span className="text-amber-600 dark:text-amber-400">
                          {param.defaultValue}
                        </span>
                      </>
                    )}
                    {index < parameters.length - 1 && (
                      <span className="text-muted-foreground">, </span>
                    )}
                  </span>
                ))}
                <span className="text-foreground">): </span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {returnType}
                </span>
              </code>
            </pre>
          </CardContent>
        </Card>
      </Card>
    </TooltipProvider>
  );
};
