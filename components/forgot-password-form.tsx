"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useState } from "react"
import { ForgotPasswordInput, forgotPasswordSchema } from "@/lib/validations/auth"
import { toast } from "@/components/ui/sonner"

export const ForgotPasswordForm = ({ className, ...props }: React.ComponentProps<"div">) => {
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError("")

    await toast.promise(
      authClient.forgetPassword({
        email: data.email,
        redirectTo: "/auth/reset-password",
      }, {
        onSuccess: () => {
          setSuccess(true)
        },
        onError: (ctx) => {
          setError(ctx.error.message || "Failed to send reset link")
          throw new Error(ctx.error.message)
        }
      }),
      {
        loading: "Sending reset link...",
        success: "Reset link sent",
        error: (err) => err?.message || "An error occurred",
      }
    )
  }

  if (success) {
    return (
      <div className={cn("flex flex-col gap-3", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent a password reset link to {getValues("email")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Link href="/auth/login" className="text-sm underline-offset-4 hover:underline">
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Forgot your password?</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a link to reset your password
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col gap-4">
                {error && (
                  <div className="text-destructive text-sm text-center">{error}</div>
                )}

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jondoe@company.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
                  )}
                </Field>

                <Field>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send reset link"}
                  </Button>
                  <FieldDescription className="text-center">
                    Remember your password? <Link href="/auth/login">Login</Link>
                  </FieldDescription>
                </Field>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
