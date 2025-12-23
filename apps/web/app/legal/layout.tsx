import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

const LegalLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Navbar sticky={false} />

      <main className="container mx-auto max-w-4xl flex-1 px-4 py-8">
        <div className="legal-content mx-auto max-w-3xl">{children}</div>
      </main>

      <Footer />
    </div>
  );
};

export default LegalLayout;
