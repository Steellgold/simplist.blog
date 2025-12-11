"use client"

import { FC, useState } from "react"
import { CopyIcon, CheckIcon } from "lucide-react"
import { Button } from "@simplist/ui/components/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@simplist/ui/components/tooltip"

type CopyButtonProps = {
  content: string
}

export const CopyButton: FC<CopyButtonProps> = ({ content }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleCopy}
          >
            {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
            <span className="sr-only">Copy to clipboard</span>
          </Button>
        </TooltipTrigger>

        <TooltipContent side="top">
          {copied ? "Copied!" : "Copy to clipboard"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
