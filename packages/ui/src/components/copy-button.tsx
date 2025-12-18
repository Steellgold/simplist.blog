"use client";

import { Button } from "@simplist/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@simplist/ui/components/tooltip";
import { cn } from "@simplist/ui/lib/utils";
import { CheckIcon, CopyIcon } from "lucide-react";
import { type FC, type ReactNode, useState } from "react";

type CopyButtonProps = {
  content: string;
  children?: ReactNode;
  className?: string;
};

export const CopyButton: FC<CopyButtonProps> = ({
  content,
  children,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Variant with children: clickable content + icon
  if (children) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                "inline-flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity",
                className,
              )}
            >
              {children}
              {copied ? (
                <CheckIcon className="size-3.5 text-green-500" />
              ) : (
                <CopyIcon className="size-3.5 text-muted-foreground" />
              )}
            </button>
          </TooltipTrigger>

          <TooltipContent side="top">
            {copied ? "Copied!" : "Copy to clipboard"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Default variant: icon-only button
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleCopy}
            className={className}
          >
            {copied ? (
              <CheckIcon className="size-3.5" />
            ) : (
              <CopyIcon className="size-3.5" />
            )}
            <span className="sr-only">Copy to clipboard</span>
          </Button>
        </TooltipTrigger>

        <TooltipContent side="top">
          {copied ? "Copied!" : "Copy to clipboard"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
