"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useState } from "react"

export function ForgotPasswordForm({ className, ...props }: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await authClient.forgetPassword({
        email,
        redirectTo: "/auth/reset-password",
      }, {
        onSuccess: () => {
          setSuccess(true)
        },
        onError: (ctx) => {
          setError(ctx.error.message || "Failed to send reset link")
        }
      })
    } catch (err) {
      setError("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={cn("flex flex-col gap-3", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent a password reset link to {email}
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
          <form onSubmit={handleSubmit}>
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
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>

                <Field>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send reset link"}
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
