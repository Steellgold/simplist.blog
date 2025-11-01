"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/sonner"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { RegisterInput, registerSchema } from "@/lib/validations/auth"
import { OAuthProviders, OAuthProvidersProvider, useOAuthProviders } from "./oauth-providers"
import { PasswordInput } from "./password-input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircleIcon } from "lucide-react"

const RegisterFormContent = ({ className, ...props }: React.ComponentProps<"div">) => {
  const router = useRouter()
  const { isAuthenticating } = useOAuthProviders()
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)

    toast.promise(
      authClient.signUp.email({
        name: `${data.firstName} ${data.lastName}`,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      }), {
        loading: "Creating account...",
        success: () => {
          setSuccess(true)
          setIsLoading(false)
          return "Account created successfully"
        },
        error: (err) => {
          setIsLoading(false)
          return err.error.message || "Failed to create account"
        },
      }
    )
  }

  if (success) {
    return (
      <div className={cn("flex flex-col gap-3", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We've sent a verification link to {getValues("email")}
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
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <OAuthProviders />

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>

              <div className="flex flex-col gap-4">
                {errors.root && 
                  <Alert variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>Error creating account</AlertTitle>
                    <AlertDescription>
                      {errors.root.message}
                    </AlertDescription>
                  </Alert>
                }

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      {...register("firstName")}
                      disabled={isLoading || isAuthenticating}
                    />

                    {errors.firstName && <FieldError>{errors.firstName.message}</FieldError>}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      {...register("lastName")}
                      disabled={isLoading || isAuthenticating}
                    />

                    {errors.lastName && <FieldError>{errors.lastName.message}</FieldError>}
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jondoe@company.com"
                    {...register("email")}
                    disabled={isLoading || isAuthenticating}
                  />

                  {errors.email && <FieldError>{errors.email.message}</FieldError>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <PasswordInput
                    id="password"
                    {...register("password")}
                    disabled={isLoading || isAuthenticating}
                    showGenerator
                  />

                  {errors.password && <FieldError>{errors.password.message}</FieldError>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                  <PasswordInput
                    id="confirmPassword"
                    {...register("confirmPassword")}
                    disabled={isLoading || isAuthenticating}
                    showGenerator
                  />

                  {errors.confirmPassword && <FieldError>{errors.confirmPassword.message}</FieldError>}
                </Field>

                <Field>
                  <Button type="submit" disabled={isLoading || isAuthenticating}>
                    {isLoading ? "Creating account..." : "Sign up"}
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

      <FieldDescription className="px-6 text-center mt-6!">
        By clicking Sign up, you agree to our <Link href="/legal/terms">Terms of Service</Link>{" "}
        and <Link href="/legal/privacy">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  )
}

export const RegisterForm = (props: React.ComponentProps<"div">) => {
  return (
    <OAuthProvidersProvider>
      <RegisterFormContent {...props} />
    </OAuthProvidersProvider>
  )
}
