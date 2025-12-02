"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { createApiKey } from "@/lib/actions/api-keys"
import { CreateApiKeyInput, createApiKeySchema } from "@/lib/validations/api-key"
import { Button } from "@simplist/ui/components/button"
import { Checkbox } from "@simplist/ui/components/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@simplist/ui/components/dialog"
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@simplist/ui/components/field"
import { Input } from "@simplist/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@simplist/ui/components/select"
import { toast } from "@simplist/ui/components/sonner"
import { Spinner } from "@simplist/ui/components/spinner"
import { cn } from "@simplist/ui/lib/utils"
import { Check, Copy, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

interface CreateApiKeyFormProps {
  projectId: string
  onSuccess?: () => void
}

type Permission = {
  id: "read" | "analytics"
  label: string
  description: string
}

const PERMISSIONS: Permission[] = [
  { id: "read", label: "Read", description: "Access articles and project data" },
  { id: "analytics", label: "Analytics", description: "Track page views and events" }
]

export const CreateApiKeyForm = ({ projectId, onSuccess }: CreateApiKeyFormProps) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [newApiKey, setNewApiKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)


  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateApiKeyInput>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: {
      name: "",
      permissions: [],
      expiresInDays: null,
    },
  })

  const expiresInDays = watch("expiresInDays")
  const permissions = watch("permissions")

  const handlePermissionChange = (permission: Permission["id"], checked: boolean) => {
    const currentPermissions = permissions || []
    if (checked) {
      if (!currentPermissions.includes(permission)) {
        setValue("permissions", [...currentPermissions, permission])
      }
    } else {
      setValue("permissions", currentPermissions.filter((p) => p !== permission))
    }
  }

  const onSubmit = async (data: CreateApiKeyInput) => {
    setIsSubmitting(true)

    toast.promise(
      createApiKey(projectId, data),
      {
        loading: "Creating API key...",
        success: (result) => {
          setNewApiKey(result.key)
          reset()
          setIsSubmitting(false)
          router.refresh()
          onSuccess?.()
          return "API key created successfully"
        },
        error: (err: unknown) => {
          setIsSubmitting(false)
          return err instanceof Error ? err.message : "Failed to create API key"
        },
      }
    )
  }

  const handleCopy = async () => {
    if (newApiKey) {
      await navigator.clipboard.writeText(newApiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success("API key copied to clipboard")
    }
  }

  const handleClose = () => {
    setOpen(false)
    setNewApiKey(null)
    setCopied(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        handleClose()
      } else {
        setOpen(true)
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="size-4" />
          Create API Key
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
            {newApiKey ? (
              "Save this API key securely. You won't be able to see it again."
            ) : (
              "Create a new API key to access your project's data programmatically."
            )}
          </DialogDescription>
        </DialogHeader>

        {newApiKey ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <code className="text-sm break-all">{newApiKey}</code>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCopy} className="flex-1">
                {copied ? (
                  <>
                    <Check className="size-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="size-4" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">API Key Name</FieldLabel>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Production API Key"
                      {...register("name")}
                    />

                    {errors.name && <FieldError>{errors.name.message}</FieldError>}
                  </Field>

                  <Field>
                    <FieldLabel>Permissions</FieldLabel>
                    <FieldGroup className="gap-0">
                      {PERMISSIONS.map((permission, index) => {
                        const isFirst = index === 0
                        const isLast = index === PERMISSIONS.length - 1

                        const radius = isFirst
                          ? "rounded-t-md"
                            : isLast
                              ? "rounded-b-md"
                                : "rounded-none"
                          
                        const borders = isFirst
                          ? "border-t border-l border-r"
                            : isLast
                              ? "border-l border-r border-b"
                                : "border-l border-r"

                        return (
                          <Field key={permission.id} orientation="horizontal">
                            <FieldLabel
                              htmlFor={`permission-${permission.id}`}
                              className={cn(
                                "hover:bg-accent/50 flex items-start gap-3 p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950",
                                borders,
                                radius
                              )}
                            >
                              <Checkbox
                                id={`permission-${permission.id}`}
                                className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                                checked={permissions?.includes(permission.id) ?? false}
                                onCheckedChange={(checked) =>
                                  handlePermissionChange(permission.id, checked as boolean)
                                }
                                disabled={isSubmitting}
                              />

                              <div className="grid gap-1.5 font-normal">
                                <p className="text-sm leading-none font-medium">
                                  {permission.label}
                                </p>

                                <p className="text-muted-foreground text-sm">
                                  {permission.description}
                                </p>
                              </div>
                            </FieldLabel>
                          </Field>
                        )
                      })}
                    </FieldGroup>

                    {errors.permissions && (
                      <FieldError>{errors.permissions.message}</FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="expiration">Expiration</FieldLabel>
                    <Select
                      value={expiresInDays === null ? "never" : String(expiresInDays)}
                      onValueChange={(value) => {
                        setValue("expiresInDays", value === "never" ? null : parseInt(value))
                      }}
                    >
                      <SelectTrigger id="expiration">
                        <SelectValue placeholder="Select expiration" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.expiresInDays && (
                      <FieldError>{errors.expiresInDays.message}</FieldError>
                    )}
                  </Field>
                </FieldGroup>
              </FieldSet>

              <Field orientation="horizontal">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Spinner /> : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
              </Field>
            </FieldGroup>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
