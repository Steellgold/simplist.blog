"use client"

import { FC, useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@simplist/ui/components/button"
import { Card, CardContent } from "@simplist/ui/components/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@simplist/ui/components/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@simplist/ui/components/tooltip"
import { cn } from "@/lib/utils"

type EnvVar = {
  name: string
  required?: boolean
  default?: string
  description?: string
}

type EnvVarsProps = {
  variables: EnvVar[]
  title?: string
  className?: string
}

const EnvVarsTable: FC<Pick<EnvVarsProps, "variables">> = ({ variables }: Pick<EnvVarsProps, "variables">) => {
  const [copiedVar, setCopiedVar] = useState<string | null>(null)

  const handleCopy = async (name: string) => {
    await navigator.clipboard.writeText(name)
    setCopiedVar(name)
    setTimeout(() => setCopiedVar(null), 2000)
  }

  return (
    <div className="rounded-lg border overflow-hidden overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-medium whitespace-nowrap">Variable</TableHead>
            <TableHead className="font-medium whitespace-nowrap">Required</TableHead>
            <TableHead className="font-medium whitespace-nowrap">Default</TableHead>
            <TableHead className="font-medium whitespace-nowrap">Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variables.map((variable) => (
            <TableRow key={variable.name}>
              <TableCell className="font-mono font-medium whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <span>{variable.name}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleCopy(variable.name)}
                      >
                        {copiedVar === variable.name ? (
                          <Check className="size-3 text-emerald-500" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                        <span className="sr-only">Copy variable name</span>
                      </Button>
                    </TooltipTrigger>

                    <TooltipContent side="top">
                      {copiedVar === variable.name ? "Copied!" : "Copy variable name"}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {variable.required
                  ? <span className="text-xs text-destructive font-medium">Required</span>
                  : <span className="text-xs text-muted-foreground font-medium">Optional</span>
                }
              </TableCell>
              <TableCell className="font-mono text-sm whitespace-nowrap">
                {variable.default ? (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                    {variable.default}
                  </code>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground min-w-[200px]">
                {variable.description || "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export const EnvVars: FC<EnvVarsProps> = ({ variables, title, className }) => {
  if (!title) return <EnvVarsTable variables={variables} />

  return (
    <TooltipProvider delayDuration={300}>
      <Card className={cn("overflow-hidden p-0", className)}>
        <CardContent className="p-4 space-y-4">
          {title && (
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {title}
            </h4>
          )}

          <EnvVarsTable variables={variables} />
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
