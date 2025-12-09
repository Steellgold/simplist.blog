"use client"

import { FC, useState } from "react"
import { Card } from "@simplist/ui/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@simplist/ui/components/tabs"
import { cn } from "@/lib/utils"
import { CopyButton } from "./copy"
import { languages } from "@/lib/languages"

type HighlightedTab = {
  label: string
  language: string
  code: string
  filename?: string
  highlighted: string
}

type CodeBlockTabsClientProps = {
  tabs: HighlightedTab[]
  className?: string
}

export const CodeBlockTabsClient: FC<CodeBlockTabsClientProps> = ({ tabs, className }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].label)
  const activeTabData = tabs.find(t => t.label === activeTab) || tabs[0]

  return (
    <Card className="p-[2.5px] rounded-2xl">
      <Card className={cn("overflow-hidden p-0 max-w-full", className)}>
        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue={tabs[0].label}>
          <div className="flex items-center justify-between bg-muted/50 px-2 py-2 border-b gap-2 min-w-0">
            <TabsList className="bg-transparent overflow-x-auto flex-shrink min-w-0">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.label} value={tab.label} className="flex-shrink-0">
                  {languages.find(l => l.value === tab.language)?.icon}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
              {activeTabData.filename && (
                <span className="text-xs text-muted-foreground font-mono hidden sm:inline truncate max-w-[150px]">
                  {activeTabData.filename}
                </span>
              )}

              <CopyButton content={activeTabData.code} />
            </div>
          </div>

          {tabs.map((tab) => (
            <TabsContent key={tab.label} value={tab.label} className="-mt-2.5">
              <div className="overflow-x-auto max-w-full">
                <div
                  className="[&_pre]:p-4 [&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:max-w-full [&_pre]:overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: tab.highlighted }}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </Card>
  )
}
