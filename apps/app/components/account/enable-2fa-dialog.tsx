"use client";

import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@simplist/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@simplist/ui/components/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@simplist/ui/components/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@simplist/ui/components/input-otp";
import { PasswordInput } from "@simplist/ui/components/password-input";
import { ThemeSwitcher } from "@simplist/ui/components/shared/switch-theme";
import { Spinner } from "@simplist/ui/components/spinner";
import { CopyIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { z } from "zod";

const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

const verifyCodeSchema = z.object({
  code: z
    .string()
    .min(6, "Code must be 6 digits")
    .max(6, "Code must be 6 digits"),
});

type PasswordInput = z.infer<typeof passwordSchema>;
type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
type Step = "password" | "verify" | "backup";

interface Enable2FADialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnabled?: () => void;
}

export const Enable2FADialog = ({
  open,
  onOpenChange,
  onEnabled,
}: Enable2FADialogProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [step, setStep] = useState<Step>("password");

  const passwordForm = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  });

  const verifyForm = useForm<VerifyCodeInput>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { code: "" },
  });

  const resetState = () => {
    passwordForm.reset();
    verifyForm.reset();
    setStep("password");
    setQrCode(null);
    setSecretKey(null);
    setBackupCodes([]);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetState();
      onOpenChange(false);
    }
  };

  const handlePasswordSubmit = async (data: PasswordInput) => {
    setIsSubmitting(true);
    toast.promise(authClient.twoFactor.enable({ password: data.password }), {
      loading: "Enabling 2FA...",
      success: (result) => {
        if (result.data) {
          setQrCode(result.data.totpURI);
          // Extract secret from URI (format: otpauth://totp/...?secret=XXXX&...)
          const uri = result.data.totpURI;
          const secretMatch = uri.match(/secret=([^&]+)/);
          if (secretMatch) {
            setSecretKey(secretMatch[1]);
          }
          setBackupCodes(result.data.backupCodes || []);
          setStep("verify");
          setIsSubmitting(false);
        }
        return "2FA enabled successfully";
      },
      error: (err) => {
        setIsSubmitting(false);
        return err.error.message || "Failed to enable 2FA";
      },
    });
  };

  const handleCopySecret = async () => {
    if (secretKey) {
      await navigator.clipboard.writeText(secretKey);
      toast.success("Secret key copied to clipboard");
    }
  };

  const handleVerifySubmit = async (data: VerifyCodeInput) => {
    setIsSubmitting(true);
    toast.promise(authClient.twoFactor.verifyTotp({ code: data.code }), {
      loading: "Verifying code...",
      success: () => {
        setStep("backup");
        setIsSubmitting(false);
        return "Code verified successfully";
      },
      error: (err) => {
        setIsSubmitting(false);
        return err.error.message || "Failed to verify code";
      },
    });
  };

  const handleFinish = () => {
    toast.success("2FA enabled successfully");
    resetState();
    onOpenChange(false);
    onEnabled?.();
    router.refresh();
  };

  const stepConfig: Record<Step, { title: string; description: string }> = {
    password: {
      title: "Enable 2FA",
      description: "Enter your password to continue",
    },
    verify: {
      title: "Verify Your Code",
      description:
        "Scan the QR code with your authenticator app and enter the code",
    },
    backup: {
      title: "Save Your Backup Codes",
      description:
        "Save these backup codes in a safe place. You'll need them if you lose access to your authenticator.",
    },
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{stepConfig[step].title}</DialogTitle>
          <DialogDescription>{stepConfig[step].description}</DialogDescription>
        </DialogHeader>

        {step === "password" && (
          <>
            <form
              onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
              id="password-form"
            >
              <FieldGroup>
                <Field data-invalid={!!passwordForm.formState.errors.password}>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <PasswordInput
                    id="password"
                    {...passwordForm.register("password")}
                    disabled={isSubmitting}
                    aria-invalid={!!passwordForm.formState.errors.password}
                  />
                  <FieldError>
                    {passwordForm.formState.errors.password?.message}
                  </FieldError>
                </Field>
              </FieldGroup>
            </form>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="password-form"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner /> : "Continue"}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "verify" && qrCode && (
          <>
            <form
              onSubmit={verifyForm.handleSubmit(handleVerifySubmit)}
              id="verify-form"
            >
              <FieldGroup>
                <div className="flex flex-col items-center gap-4 py-4">
                  <QRCode value={qrCode} size={200} />

                  {secretKey && (
                    <div className="w-full">
                      <FieldLabel>Or enter this code manually</FieldLabel>
                      <div className="mt-2 flex items-center gap-2">
                        <code className="bg-muted flex-1 rounded-md px-3 py-2 font-mono text-sm break-all">
                          {secretKey}
                        </code>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCopySecret}
                          disabled={isSubmitting}
                        >
                          <CopyIcon className="size-4" />
                        </Button>
                      </div>
                      <FieldDescription className="mt-2">
                        Use this key if you can't scan the QR code
                      </FieldDescription>
                    </div>
                  )}
                </div>

                <Field data-invalid={!!verifyForm.formState.errors.code}>
                  <FieldLabel htmlFor="code">Verification Code</FieldLabel>
                  <InputOTP
                    maxLength={6}
                    value={verifyForm.watch("code")}
                    onChange={(value) => verifyForm.setValue("code", value)}
                    disabled={isSubmitting}
                    aria-invalid={!!verifyForm.formState.errors.code}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  <FieldDescription>
                    Enter the 6-digit code from your authenticator app
                  </FieldDescription>
                  <FieldError>
                    {verifyForm.formState.errors.code?.message}
                  </FieldError>
                </Field>
              </FieldGroup>
            </form>

            <DialogFooter className="flex flex-row items-center justify-between!">
              <ThemeSwitcher />

              <div className="flex flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="verify-form"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Spinner /> : "Verify"}
                </Button>
              </div>
            </DialogFooter>
          </>
        )}

        {step === "backup" && (
          <>
            <div className="bg-muted grid grid-cols-2 gap-2 rounded-md p-4">
              {backupCodes.map((code, index) => (
                <code key={index} className="font-mono text-sm">
                  {code}
                </code>
              ))}
            </div>

            <DialogFooter>
              <Button onClick={handleFinish}>I've Saved My Codes</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
