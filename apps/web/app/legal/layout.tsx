import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

const LegalLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="legal-content mx-auto max-w-3xl">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LegalLayout;
