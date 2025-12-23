"use client";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  ForgotPasswordInput,
  forgotPasswordSchema,
} from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@simplist/ui/components/alert";
import { Button } from "@simplist/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@simplist/ui/components/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@simplist/ui/components/field";
import { Input } from "@simplist/ui/components/input";
import { toast } from "@simplist/ui/components/sonner";
import { AlertCircleIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const ForgotPasswordForm = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError("");

    toast.promise(
      authClient.requestPasswordReset(
        {
          email: data.email,
          redirectTo: "/auth/reset-password",
        },
        {
          onSuccess: () => {
            setSuccess(true);
          },
          onError: (ctx) => {
            setError(ctx.error.message || "Failed to send reset link");
            throw new Error(ctx.error.message);
          },
        },
      ),
      {
        loading: "Sending reset link...",
        success: "Reset link sent",
        error: (err) => err?.message || "An error occurred",
      },
    );
  };

  if (success) {
    return (
      <div className={cn("flex flex-col gap-3", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We've sent a password reset link to {getValues("email")}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-sm underline-offset-4 hover:underline"
              >
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Forgot your password?</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your
            password
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col gap-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>Error sending reset link</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
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
                    <FieldError>{errors.email.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send reset link"}
                  </Button>
                  <FieldDescription className="text-center">
                    Remember your password?{" "}
                    <Link href="/auth/login">Login</Link>
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
  );
};
