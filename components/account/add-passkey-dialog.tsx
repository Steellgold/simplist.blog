"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

const addPasskeySchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
})

type AddPasskeyInput = z.infer<typeof addPasskeySchema>

interface AddPasskeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
}

export const AddPasskeyDialog = ({ open, onOpenChange, userName }: AddPasskeyDialogProps) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddPasskeyInput>({
    resolver: zodResolver(addPasskeySchema),
    mode: "onSubmit",
    defaultValues: {
      name: `${userName}'s Device`,
    },
  })

  const onSubmit = async (data: AddPasskeyInput) => {
    setIsSubmitting(true);

    await authClient.passkey.addPasskey({
      name: data.name,
      authenticatorAttachment: "cross-platform",
      fetchOptions: {
        onSuccess: () => {
          toast.success("Passkey added successfully")
          reset()
          onOpenChange(false)
          router.refresh()
        },
        onResponse: (response) => {
          console.log(response)
        },
        onError: (e) => {
          toast.error(e.error.message)
        }
      }
    })
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
          <DialogTitle>Add Passkey</DialogTitle>
          <DialogDescription>
            Give your passkey a name to identify it later
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Passkey Name</FieldLabel>
              <Input
                id="name"
                placeholder="Device Name"
                {...register("name")}
                disabled={isSubmitting}
              />

              {errors.name && (
                <FieldError>{errors.name.message}</FieldError>
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

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : "Add Passkey"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
