"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createApiKey } from "@/lib/actions/api-keys"
import { CreateApiKeyInput, createApiKeySchema } from "@/lib/validations/api-key"
import { Spinner } from "./ui/spinner"
import { toast } from "@/components/ui/sonner"
import { Plus, Copy, Check } from "lucide-react"

interface CreateApiKeyFormProps {
  projectId: string
  onSuccess?: () => void
}

export const CreateApiKeyForm = ({ projectId, onSuccess }: CreateApiKeyFormProps) => {
  const [open, setOpen] = useState(false)
  const [newApiKey, setNewApiKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CreateApiKeyInput>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: {
      name: "",
      expiresInDays: null,
    },
  })

  const expiresInDays = watch("expiresInDays")

  const onSubmit = async (data: CreateApiKeyInput) => {
    setError("")
    try {
      const result = await createApiKey(projectId, data)
      setNewApiKey(result.key)
      reset()
      toast.success("API key created successfully")
      onSuccess?.()
    } catch (err: any) {
      const message = err?.message || "Failed to create API key"
      setError(message)
      toast.error(message)
    }
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
    setError("")
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
        <Button>
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
              <div className="flex flex-col gap-4">
                {error && (
                  <div className="text-destructive text-sm text-center">{error}</div>
                )}

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
                  <Button type="submit" disabled={isSubmitting}>
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
