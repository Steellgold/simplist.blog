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
import { LoginInput, loginSchema } from "@/lib/validations/auth"
import { OAuthProviders, OAuthProvidersProvider, useOAuthProviders } from "./oauth-providers"
import { PasswordInput } from "./password-input"
import { toast } from "@/components/ui/sonner"

function LoginFormContent({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter()
  const { isAuthenticating } = useOAuthProviders()
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginInput) => {
    setError("")

    await toast.promise(
      authClient.signIn.email({
        email: data.email,
        password: data.password,
      }, {
        onSuccess: () => {
          router.push("/dashboard")
        },
        onError: (ctx) => {
          setError(ctx.error.message || "Invalid email or password")
          throw new Error(ctx.error.message)
        }
      }),
      {
        loading: "Logging in...",
        success: "Logged in successfully",
        error: (err) => err?.message || "An error occurred during login",
      }
    )
  }

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your GitHub or Google account
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
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Link href="/auth/forgot-password" className="ml-auto text-sm underline-offset-4 hover:underline">
                      Forgot your password?
                    </Link>
                  </div>

                  <PasswordInput
                    id="password"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-destructive text-sm mt-1">{errors.password.message}</p>
                  )}
                </Field>

                <Field>
                  <Button type="submit" disabled={isSubmitting || isAuthenticating}>
                    {isSubmitting ? "Logging in..." : "Login"}
                  </Button>
                  <FieldDescription className="text-center">
                    Don&apos;t have an account? <Link href="/auth/register">Sign up</Link>
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

export function LoginForm(props: React.ComponentProps<"div">) {
  return (
    <OAuthProvidersProvider>
      <LoginFormContent {...props} />
    </OAuthProvidersProvider>
  )
}