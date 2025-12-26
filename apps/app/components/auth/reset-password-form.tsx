"use client";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  ResetPasswordInput,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import { CircleExclamation } from "@gravity-ui/icons";
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
import { PasswordInput } from "@simplist/ui/components/password-input";
import { toast } from "@simplist/ui/components/sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import type { ComponentProps } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const ResetPasswordForm = ({
  className,
  ...props
}: ComponentProps<"div">) => {
  const [error, setError] = useState("");
  const [token] = useQueryState("token");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setError("");

    toast.promise(
      authClient.resetPassword(
        {
          newPassword: data.password,
          token: token || undefined,
        },
        {
          onSuccess: () => {
            router.push("/auth/login");
          },
          onError: (ctx) => {
            setError(ctx.error.message || "Failed to reset password");
            throw new Error(ctx.error.message);
          },
        },
      ),
      {
        loading: "Resetting password...",
        success: "Password reset successfully! Redirecting to login...",
        error: (err) => err?.message || "An error occurred",
      },
    );
  };

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col gap-4">
                {error && (
                  <Alert variant="destructive">
                    <CircleExclamation />
                    <AlertTitle>Error resetting password</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Field>
                  <FieldLabel htmlFor="password">New Password</FieldLabel>
                  <PasswordInput
                    id="password"
                    {...register("password")}
                    showGenerator
                    disabled={isSubmitting}
                  />

                  {errors.password && (
                    <FieldError>{errors.password.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirm Password
                  </FieldLabel>
                  <PasswordInput
                    id="confirmPassword"
                    {...register("confirmPassword")}
                    showGenerator
                    disabled={isSubmitting}
                  />

                  {errors.confirmPassword && (
                    <FieldError>{errors.confirmPassword.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Resetting..." : "Reset password"}
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
