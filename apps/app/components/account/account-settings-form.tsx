"use client"

import { UserAvatarUpload } from "@/components/account/user-avatar-upload"
import { updateUserInformation } from "@/lib/actions/user"
import { authClient, User } from "@/lib/auth-client"
import { UpdateUserEmailInput, updateUserEmailSchema, UpdateUserInformationInput, updateUserInformationSchema } from "@/lib/validations/user"
import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, AlertDescription, AlertTitle } from "@simplist/ui/components/alert"
import { Button } from "@simplist/ui/components/button"
import { Card, CardContent, CardFooter, CardHeader } from "@simplist/ui/components/card"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@simplist/ui/components/field"
import { Input } from "@simplist/ui/components/input"
import { toast } from "@simplist/ui/components/sonner"
import { Spinner } from "@simplist/ui/components/spinner"
import { CheckCircle2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"

interface AccountSettingsFormProps {
  user: User
  isOAuthUser: boolean
}

export const AccountSettingsForm = ({ user, isOAuthUser }: AccountSettingsFormProps) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false)

  const { register, handleSubmit } = useForm<UpdateUserInformationInput>({
    resolver: zodResolver(updateUserInformationSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
    },
  })

  const { register: registerEmail, handleSubmit: handleSubmitEmail } = useForm<UpdateUserEmailInput>({
    resolver: zodResolver(updateUserEmailSchema),
    defaultValues: {
      email: user.email || "",
    },
  })


  const onSubmit = async (data: UpdateUserInformationInput) => {
    setIsSubmitting(true)

    toast.promise(
      updateUserInformation(data), {
        loading: "Saving changes...",
        success: () => {
          setIsSubmitting(false)
          router.refresh()
          return "Profile updated successfully"
        },
        error: (err: unknown) => {
          const message = err instanceof Error ? err.message : "Failed to update profile"
          setIsSubmitting(false)
          return message
        },
      }
    )
  }

  const onEmailSubmit = async (data: UpdateUserEmailInput) => {
    setIsSubmitting(true)

    toast.promise(
      authClient.changeEmail({
        newEmail: data.email,
        callbackURL: "/account/settings"
      }), {
        loading: "Saving changes...",
        success: () => {
          setIsSubmitting(false)
          setIsEmailSubmitted(true)
          return "Email updated successfully"
        },
        error: (err: unknown) => {
          const message = err instanceof Error ? err.message : "Failed to update email"
          setIsSubmitting(false)
          return message
        },
      }
    )
  }

  return (
    <div className="space-y-4">
      {/* Avatar */}
      <Card>
        <CardHeader>
          <FieldLabel className="text-base font-medium">Avatar</FieldLabel>
          <FieldDescription className="mt-1">
            Customize your profile avatar.
          </FieldDescription>
        </CardHeader>

        <CardContent>
          <UserAvatarUpload user={user} disabled={isSubmitting} />
        </CardContent>
      </Card>

      {/* Identity */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card variant="form">
          <CardHeader>
            <FieldLabel className="text-base font-medium">Identity</FieldLabel>
            <FieldDescription className="mt-1">
              Define your name and surname displayed in the app.
            </FieldDescription>
          </CardHeader>

          <CardContent>
            <FieldSet>
              <FieldGroup>
                <Field orientation="responsive">
                  <Field orientation="vertical" className="flex-1">
                    <FieldContent>
                      <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                      <Input
                        id="firstName"
                        autoComplete="given-name"
                        {...register("firstName")}
                        disabled={isSubmitting}
                      />
                    </FieldContent>
                  </Field>

                  <Field orientation="vertical" className="flex-1">
                    <FieldContent>
                      <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                      <Input
                        id="lastName"
                        autoComplete="family-name"
                        {...register("lastName")}
                        disabled={isSubmitting}
                      />
                    </FieldContent>
                  </Field>
                </Field>
              </FieldGroup>
            </FieldSet>
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <form onSubmit={handleSubmitEmail(onEmailSubmit)}>
        <Card variant="form">
          <CardHeader>
            <FieldLabel className="text-base font-medium">Email</FieldLabel>
            <FieldDescription>
              Update the email associated with your account.
            </FieldDescription>
          </CardHeader>

          <CardContent>
            {isEmailSubmitted && (
              <Alert className="mb-4" variant="default">
                <CheckCircle2Icon />
                <AlertTitle>Success! Your email has been updated</AlertTitle>
                <AlertDescription>
                  You will receive an email with a link to verify your new email address.
                </AlertDescription>
              </Alert>
            )}

            <FieldSet>
              <FieldGroup>
                <Field orientation="responsive">
                  <Input
                    placeholder="jondoe@company.com"
                    autoComplete="username webauthn"
                    type="email"
                    disabled={isSubmitting || isEmailSubmitted || isOAuthUser}
                    {...registerEmail("email")}
                  />
                </Field>
              </FieldGroup>
            </FieldSet>
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || isOAuthUser}>
              {isSubmitting ? <Spinner /> : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}