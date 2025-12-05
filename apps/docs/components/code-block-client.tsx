"use client"

import { FC, useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@simplist/ui/components/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@simplist/ui/components/tooltip"

type CodeBlockClientProps = {
  code: string
}

export const CodeBlockClient: FC<CodeBlockClientProps> = ({ code }: CodeBlockClientProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleCopy}
            className="flex-shrink-0"
          >
            {copied ? <Check /> : <Copy />}
            <span className="sr-only">Copy code</span>
          </Button>
        </TooltipTrigger>

        <TooltipContent side="top">
          {copied ? "Copied!" : "Copy code"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
