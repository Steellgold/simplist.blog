"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { useApiKeyLimits } from "@/hooks/use-subscription-limits"
import { createApiKey } from "@/lib/actions/api-keys"
import { CreateApiKeyInput, createApiKeySchema } from "@/lib/validations/api-key"
import { Button } from "@simplist/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@simplist/ui/components/dialog"
import { Field, FieldGroup, FieldLabel } from "@simplist/ui/components/field"
import { Input } from "@simplist/ui/components/input"
import { ProgressButton } from "@simplist/ui/components/progress-button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@simplist/ui/components/select"
import { toast } from "@simplist/ui/components/sonner"
import { Spinner } from "@simplist/ui/components/spinner"
import { Check, Copy, Plus } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface CreateApiKeyFormProps {
  projectId: string
  onSuccess?: () => void
}

export const CreateApiKeyForm = ({ projectId, onSuccess }: CreateApiKeyFormProps) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [newApiKey, setNewApiKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { isAtLimit, currentCount, maxCount, tier, isLoading: limitsLoading, refetch } = useApiKeyLimits(projectId)

  const isPro = tier === "PRO"

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
      type: "secret",
      expiresInDays: null,
    },
  })

  const expiresInDays = watch("expiresInDays")
  const keyType = watch("type")

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
          refetch() // Refresh the limits data
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

  const isButtonDisabled = limitsLoading || isAtLimit

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        handleClose()
      } else {
        setOpen(true)
      }
    }}>
      <DialogTrigger asChild>
        {maxCount === -1 ? (
          <Button variant="outline" disabled={isButtonDisabled}>
            <Plus className="size-4" />
            Create API Key
          </Button>
        ) : (
          <ProgressButton
            value={currentCount}
            min={0}
            max={maxCount}
            variant="outline"
            disabled={isButtonDisabled}
          >
            <Plus className="size-4" />
            Create API Key {!limitsLoading && `(${currentCount}/${maxCount})`}
          </ProgressButton>
        )}
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

        {/* {!newApiKey && !limitsLoading && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">API Key Limit:</span>
                <span className="text-sm text-muted-foreground">
                  {currentCount}/{maxCount} used
                </span>
              </div>
              {tier === "STARTER" && isAtLimit && (
                <div className="flex items-center gap-2 text-sm">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  <span className="text-muted-foreground">Upgrade to Pro for more</span>
                </div>
              )}
            </div>
            {isAtLimit && (
              <p className="text-sm text-muted-foreground mt-2">
                {tier === "STARTER" 
                  ? "You've reached the free plan limit. Upgrade to Pro to create up to 10 API keys."
                  : "You've reached your API key limit for the Pro plan."
                }
              </p>
            )}
          </div>
        )} */}

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
            <FieldGroup className={isAtLimit ? "opacity-50 pointer-events-none" : ""}>
              <div className="flex flex-col gap-4">
                <Field>
                  <FieldLabel htmlFor="name">API Key Name *</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Production API Key"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="type">Key Type</FieldLabel>
                  <Select
                    value={keyType}
                    onValueChange={(value) => {
                      setValue("type", value as "secret" | "public")
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select key type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="secret">Secret Key (sk_) - Server-side use</SelectItem>
                      <SelectItem value="public" disabled={!isPro}>
                        <div className="flex items-center gap-2">
                          <span>Public Key (pk_) - Client-side use</span>
                          {!isPro && (
                            <Image
                              src="https://cdn.simplist.blog/assets/billing/mini-pro-badge.png"
                              alt="PRO"
                              width={16}
                              height={16}
                            />
                          )}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-destructive text-sm mt-1">{errors.type.message}</p>
                  )}
                  {!isPro && (
                    <p className="text-muted-foreground text-xs mt-1">
                      Public keys are only available on the Pro plan for analytics tracking.
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs mt-1">
                    {keyType === "secret"
                      ? "Secret keys (sk_) are for server-side use and can read articles & project data."
                      : "Public keys (pk_) are for client-side analytics tracking only."}
                  </p>
                </Field>

                <Field>
                  <FieldLabel htmlFor="expiration">Expiration</FieldLabel>
                  <Select
                    value={expiresInDays === null ? "never" : String(expiresInDays)}
                    onValueChange={(value) => {
                      setValue("expiresInDays", value === "never" ? null : parseInt(value))
                    }}
                  >
                    <SelectTrigger>
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
                    <p className="text-destructive text-sm mt-1">{errors.expiresInDays.message}</p>
                  )}
                </Field>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || isAtLimit}>
                    {isSubmitting ? <Spinner /> : "Create"}
                  </Button>
                </div>
              </div>
            </FieldGroup>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
