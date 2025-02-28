"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { PasswordInputRequirements } from "@workspace/ui/components/requirements-input-password";
import { ToastAction } from "@workspace/ui/components/toast";
import { Component } from "@workspace/ui/components/utils/component";
import { useToast } from "@workspace/ui/hooks/use-toast";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { z } from "zod";
import { notFound, useRouter, useSearchParams } from "next/navigation";

const resetPasswordSchema = z.object({
  password: z.string().min(8),
  token: z.string(),
});

export const ResetPasswordForm: Component<React.ComponentPropsWithoutRef<"div">> = ({
  className,
  ...props
}) => {
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!searchParams.has("token")) {
      notFound();
    }

    setToken(searchParams.get("token"));
  }, [searchParams]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset Your Password</CardTitle>
          <CardDescription>Create a new password for your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={async(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            
            const formData = new FormData(e.currentTarget);
            
            const result = resetPasswordSchema.safeParse({
              password: formData.get("password"),
              token: token
            });
            
            if (!result.success) {
              toast({
                title: "Data validation error",
                description: "Please check the form fields and try again",
                action: <ToastAction altText="Try again">Try again</ToastAction>,
                variant: "destructive",
              });
              return;
            }
            
            await authClient.resetPassword({
              newPassword: result.data.password,
              token: result.data.token,
              fetchOptions: {
                onRequest: () => {
                  setLoading(true);
                },
                onError: (ctx) => {
                  toast({
                    title: "Error resetting password",
                    description: ctx.error.message || "An error occurred while resetting your password",
                    action: <ToastAction altText="Close">Close</ToastAction>,
                    variant: "destructive",
                  });
                  setLoading(false);
                },
                onSuccess: () => {
                  setLoading(false);
                  setSuccess(true);
                  toast({
                    title: "Password reset successful",
                    description: "Your password has been successfully reset"
                  });

                  router.push("/auth");
                },
              },
            });
          }}>
            <div className="grid gap-6">
              <input type="hidden" name="token" value={token ?? ""} />
              
              <PasswordInputRequirements />
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Reset Password"}
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
        By clicking reset password, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
};