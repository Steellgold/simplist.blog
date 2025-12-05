"use client"

import { FC, useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@simplist/ui/components/button"
import { Card } from "@simplist/ui/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@simplist/ui/components/tabs"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@simplist/ui/components/tooltip"
import { cn } from "@/lib/utils"
import { NPM, PnpmDark, Bun, Yarn, PnpmLight } from "@ridemountainpig/svgl-react"
import { IconThemed } from "@simplist/ui/components/icon-themed"

type PackageManagerKey = "npm" | "pnpm" | "yarn" | "bun"

type InstallationTabsProps = {
  commands: Record<PackageManagerKey, string>
  className?: string
}

type Manager = {
  key: PackageManagerKey
  label: string
  icon: React.ReactNode
}

const managers: Manager[] = [
  { key: "npm", label: "npm", icon: <NPM className="size-3" /> },
  { key: "pnpm", label: "pnpm", icon: <IconThemed light={<PnpmLight className="size-3" />} dark={<PnpmDark className="size-3" />} /> },
  { key: "yarn", label: "yarn", icon: <Yarn className="size-3" /> },
  { key: "bun", label: "bun", icon: <Bun className="size-3" /> }
]

export const InstallationTabs: FC<InstallationTabsProps> = ({ commands, className }) => {
  const [copied, setCopied] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<PackageManagerKey>("pnpm")

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Card className={cn("overflow-hidden p-0 max-w-full", className)}>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PackageManagerKey)} defaultValue="pnpm">
          <div className="flex items-center justify-between bg-muted/50 px-2 py-2 border-b gap-2 min-w-0">
            <TabsList className="bg-transparent overflow-x-auto flex-shrink min-w-0">
              {managers.map((manager) => (
                <TabsTrigger key={manager.key} value={manager.key} className="flex-shrink-0">
                  {manager.icon}
                  {manager.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => handleCopy(commands[activeTab])}
                  className="flex-shrink-0"
                >
                  {copied ? <Check /> : <Copy />}
                  <span className="sr-only">Copy command</span>
                </Button>
              </TooltipTrigger>

              <TooltipContent side="top">
                {copied ? "Copied!" : "Copy command"}
              </TooltipContent>
            </Tooltip>
          </div>

          {managers.map((manager) => (
            <TabsContent key={manager.key} value={manager.key} className="-mt-2.5">
              <div className="py-3 px-4 bg-background overflow-x-auto">
                <code className="text-sm text-foreground whitespace-nowrap">
                  {commands[manager.key]}
                </code>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </TooltipProvider>
  )
}
