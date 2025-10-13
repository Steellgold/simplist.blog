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

function RegisterFormContent({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter()
  const { isAuthenticating } = useOAuthProviders()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setLoading(true)

    try {
      await authClient.signUp.email({
        name: `${firstName} ${lastName}`,
        email,
        password,
      }, {
        onSuccess: () => {
          router.push("/")
        },
        onError: (ctx) => {
          setError(ctx.error.message || "Failed to create account")
        }
      })
    } catch (err) {
      setError("An error occurred during registration")
    } finally {
      setLoading(false)
    }
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

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </Field>
                </div>

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
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <PasswordInput
                    id="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                  <PasswordInput
                    id="confirmPassword"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Field>

                <Field>
                  <Button type="submit" disabled={loading || isAuthenticating}>
                    {loading ? "Creating account..." : "Sign up"}
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
