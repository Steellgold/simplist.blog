import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { LightRays } from "@simplist/ui/components/shared/light-rays";
import { ApiDemoSection } from "./_sections/api-demo-section";
import { FeaturesSection } from "./_sections/features-section";
import { HeroSection } from "./_sections/hero-section";
import { PricingSection } from "./_sections/pricing-section";

const HomePage = async () => {
  return (
    <div className="from-background via-background to-secondary/20 min-h-screen bg-linear-to-br">
      <LightRays
        count={8}
        color="rgba(240, 187, 59, 0.3)"
        blur={100}
        speed={10}
        length="30vh"
        className="absolute inset-0 z-40"
      />

      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <ApiDemoSection />
      <Footer />
    </div>
  );
};

export default HomePage;
