"use client"

import { FC } from "react"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@simplist/ui/components/table"
import { Card, CardContent } from "@simplist/ui/components/card"
import { Badge } from "@simplist/ui/components/badge"
import { Button } from "@simplist/ui/components/button"

export interface TypeProperty {
  name: string
  type: string
  description?: string
  defaultValue?: string
  required?: boolean
}

export interface LanguageEntry {
  language: string
  code: string
}

export interface ApiMethod {
  method: string
  description: string
  returns: string
}

export interface ErrorEntry {
  status: string
  error: string
  solution: string
}

type DataTableProps =
  | { variant: "type"; data: TypeProperty[]; className?: string }
  | { variant: "language"; data: LanguageEntry[]; className?: string }
  | { variant: "api"; data: ApiMethod[]; className?: string }
  | { variant: "error"; data: ErrorEntry[]; className?: string }

function TypeBadge({ type }: { type: string }) {
  const getTypeStyle = (t: string) => {
    const lowerType = t.toLowerCase()
    if (lowerType.includes("string"))
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
    if (lowerType.includes("number") || lowerType.includes("int"))
      return "bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20"
    if (lowerType.includes("boolean") || lowerType.includes("bool"))
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
    if (lowerType.includes("array") || lowerType.includes("[]"))
      return "bg-purple-500/15 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20"
    if (lowerType.includes("object") || lowerType.includes("{}"))
      return "bg-pink-500/15 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20"
    if (lowerType.includes("function") || lowerType.includes("=>"))
      return "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20"
    if (lowerType.includes("null") || lowerType.includes("undefined"))
      return "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-500/20"
    return ""
  }

  return (
    <Badge variant="secondary" className={cn("font-mono text-xs", getTypeStyle(type))}>
      {type}
    </Badge>
  )
}

const tableConfigs = {
  type: {
    headers: ["Property", "Type", "Description", "Default"],
    renderRow: (prop: TypeProperty) => (
      <TableRow key={prop.name}>
        <TableCell>
          <code className="font-mono text-foreground">
            {prop.name}
            {prop.required && <span className="text-destructive ml-0.5">*</span>}
          </code>
        </TableCell>
        <TableCell>
          <TypeBadge type={prop.type} />
        </TableCell>
        <TableCell className="text-muted-foreground">
          {prop.description || <span className="text-muted-foreground/50">-</span>}
        </TableCell>
        <TableCell>
          {prop.defaultValue ? (
            <Badge variant="outline" className="font-mono text-xs">
              {prop.defaultValue}
            </Badge>
          ) : (
            <span className="text-muted-foreground/50">-</span>
          )}
        </TableCell>
      </TableRow>
    ),
  },

  language: {
    headers: ["Language", "Code"],
    renderRow: (lang: LanguageEntry) => (
      <TableRow key={lang.code}>
        <TableCell className="text-foreground">{lang.language}</TableCell>
        <TableCell>
          <Badge variant="outline" className="font-mono text-xs">
            {lang.code}
          </Badge>
        </TableCell>
      </TableRow>
    ),
  },

  api: {
    headers: ["Method", "Description", "Returns"],
    renderRow: (method: ApiMethod) => {
      const handleClick = () => {
        const id = method.method.toLowerCase()
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }

      return (
        <TableRow key={method.method}>
          <TableCell>
            <Button
              variant="link"
              className="h-auto p-0 font-mono font-semibold"
              onClick={handleClick}
            >
              <code>{method.method}()</code>
            </Button>
          </TableCell>
          <TableCell className="text-muted-foreground">{method.description}</TableCell>
          <TableCell>
            <TypeBadge type={method.returns} />
          </TableCell>
        </TableRow>
      )
    },
  },

  error: {
    headers: ["Status", "Error", "Solution"],
    renderRow: (error: ErrorEntry) => (
      <TableRow key={`${error.status}-${error.error}`}>
        <TableCell>
          <Badge variant="destructive" className="font-mono">
            {error.status}
          </Badge>
        </TableCell>
        <TableCell className="text-muted-foreground font-medium">{error.error}</TableCell>
        <TableCell className="text-muted-foreground">{error.solution}</TableCell>
      </TableRow>
    ),
  },
} as const

export const DataTable: FC<DataTableProps> = ({ variant, data, className }) => {
  const config = tableConfigs[variant]

  return (
    <Card className="p-[2.5px] rounded-2xl">
      <Card className={cn("overflow-hidden p-0", className)}>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                {config.headers.map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => config.renderRow(item as never))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Card>
  )
}

export const TypeTable: FC<{ properties: TypeProperty[]; className?: string }> = ({
  properties,
  className,
}) => <DataTable variant="type" data={properties} className={className} />

export const LanguageTable: FC<{ languages: LanguageEntry[]; className?: string }> = ({
  languages,
  className,
}) => <DataTable variant="language" data={languages} className={className} />

export const ApiMethodTable: FC<{ methods: ApiMethod[]; className?: string }> = ({
  methods,
  className,
}) => <DataTable variant="api" data={methods} className={className} />

export const ErrorTable: FC<{ errors: ErrorEntry[]; className?: string }> = ({
  errors,
  className,
}) => <DataTable variant="error" data={errors} className={className} />