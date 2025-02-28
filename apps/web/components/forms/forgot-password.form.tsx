"use client";

import type React from "react"
import { Component } from "@workspace/ui/components/utils/component"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { Label } from "@workspace/ui/components/label"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { toast } from "@workspace/ui/hooks/use-toast"
import { authClient } from "@/lib/auth-client"
import { z } from "zod"
import { useState } from "react";
import { Check, Loader2, MailCheck } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const ForgotPasswordForm: Component<React.ComponentPropsWithoutRef<"div">> = ({
  className,
  ...props
}) => {
  const [isPending, setIsPending] = useState<boolean | "yet">(false);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Forgot Password</CardTitle>
          <CardDescription>Enter your email address to reset your password</CardDescription>
        </CardHeader>
        <CardContent>
          {isPending === "yet" && (
            <Alert className="mb-4">
              <MailCheck className="w-4 h-4" />
              <AlertDescription>
                If an account with that email exists, we will send a password reset link to your email.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={async(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (isPending) return;
            
            const formData = Object.fromEntries(new FormData(e.currentTarget).entries());
            const result = forgotPasswordSchema.safeParse(formData);
            
            if (result.error) {
              toast({
                title: "Data validation error",
                description: "Please check the form fields and try again",
                variant: "destructive",
              })
              return;
            }

            await authClient.forgetPassword({
              email: result.data.email,
              redirectTo: "/auth/reset-password",
              fetchOptions: {
                onRequest: () => {
                  toast({
                    title: "Sending reset password email",
                    description: "Please check your email for instructions"
                  });
                  setIsPending(true);
                },
                onError: (error) => {
                  toast({
                    title: "Error sending reset password email",
                    description: error.error.message || "Error sending reset password email",
                    variant: "destructive"
                  })

                  setIsPending(false);
                },
                onSuccess: () => {
                  toast({
                    title: "Reset password email sent",
                    description: "Please check your email for instructions"
                  });

                  setIsPending("yet");
                }
              }
            })
          }}>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
              </div>

              <Button type="submit" className="w-full" disabled={isPending === true || isPending === "yet"}>
                {
                  isPending == "yet"
                    ? <Check className="w-6 h-6" />
                    : isPending !== false ? <Loader2 className="w-6 h-6 animate-spin" /> : "Reset Password"
                }
              </Button>

              <div className="text-center text-sm">
                Remember your password?{" "}
                <a href="/auth" className="underline underline-offset-4">
                  Back to login
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        By clicking reset password, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        .
      </div>
    </div>
  )
}

