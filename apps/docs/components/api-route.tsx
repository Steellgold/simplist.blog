"use client"

import { useState } from "react"
import { cn } from "@simplist/ui/lib/utils"
import { Copy, Check, ChevronDown } from "lucide-react"
import { Badge } from "@simplist/ui/components/badge"
import { Button } from "@simplist/ui/components/button"
import { Card, CardContent } from "@simplist/ui/components/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@simplist/ui/components/collapsible"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@simplist/ui/components/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@simplist/ui/components/tooltip"

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

type ApiParameter = {
  name: string
  type: string
  required?: boolean
  description?: string
}

type ApiPathProps = {
  method: HttpMethod
  path: string
  baseUrl?: string
  parameters?: ApiParameter[]
  className?: string
}

const methodVariants: Record<HttpMethod, { className: string; label: string }> = {
  GET: {
    className: "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 dark:text-emerald-400 border-emerald-500/30",
    label: "GET",
  },
  POST: {
    className: "bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 dark:text-blue-400 border-blue-500/30",
    label: "POST",
  },
  PUT: {
    className: "bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 dark:text-amber-400 border-amber-500/30",
    label: "PUT",
  },
  PATCH: {
    className: "bg-orange-500/15 text-orange-600 hover:bg-orange-500/25 dark:text-orange-400 border-orange-500/30",
    label: "PATCH",
  },
  DELETE: {
    className: "bg-red-500/15 text-red-600 hover:bg-red-500/25 dark:text-red-400 border-red-500/30",
    label: "DELETE",
  },
}

export function ApiPath({
  method,
  path,
  baseUrl,
  parameters,
  className,
}: ApiPathProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const fullUrl = baseUrl ? `${baseUrl}${path}` : path

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const methodVariant = methodVariants[method]

  return (
    <TooltipProvider delayDuration={300}>
      <Card className={cn("overflow-hidden p-0", className)}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center gap-3 bg-muted/50 px-4 py-3 font-mono text-sm cursor-pointer hover:bg-muted/70 transition-colors">
              <ChevronDown
                className={cn(
                  "size-4 text-muted-foreground transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />

              <Badge
                variant="outline"
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide border",
                  methodVariant.className
                )}
              >
                {methodVariant.label}
              </Badge>

              <code className="flex items-center gap-0 text-foreground">
                {baseUrl && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-muted-foreground hover:text-foreground cursor-help transition-colors">
                        {"{{baseUrl}}"}
                      </span>
                    </TooltipTrigger>

                    <TooltipContent side="top">
                      <code className="text-xs">{baseUrl}</code>
                    </TooltipContent>
                  </Tooltip>
                )}
                <span>{path}</span>
              </code>

              <div className="ml-auto flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className="size-4 text-emerald-500" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                      <span className="sr-only">Copy URL</span>
                    </Button>
                  </TooltipTrigger>

                  <TooltipContent side="top">
                    {copied ? "Copied!" : "Copy URL"}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="border-t p-4 space-y-4">
              {parameters && parameters.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Parameters
                  </h4>

                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                          <TableHead className="font-medium">Name</TableHead>
                          <TableHead className="font-medium">Type</TableHead>
                          <TableHead className="font-medium">Required</TableHead>
                          <TableHead className="font-medium">Description</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {parameters.map((param) => (
                          <TableRow key={param.name}>
                            <TableCell className="font-mono font-medium">
                              {param.name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="font-mono text-xs">
                                {param.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {param.required ? (
                                <Badge variant="destructive" className="text-xs">
                                  Required
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  Optional
                                </span>
                              )}
                            </TableCell>

                            <TableCell className="text-muted-foreground">
                              {param.description || "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {(!parameters || parameters.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No parameters required
                </p>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </TooltipProvider>
  )
}