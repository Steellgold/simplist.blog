"use client"

import { authClient } from "@/lib/auth-client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@simplist/ui/components/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@simplist/ui/components/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@simplist/ui/components/field"
import { PasswordInput } from "@simplist/ui/components/password-input"
import { Spinner } from "@simplist/ui/components/spinner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const disable2FASchema = z.object({
  password: z.string().min(1, "Password is required"),
})

type Disable2FAInput = z.infer<typeof disable2FASchema>

interface Disable2FADialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDisabled?: () => void
}

export const Disable2FADialog = ({ open, onOpenChange, onDisabled }: Disable2FADialogProps) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Disable2FAInput>({
    resolver: zodResolver(disable2FASchema),
    mode: "onSubmit",
    defaultValues: {
      password: "",
    },
  })

  const onSubmit = async (data: Disable2FAInput) => {
    setIsSubmitting(true)

    toast.promise(
      authClient.twoFactor.disable({ password: data.password }), {
        loading: "Disabling 2FA...",
        success: () => {
          reset()
          onOpenChange(false)
          onDisabled?.()
          router.refresh()
          return "2FA disabled successfully"
        },
        error: (err) => {
          setIsSubmitting(false)
          const message = err instanceof Error ? err.message : "Failed to disable 2FA"
          return message
        },
      }
    )
  }

  const handleClose = () => {
    if (!isSubmitting) {
      reset()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Disable 2FA</DialogTitle>
          <DialogDescription>
            Enter your password to disable two-factor authentication. Your account will be less secure without it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} id="disable-2fa-form">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <PasswordInput
                id="password"
                {...register("password")}
                disabled={isSubmitting}
              />
              {errors.password && (
                <FieldError>{errors.password.message}</FieldError>
              )}
            </Field>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="disable-2fa-form" variant="destructive" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : "Disable 2FA"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
