import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Footer from "@/components/footer";

const LegalLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <Link href="/" className={buttonVariants({
            variant: "ghost",
            size: "sm"
          })}>
            <ArrowLeft />
            Back to Simplist
          </Link>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default LegalLayout;