import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { SimplistIcon } from "@/components/icon"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reset Password",
  robots: { index: false, follow: false },
}

const ResetPasswordPage = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center justify-center">
          <SimplistIcon />
        </div>

        <ResetPasswordForm />
      </div>
    </div>
  )
}

export default ResetPasswordPage
