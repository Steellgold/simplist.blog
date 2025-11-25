import Link from "next/link";
import { Button } from "@simplist/ui/components/button";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/layout/footer";

const LegalLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft />
              Back to Simplist
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl prose prose-gray dark:prose-invert">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default LegalLayout;
