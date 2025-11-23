"use client"

import { changePassword } from "@/lib/actions/security"
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

const changePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type ChangePasswordInput = z.infer<typeof changePasswordSchema>

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hasPassword: boolean
}

export const ChangePasswordDialog = ({ open, onOpenChange, hasPassword }: ChangePasswordDialogProps) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onSubmit",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: ChangePasswordInput) => {
    setIsSubmitting(true)

    try {
      toast.promise(
        changePassword(data.currentPassword || "", data.newPassword),
        {
          loading: hasPassword ? "Changing password..." : "Setting password...",
          success: () => {
            reset()
            onOpenChange(false)
            router.refresh()
            return hasPassword ? "Password changed successfully" : "Password set successfully"
          },
          error: (err) => {
            const message = err instanceof Error ? err.message : "Failed to change password"
            return message
          },
        }
      )
    } finally {
      setIsSubmitting(false)
    }
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
          <DialogTitle>{hasPassword ? "Change Password" : "Set Password"}</DialogTitle>
          <DialogDescription>
            {hasPassword
              ? "Enter your current password and choose a new password"
              : "Choose a password for your account"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            {hasPassword && (
              <Field>
                <FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
                <PasswordInput
                  id="currentPassword"
                  {...register("currentPassword")}
                  disabled={isSubmitting}
                />

                {errors.currentPassword && (
                  <FieldError>{errors.currentPassword.message}</FieldError>
                )}
              </Field>
            )}

            <Field orientation="responsive">
              <FieldLabel htmlFor="newPassword">{hasPassword ? "New Password" : "Password"}</FieldLabel>

              <PasswordInput
                id="newPassword"
                {...register("newPassword")}
                disabled={isSubmitting}
                showGenerator
              />

              {errors.newPassword && (
                <FieldError>{errors.newPassword.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
              <PasswordInput
                id="confirmPassword"
                {...register("confirmPassword")}
                disabled={isSubmitting}
                showGenerator
              />

              {errors.confirmPassword && (
                <FieldError>{errors.confirmPassword.message}</FieldError>
              )}
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner /> Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
