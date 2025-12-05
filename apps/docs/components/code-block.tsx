import { FC } from "react"
import { Card } from "@simplist/ui/components/card"
import { cn } from "@/lib/utils"
import { highlightCode } from "@/lib/shiki"
import { CodeBlockClient } from "./code-block-client"
import { CodeBlockTabsClient } from "./code-block-tabs-client"
import { BundledLanguage } from "shiki"
import { languages } from "@/lib/languages"

type CodeTab = {
  label: string
  language: string
  code: string
  filename?: string
}

type CodeBlockProps = {
  tabs?: CodeTab[]
  language?: string
  code?: string
  filename?: string
  className?: string
}

export const CodeBlock: FC<CodeBlockProps> = async ({ tabs, language, code, filename, className }) => {
  const isSingleMode = !tabs && language && code

  if (isSingleMode && language && code) {
    const highlighted = await highlightCode(code, language as BundledLanguage)
    const currentFilename = filename
    const lang = language

    return (
      <Card className={cn("overflow-hidden p-0 max-w-full", className)}>
        <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-b min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            {lang && languages.find(l => l.value === lang)?.icon}

            {currentFilename && (
              <span className="text-xs text-muted-foreground font-mono truncate">
                {currentFilename}
              </span>
            )}
          </div>

          <CodeBlockClient code={code} />
        </div>

        <div className="overflow-x-auto max-w-full -mt-2.5">
          <div
            className="[&_pre]:p-4 [&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:max-w-full [&_pre]:overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </div>
      </Card>
    )
  }

  if (!tabs || tabs.length === 0) {
    return null
  }

  const highlightedTabs = await Promise.all(
    tabs.map(async (tab) => ({
      ...tab,
      highlighted: await highlightCode(tab.code, tab.language as BundledLanguage)
    }))
  )

  return <CodeBlockTabsClient tabs={highlightedTabs} className={className} />
}
