"use client"

import { Button } from "@simplist/ui/components/button"
import { Check, Copy } from "lucide-react"
import { FC, useState } from "react"

interface CopyMarkdownProps {
  content: string
  className?: string
}

export const CopyMarkdown: FC<CopyMarkdownProps> = ({ content, className }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Error copying to clipboard:", error)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={className}
    >
      {copied ? (
        <>
          <Check className="size-4" />
          Copied
        </>
      ) : (
        <>
          <Copy className="size-4" />
          Copy Markdown
        </>
      )}
    </Button>
  )
}