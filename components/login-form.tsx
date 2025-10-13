"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { OAuthProviders, OAuthProvidersProvider, useOAuthProviders } from "./oauth-providers"
import { PasswordInput } from "./password-input"

function LoginFormContent({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter()
  const { isAuthenticating } = useOAuthProviders()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await authClient.signIn.email({
        email,
        password,
      }, {
        onSuccess: () => {
          router.push("/")
        },
        onError: (ctx) => {
          setError(ctx.error.message || "Invalid email or password")
        }
      })
    } catch (err) {
      setError("An error occurred during login")
    } finally {
      setLoading(false)
    }
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
          <form onSubmit={handleSubmit}>
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
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
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
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Field>

                <Field>
                  <Button type="submit" disabled={loading || isAuthenticating}>
                    {loading ? "Logging in..." : "Login"}
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