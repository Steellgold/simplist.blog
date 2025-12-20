import { Verify2FAForm } from "@/components/auth/verify-2fa-form";
import { SimplistIcon } from "@/components/icon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "2FA Verification",
  robots: { index: false, follow: false },
};

const Verify2FAPage = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center justify-center">
          <SimplistIcon />
        </div>

        <Verify2FAForm />
      </div>
    </div>
  );
};

export default Verify2FAPage;
