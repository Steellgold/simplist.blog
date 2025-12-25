import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
};

export default AuthLayout;
