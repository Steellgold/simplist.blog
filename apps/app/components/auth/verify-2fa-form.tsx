"use client"

import { authClient } from "@/lib/auth-client"
import { getRedirectUrl } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, AlertDescription, AlertTitle } from "@simplist/ui/components/alert"
import { Button } from "@simplist/ui/components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@simplist/ui/components/card"
import { Checkbox } from "@simplist/ui/components/checkbox"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@simplist/ui/components/field"
import { Input } from "@simplist/ui/components/input"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@simplist/ui/components/input-otp"
import { Spinner } from "@simplist/ui/components/spinner"
import { AlertCircleIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const verify2FASchema = z.object({
  code: z.string().min(1, "Code is required"),
  trustDevice: z.boolean(),
})

type Verify2FAInput = z.infer<typeof verify2FASchema>

export const Verify2FAForm = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Verify2FAInput>({
    resolver: zodResolver(verify2FASchema),
    defaultValues: {
      code: "",
      trustDevice: false,
    },
  })

  const trustDevice = watch("trustDevice")

  const onSubmit = async (data: Verify2FAInput) => {
    setIsSubmitting(true)
    setError("")

    const verifyFn = useBackupCode
      ? authClient.twoFactor.verifyBackupCode({
          code: data.code,
          trustDevice: data.trustDevice,
        })
      : authClient.twoFactor.verifyTotp({
          code: data.code,
          trustDevice: data.trustDevice,
        })

    toast.promise(
      verifyFn.then(
        (result) => {
          if (result.error) {
            setIsSubmitting(false)
            setError(result.error.message || "Invalid code. Please try again.")
            throw new Error(result.error.message || "Invalid code")
          }
          router.push(getRedirectUrl())
          return result
        }
      ),
      {
        loading: "Verifying code...",
        success: "Verification successful",
        error: (err) => {
          setIsSubmitting(false)
          return err?.message || "Failed to verify code"
        },
      }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter the {useBackupCode ? "backup code" : "verification code from your authenticator app"} to continue
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} id="verify-2fa-form">
          <FieldGroup>
            {error && (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>Verification failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Field data-invalid={!!errors.code}>
              <FieldLabel htmlFor="code">
                {useBackupCode ? "Backup Code" : "Verification Code"}
              </FieldLabel>

              {useBackupCode ? (
                <Input
                  id="code"
                  placeholder="GcNdB-mRmdt"
                  {...register("code")}
                  disabled={isSubmitting}
                  maxLength={12}
                  aria-invalid={!!errors.code}
                />
              ) : (
                <InputOTP
                  maxLength={6}
                  value={watch("code")}
                  onChange={(value) => setValue("code", value)}
                  disabled={isSubmitting}
                  aria-invalid={!!errors.code}
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
              )}

              {errors.code && <FieldError>{errors.code.message}</FieldError>}
              {!errors.code && useBackupCode && (
                <FieldDescription>
                  Enter the backup code with the dash (e.g., GcNdB-mRmdt)
                </FieldDescription>
              )}
              {!errors.code && !useBackupCode && (
                <FieldDescription>
                  Enter the 6-digit code from your authenticator app
                </FieldDescription>
              )}
            </Field>

            <Field orientation="responsive">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="trustDevice"
                  checked={trustDevice}
                  onCheckedChange={(checked) => setValue("trustDevice", !!checked)}
                  disabled={isSubmitting}
                />

                <FieldLabel htmlFor="trustDevice" className="cursor-pointer">
                  Trust this device for 60 days
                </FieldLabel>
              </div>

              <FieldDescription>
                You won't need to enter a code on this device for 60 days
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="*:w-full flex flex-col gap-2">
        <Button
          type="submit"
          form="verify-2fa-form"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner /> : "Verify"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => setUseBackupCode(!useBackupCode)}
          disabled={isSubmitting}
        >
          {useBackupCode ? "Use authenticator code" : "Use backup code"}
        </Button>
      </CardFooter>
    </Card>
  )
}
