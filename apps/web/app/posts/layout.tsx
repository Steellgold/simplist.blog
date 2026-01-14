import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { LightRays } from "@simplist/ui/components/shared/light-rays";
import type { ReactNode } from "react";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div className="from-background via-background to-secondary/20 fixed inset-0 bg-linear-to-br" />

      <LightRays
        count={8}
        color="rgba(240, 187, 59, 0.3)"
        blur={100}
        speed={10}
        length="30vh"
        className="fixed inset-0 z-0"
      />

      <div className="relative z-10">
        <Navbar />

        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>

        <Footer />
      </div>
    </div>
  );
}
