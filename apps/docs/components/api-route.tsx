"use client"

import { useState, useEffect, FC } from "react"
import { cn } from "@simplist/ui/lib/utils"
import { Copy, Check, ChevronDown, Play, Key, Loader2, AlertTriangle } from "lucide-react"
import { Badge } from "@simplist/ui/components/badge"
import { Button } from "@simplist/ui/components/button"
import { Card, CardContent } from "@simplist/ui/components/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@simplist/ui/components/collapsible"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@simplist/ui/components/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@simplist/ui/components/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@simplist/ui/components/alert-dialog"
import { Textarea } from "@simplist/ui/components/textarea"
import { useApiKeyStore } from "@/lib/api-key-store"
import { useTestableApi } from "./testable-api-provider"
import { Spinner } from "@simplist/ui/components/spinner"
import { ButtonGroup } from "@simplist/ui/components/button-group"

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

type ApiParameter = {
  name: string
  type: string
  required?: boolean
  description?: string
}

type ApiResponse = {
  status: number
  statusText: string
  headers: Record<string, string>
  body: any
}

type ApiPathProps = {
  method: HttpMethod
  path: string
  baseUrl?: string
  parameters?: ApiParameter[]
  testable?: boolean
  requiresAuth?: boolean
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

const sensitiveMethod = (method: HttpMethod) => ["DELETE", "POST", "PUT", "PATCH"].includes(method)

type PathDisplayProps = {
  baseUrl?: string
  path: string
}

const PathDisplay: FC<PathDisplayProps> = ({ baseUrl, path }) => {
  return (
    <code className="flex items-center gap-0 text-foreground flex-1 min-w-0 overflow-x-auto">
      {baseUrl && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-muted-foreground hover:text-foreground cursor-help transition-colors whitespace-nowrap">
              {"{{baseUrl}}"}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">
            <code className="text-xs">{baseUrl}</code>
          </TooltipContent>
        </Tooltip>
      )}
      <span className="whitespace-nowrap">{path}</span>
    </code>
  )
}

type ActionButtonsProps = {
  requiresAuth: boolean
  apiKey: string | null
  testable: boolean
  isRunning: boolean
  onRun: () => void
  onCopy: (e: React.MouseEvent) => void
  copied: boolean
}

const ActionButtons: FC<ActionButtonsProps> = ({ requiresAuth, apiKey, testable, isRunning, onRun, onCopy, copied }) => {
  return (
    <div className="ml-auto flex items-center gap-1 flex-shrink-0">
      {requiresAuth && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "flex items-center gap-1 text-xs px-2 py-1 rounded whitespace-nowrap",
              apiKey
                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                : "text-orange-600 dark:text-orange-400 bg-orange-500/10"
            )}>
              <Key className="size-3" />
              {apiKey ? "Auth configured" : "Auth required"}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            {apiKey ? "API key is configured" : "API key required - use Configure button"}
          </TooltipContent>
        </Tooltip>
      )}

      <ButtonGroup>
        {testable && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                className="flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onRun()
                }}
                disabled={isRunning || (requiresAuth && !apiKey)}
              >
                {isRunning ? <Spinner /> : <Play />}
                <span className="sr-only">Run request</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {requiresAuth && !apiKey ? "Configure API key first" : "Run request"}
            </TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon-sm"
              className="flex-shrink-0"
              onClick={onCopy}
            >
              {copied ? <Check /> : <Copy />}
              <span className="sr-only">Copy URL</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {copied ? "Copied!" : "Copy URL"}
          </TooltipContent>
        </Tooltip>
      </ButtonGroup>
    </div>
  )
}

type RequestBodyInputProps = {
  value: string
  onChange: (value: string) => void
}

const RequestBodyInput: FC<RequestBodyInputProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Request Body
      </h4>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='{"key": "value"}'
        className="font-mono text-xs min-h-[120px]"
      />
    </div>
  )
}

type ErrorDisplayProps = {
  error: string
}

const ErrorDisplay: FC<ErrorDisplayProps> = ({ error }) => {
  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
      <div className="flex items-start gap-2">
        <AlertTriangle className="size-4 text-red-600 dark:text-red-400 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-red-600 dark:text-red-400">Error</h4>
          <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">{error}</p>
        </div>
      </div>
    </div>
  )
}

type ResponseDisplayProps = {
  response: ApiResponse
}

const ResponseDisplay: FC<ResponseDisplayProps> = ({ response }) => {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Response
      </h4>

      <div className="rounded-lg border overflow-hidden">
        <div className="bg-muted/50 px-4 py-2 flex items-center justify-between min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Badge
              variant="outline"
              className={cn(
                "font-mono text-xs flex-shrink-0",
                response.status >= 200 && response.status < 300
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : response.status >= 400
                  ? "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
              )}
            >
              {response.status} {response.statusText}
            </Badge>
          </div>
        </div>

        <div className="p-4 space-y-4 max-w-full">
          <div className="overflow-hidden">
            <h5 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Headers
            </h5>
            <div className="bg-muted/50 rounded p-2 font-mono text-xs space-y-1 overflow-x-auto max-w-full">
              {Object.entries(response.headers).slice(0, 5).map(([key, value]) => (
                <div key={key} className="whitespace-nowrap">
                  <span className="text-muted-foreground">{key}:</span> {value}
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden">
            <h5 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Body
            </h5>
            <div className="bg-muted/50 rounded p-4 font-mono text-xs overflow-x-auto max-w-full">
              <pre className="whitespace-pre-wrap break-words">{JSON.stringify(response.body, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

type ParametersTableProps = {
  parameters: ApiParameter[]
}

const ParametersTable: FC<ParametersTableProps> = ({ parameters }) => {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Parameters
      </h4>

      <div className="rounded-lg border overflow-hidden overflow-x-auto max-w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-medium whitespace-nowrap">Name</TableHead>
              <TableHead className="font-medium whitespace-nowrap">Type</TableHead>
              <TableHead className="font-medium whitespace-nowrap">Required</TableHead>
              <TableHead className="font-medium">Description</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {parameters.map((param) => (
              <TableRow key={param.name}>
                <TableCell className="font-mono font-medium whitespace-nowrap">
                  {param.name}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {param.type}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">
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
  )
}

export const ApiPath: FC<ApiPathProps> = ({ method, path, baseUrl, parameters, testable = false, requiresAuth = false, className }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [requestBody, setRequestBody] = useState<string>('{}')

  const { apiKey } = useApiKeyStore()
  const { setHasTestableApi } = useTestableApi()
  const fullUrl = baseUrl ? `${baseUrl}${path}` : path
  const methodVariant = methodVariants[method]
  const needsBody = ["POST", "PUT", "PATCH"].includes(method)
  const hasParameters = parameters && parameters.length > 0

  useEffect(() => {
    if (testable) setHasTestableApi(true)
  }, [testable, setHasTestableApi])

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const executeRequest = async () => {
    setIsRunning(true)
    setError(null)
    setResponse(null)

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (requiresAuth && apiKey) headers['X-API-Key'] = apiKey

      const options: RequestInit = { method, headers }

      if (needsBody && requestBody) {
        try {
          JSON.parse(requestBody)
          options.body = requestBody
        } catch (e) {
          setError('Invalid JSON in request body')
          setIsRunning(false)
          return
        }
      }

      const res = await fetch(fullUrl, options)

      const responseHeaders: Record<string, string> = {}
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      let responseBody: any
      const contentType = res.headers.get('content-type')

      if (contentType?.includes('application/json')) {
        responseBody = await res.json()
      } else {
        responseBody = await res.text()
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body: responseBody
      })
    } catch (err: any) {
      setError(err.message || 'Request failed')
    } finally {
      setIsRunning(false)
    }
  }

  const handleRun = () => {
    if (sensitiveMethod(method)) {
      setShowConfirmDialog(true)
    } else {
      executeRequest()
    }
  }

  const handleConfirmRun = () => {
    setShowConfirmDialog(false)
    executeRequest()
  }

  const headerContent = (
    <>
      <Badge
        variant="outline"
        className={cn(
          "rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide border flex-shrink-0",
          methodVariant.className
        )}
      >
        {methodVariant.label}
      </Badge>

      <PathDisplay baseUrl={baseUrl} path={path} />

      <ActionButtons
        requiresAuth={requiresAuth}
        apiKey={apiKey}
        testable={testable}
        isRunning={isRunning}
        onRun={handleRun}
        onCopy={handleCopy}
        copied={copied}
      />
    </>
  )

  const expandableContent = (
    <>
      {testable && needsBody && (
        <RequestBodyInput value={requestBody} onChange={setRequestBody} />
      )}
      {error && <ErrorDisplay error={error} />}
      {response && <ResponseDisplay response={response} />}
    </>
  )

  const showExpandableContent = (testable && needsBody) || error || response

  return (
    <TooltipProvider delayDuration={300}>
      <Card className={cn("overflow-hidden p-0 max-w-full", className)}>
        {hasParameters ? (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center gap-3 bg-muted/50 px-4 py-3 font-mono text-sm cursor-pointer hover:bg-muted/70 transition-colors min-w-0 w-full">
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform duration-200 flex-shrink-0",
                    isOpen && "rotate-180"
                  )}
                />
                {headerContent}
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="border-t p-4 space-y-4">
                <ParametersTable parameters={parameters} />
                {expandableContent}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <>
            <div className="flex items-center gap-3 bg-muted/50 px-4 py-3 font-mono text-sm min-w-0 w-full">
              {headerContent}
            </div>

            {showExpandableContent && (
              <CardContent className="px-4 pb-4">
                {expandableContent}
              </CardContent>
            )}
          </>
        )}
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm {method} Request</AlertDialogTitle>
            <AlertDialogDescription>
              This action will execute a {method} request to <code className="bg-muted px-1 py-0.5 rounded text-xs">{fullUrl}</code>.
              {method === 'DELETE' && ' This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRun}>
              Execute
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  )
}