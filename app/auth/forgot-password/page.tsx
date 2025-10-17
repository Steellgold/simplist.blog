import { ForgotPasswordForm } from "@/components/forgot-password-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Forgot Password",
  robots: { index: false, follow: false },
}

const LoginPage = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        {/* <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Simplist.
        </a> */}
        <ForgotPasswordForm />
      </div>
    </div>
  )
}

export default LoginPage