"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { authClient } from "@/lib/auth-client";
import { cn, getRedirectUrl } from "@/lib/utils";
import { LoginInput, loginSchema } from "@/lib/validations/auth";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@simplist/ui/components/alert";
import { Button } from "@simplist/ui/components/button";
import { Card, CardContent } from "@simplist/ui/components/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@simplist/ui/components/field";
import { Input } from "@simplist/ui/components/input";
import { PasswordInput } from "@simplist/ui/components/password-input";
import { toast } from "@simplist/ui/components/sonner";
import { Spinner } from "@simplist/ui/components/spinner";
import { AlertCircleIcon } from "lucide-react";
import {
  OAuthProviders,
  OAuthProvidersProvider,
  useOAuthProviders,
} from "./oauth-providers";

const LoginFormContent = ({ className, ...props }: ComponentProps<"div">) => {
  const router = useRouter();
  const { isAuthenticating } = useOAuthProviders();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const initConditionalUI = async () => {
      if (
        typeof window !== "undefined" &&
        window.PublicKeyCredential &&
        typeof window.PublicKeyCredential.isConditionalMediationAvailable ===
          "function"
      ) {
        const available =
          await window.PublicKeyCredential.isConditionalMediationAvailable();
        if (available) {
          void authClient.signIn.passkey({
            autoFill: true,
            fetchOptions: {
              onSuccess: () => {
                router.push(getRedirectUrl());
                toast.success("Logged in successfully with Passkey");
              },
              onError: (context) => {
                if (
                  context.error.message !==
                  "The operation either timed out or was not allowed."
                ) {
                  console.error(
                    "Passkey autofill failed:",
                    context.error.message,
                  );
                }
              },
            },
          });
        }
      }
    };

    initConditionalUI();
  }, [router]);

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);

    try {
      await authClient.signIn.email(
        {
          email: data.email,
          password: data.password,
        },
        {
          onSuccess: (context) => {
            if (!context.data.twoFactorRedirect) {
              router.push(getRedirectUrl());
              toast.success("Logged in successfully");
            }
          },
          onError: (context) => {
            setIsLoading(false);
            toast.error(context.error.message || "Failed to login");
          },
        },
      );
    } catch (err) {
      setIsLoading(false);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <OAuthProviders variant="login" />

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>

              <div className="flex flex-col gap-4">
                {errors.root && (
                  <Alert variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>Error logging in</AlertTitle>
                    <AlertDescription>{errors.root.message}</AlertDescription>
                  </Alert>
                )}

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jondoe@company.com"
                    autoComplete="username webauthn"
                    {...register("email")}
                    disabled={isLoading || isAuthenticating}
                  />

                  {errors.email && (
                    <FieldError>{errors.email.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Link
                      href="/auth/forgot-password"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>

                  <PasswordInput
                    id="password"
                    autoComplete="current-password webauthn"
                    {...register("password")}
                    disabled={isLoading || isAuthenticating}
                  />

                  {errors.password && (
                    <FieldError>{errors.password.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <Button
                    type="submit"
                    disabled={isLoading || isAuthenticating}
                  >
                    {isLoading || isAuthenticating ? <Spinner /> : "Login"}
                  </Button>
                  <FieldDescription className="text-center">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/register">Sign up</Link>
                  </FieldDescription>
                </Field>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="mt-6! px-6 text-center">
        By clicking Sign up, you agree to our{" "}
        <Link href="/legal/terms">Terms of Service</Link> and{" "}
        <Link href="/legal/privacy">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  );
};

export const LoginForm = (props: ComponentProps<"div">) => {
  return (
    <OAuthProvidersProvider>
      <LoginFormContent {...props} />
    </OAuthProvidersProvider>
  );
};
