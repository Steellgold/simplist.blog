"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { RegisterInput, registerSchema } from "@/lib/validations/auth"
import { OAuthProviders, OAuthProvidersProvider, useOAuthProviders } from "./oauth-providers"
import { PasswordInput } from "./password-input"
import { toast } from "@/components/ui/sonner"

function RegisterFormContent({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter()
  const { isAuthenticating } = useOAuthProviders()
  const [error, setError] = useState("")
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: RegisterInput) => {
    setError("")

    await toast.promise(
      authClient.signUp.email({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
      }, {
        onSuccess: () => {
          router.push("/dashboard")
        },
        onError: (ctx) => {
          setError(ctx.error.message || "Failed to create account")
          throw new Error(ctx.error.message)
        }
      }),
      {
        loading: "Creating account...",
        success: "Account created",
        error: (err) => err?.message || "An error occurred during registration",
      }
    )
  }

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>
            Sign up with your GitHub or Google account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <OAuthProviders />

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>

              <div className="flex flex-col gap-4">
                {error && (
                  <div className="text-destructive text-sm text-center">{error}</div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      {...register("firstName")}
                    />
                    {errors.firstName && (
                      <p className="text-destructive text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      {...register("lastName")}
                    />
                    {errors.lastName && (
                      <p className="text-destructive text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </Field>
                </div>

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
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <PasswordInput
                    id="password"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-destructive text-sm mt-1">{errors.password.message}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                  <PasswordInput
                    id="confirmPassword"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="text-destructive text-sm mt-1">{errors.confirmPassword.message}</p>
                  )}
                </Field>

                <Field>
                  <Button type="submit" disabled={isSubmitting || isAuthenticating}>
                    {isSubmitting ? "Creating account..." : "Sign up"}
                  </Button>
                  <FieldDescription className="text-center">
                    Already have an account? <Link href="/auth/login">Login</Link>
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

export function RegisterForm(props: React.ComponentProps<"div">) {
  return (
    <OAuthProvidersProvider>
      <RegisterFormContent {...props} />
    </OAuthProvidersProvider>
  )
}
